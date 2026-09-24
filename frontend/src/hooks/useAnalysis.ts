import { useCallback, useEffect, useRef, useState } from "react";
import { healthCheck, runFullAnalysis } from "../api/analysis";
import { ApiError } from "../api/errors";
import { interviewGuide, transcriptCatalog } from "../data/catalog";
import type { TranscriptCatalogItem } from "../data/catalog";
import { loadSession, saveSession } from "../lib/session";
import type { AnalysisSession } from "../lib/session";
import type { ResolvedEvidence } from "../lib/evidence";
import type { FullAnalysisRequest } from "../types/analysis";

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
  run: () => Promise<void>;
  openEvidence: (evidence: ResolvedEvidence) => void;
  closeEvidence: () => void;
  showEvidenceAt: (index: number) => void;
}

interface ControllerOptions {
  onComplete?: () => void;
}

function buildRequest(selectedIds: ReadonlySet<string>): FullAnalysisRequest {
  return {
    guide_path: interviewGuide.filePath,
    transcripts: transcriptCatalog
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

export function useAnalysisController(options: ControllerOptions = {}): AnalysisController {
  const onComplete = options.onComplete;
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () => new Set(transcriptCatalog.map((item) => item.transcriptId)),
  );
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [progressLabel, setProgressLabel] = useState("");
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [health, setHealth] = useState<HealthState>("unknown");
  const [evidence, setEvidence] = useState<ResolvedEvidence | null>(null);
  const inFlight = useRef(false);

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
    let active = true;
    healthCheck()
      .then((result) => {
        if (!active) return;
        setHealth(result.status === "ok" ? "ready" : "unavailable");
      })
      .catch(() => {
        if (active) setHealth("unavailable");
      });
    return () => {
      active = false;
    };
  }, []);

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

  const run = useCallback(async () => {
    if (inFlight.current) return;
    if (selectedIds.size === 0) return;

    inFlight.current = true;
    setError(null);
    setProgressLabel(PROGRESS_LABELS[0]);
    setStatus("running");

    try {
      const request = buildRequest(selectedIds);
      const result = await runFullAnalysis(request);
      const nextSession: AnalysisSession = {
        result,
        completedAt: new Date().toISOString(),
        guidePath: request.guide_path,
        transcripts: request.transcripts.map((item) => ({
          transcriptId: item.transcript_id,
          expert: item.expert,
          market: item.market,
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
  }, [onComplete, selectedIds]);

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
    guideFilename: interviewGuide.filename,
    guideTitle: interviewGuide.title,
    guideQuestionCount: interviewGuide.questionCount,
    guideQuestions: interviewGuide.questions,
    transcripts: transcriptCatalog,
    selectedIds,
    status,
    progressLabel,
    session,
    error,
    health,
    evidence,
    toggleTranscript,
    run,
    openEvidence,
    closeEvidence,
    showEvidenceAt,
  };
}
