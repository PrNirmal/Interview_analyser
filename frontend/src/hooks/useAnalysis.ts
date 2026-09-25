import { useCallback, useEffect, useRef, useState } from "react";
import { healthCheck, runFullAnalysis } from "../api/analysis";
import { saveCustomGuide } from "../api/corpus";
import { ApiError } from "../api/errors";
import { interviewGuide, transcriptCatalog } from "../data/catalog";
import type { TranscriptCatalogItem } from "../data/catalog";
import { clearStoredSession, loadSession, saveSession } from "../lib/session";
import type { AnalysisSession } from "../lib/session";
import type { ResolvedEvidence } from "../lib/evidence";
import type { FullAnalysisRequest } from "../types/analysis";
import { loadPreferences } from "../lib/preferences";
import { loadWorkspace, questionsMatchGuide, saveWorkspace } from "../lib/workspace";
import { usePreferences } from "../context/PreferencesContext";

export const PROGRESS_LABELS = [
  "Preparing interviews...",
  "Analyzing expert responses...",
  "Extracting evidence...",
  "Comparing expert positions...",
  "Validating findings...",
] as const;

export type AnalysisStatus = "idle" | "running" | "success" | "error";
export type HealthState = "unknown" | "ready" | "unavailable";

export interface AnalysisController {
  guideFilename: string;
  guideTitle: string;
  guideQuestionCount: number;
  guideQuestions: readonly string[];
  transcripts: readonly TranscriptCatalogItem[];
  selectedIds: ReadonlySet<string>;
  status: AnalysisStatus;
  progressLabel: string;
  session: AnalysisSession | null;
  error: ApiError | null;
  health: HealthState;
  evidence: ResolvedEvidence | null;
  toggleTranscript: (transcriptId: string) => void;
  addQuestion: (question: string) => void;
  removeQuestion: (index: number) => void;
  addTranscript: (transcript: TranscriptCatalogItem) => void;
  removeTranscript: (transcriptId: string) => void;
  useBundledGuide: () => void;
  keepCustomGuide: () => void;
  clearSession: () => void;
  resetWorkspace: () => void;
  run: () => Promise<void>;
  openEvidence: (evidence: ResolvedEvidence) => void;
  closeEvidence: () => void;
  showEvidenceAt: (index: number) => void;
}

interface ControllerOptions {
  onComplete?: () => void;
}

function buildRequest(
  guidePath: string,
  transcripts: readonly TranscriptCatalogItem[],
  selectedIds: ReadonlySet<string>,
  retrievalTopK: number,
): FullAnalysisRequest {
  return {
    guide_path: guidePath,
    retrieval_top_k: retrievalTopK,
    transcripts: transcripts
      .filter((item) => selectedIds.has(item.transcriptId))
      .map((item) => ({
        transcript_id: item.transcriptId,
        expert: item.expert,
        role: item.role,
        market: item.market,
        file_path: item.filePath,
      })),
  };
}

function normalizeQuestion(question: string): string {
  return question.replace(/^\d+\.\s+/, "").replace(/\s+/g, " ").trim();
}

export function useAnalysisController(options: ControllerOptions = {}): AnalysisController {
  const onComplete = options.onComplete;
  const { preferences, updatePreferences } = usePreferences();
  const [questions, setQuestions] = useState<string[]>(() => {
    const saved = loadWorkspace().questions;
    return loadPreferences().guideSource === "bundled" ? [...interviewGuide.questions] : saved;
  });
  const [transcripts, setTranscripts] = useState<TranscriptCatalogItem[]>(
    () => loadWorkspace().transcripts,
  );
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () => new Set(loadWorkspace().transcripts.map((item) => item.transcriptId)),
  );
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [progressLabel, setProgressLabel] = useState("");
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [health, setHealth] = useState<HealthState>("unknown");
  const [evidence, setEvidence] = useState<ResolvedEvidence | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    saveWorkspace(questions, transcripts);
  }, [questions, transcripts]);

  useEffect(() => {
    if (preferences.guideSource === "bundled" && !questionsMatchGuide(questions)) {
      updatePreferences({ guideSource: "custom" });
    }
  }, [preferences.guideSource, questions, updatePreferences]);

  useEffect(() => {
    const stored = loadSession();
    if (stored) {
      setSession(stored);
      setStatus("success");
      if (stored.transcripts.length > 0) {
        setSelectedIds(new Set(stored.transcripts.map((item) => item.transcriptId)));
      }
    }
  }, []);

  useEffect(() => {
    if (status === "running") return undefined;
    let active = true;
    const check = () => {
      healthCheck()
        .then((result) => {
          if (!active) return;
          setHealth(result.status === "ok" ? "ready" : "unavailable");
        })
        .catch(() => {
          if (active) setHealth("unavailable");
        });
    };
    check();
    const timer = window.setInterval(check, 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [status]);

  useEffect(() => {
    if (status !== "running") return undefined;
    let index = 0;
    setProgressLabel(PROGRESS_LABELS[0]);
    const timer = window.setInterval(() => {
      index = (index + 1) % PROGRESS_LABELS.length;
      const next = PROGRESS_LABELS[index] ?? PROGRESS_LABELS[0];
      setProgressLabel(next);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [status]);

  const toggleTranscript = useCallback((transcriptId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(transcriptId)) next.delete(transcriptId);
      else next.add(transcriptId);
      return next;
    });
  }, []);

  const addQuestion = useCallback((question: string) => {
    const cleaned = normalizeQuestion(question);
    if (!cleaned) return;
    setQuestions((current) => [...current, cleaned]);
  }, []);

  const removeQuestion = useCallback((index: number) => {
    setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }, []);

  const addTranscript = useCallback((transcript: TranscriptCatalogItem) => {
    setTranscripts((current) => {
      if (current.some((item) => item.transcriptId === transcript.transcriptId)) return current;
      return [...current, transcript];
    });
    setSelectedIds((current) => new Set(current).add(transcript.transcriptId));
  }, []);

  const removeTranscript = useCallback((transcriptId: string) => {
    setTranscripts((current) => current.filter((item) => item.transcriptId !== transcriptId));
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(transcriptId);
      return next;
    });
  }, []);

  const useBundledGuide = useCallback(() => {
    setQuestions([...interviewGuide.questions]);
    updatePreferences({ guideSource: "bundled" });
  }, [updatePreferences]);

  const keepCustomGuide = useCallback(() => {
    updatePreferences({ guideSource: "custom" });
  }, [updatePreferences]);

  const clearSession = useCallback(() => {
    clearStoredSession();
    setSession(null);
    setStatus("idle");
    setError(null);
    setEvidence(null);
  }, []);

  const resetWorkspace = useCallback(() => {
    setQuestions([...interviewGuide.questions]);
    setTranscripts([...transcriptCatalog]);
    setSelectedIds(new Set(transcriptCatalog.map((item) => item.transcriptId)));
    updatePreferences({ guideSource: "bundled" });
  }, [updatePreferences]);

  const run = useCallback(async () => {
    if (inFlight.current) return;
    if (selectedIds.size === 0 || questions.length === 0) return;

    inFlight.current = true;
    setError(null);
    setProgressLabel(PROGRESS_LABELS[0]);
    setStatus("running");

    try {
      const guidePath = questionsMatchGuide(questions)
        ? interviewGuide.filePath
        : (await saveCustomGuide(interviewGuide.title, questions)).filePath;
      const request = buildRequest(
        guidePath,
        transcripts,
        selectedIds,
        loadPreferences().retrievalTopK,
      );
      const result = await runFullAnalysis(request);
      const nextSession: AnalysisSession = {
        result,
        completedAt: new Date().toISOString(),
        guidePath: request.guide_path,
        transcripts: request.transcripts.map((item) => ({
          transcriptId: item.transcript_id,
          expert: item.expert,
          role: item.role,
          market: item.market,
          filePath: item.file_path,
        })),
      };
      saveSession(nextSession);
      setSession(nextSession);
      setStatus("success");
      onComplete?.();
    } catch (caught) {
      const apiError =
        caught instanceof ApiError
          ? caught
          : new ApiError(0, "NETWORK_ERROR", "The analysis service could not be reached.");
      setError(apiError);
      setStatus("error");
    } finally {
      inFlight.current = false;
    }
  }, [onComplete, questions, selectedIds, transcripts]);

  const openEvidence = useCallback((next: ResolvedEvidence) => {
    setEvidence(next);
  }, []);

  const closeEvidence = useCallback(() => {
    setEvidence(null);
  }, []);

  const showEvidenceAt = useCallback((index: number) => {
    setEvidence((current) => {
      if (!current) return current;
      if (index < 0 || index >= current.items.length) return current;
      return { ...current, index };
    });
  }, []);

  return {
    guideFilename: questionsMatchGuide(questions) ? interviewGuide.filename : "Custom guide",
    guideTitle: interviewGuide.title,
    guideQuestionCount: questions.length,
    guideQuestions: questions,
    transcripts,
    selectedIds,
    status,
    progressLabel,
    session,
    error,
    health,
    evidence,
    toggleTranscript,
    addQuestion,
    removeQuestion,
    addTranscript,
    removeTranscript,
    useBundledGuide,
    keepCustomGuide,
    clearSession,
    resetWorkspace,
    run,
    openEvidence,
    closeEvidence,
    showEvidenceAt,
  };
}
