import { isFullAnalysisResponse, isRecord } from "../api/guards";
import type { FullAnalysisResponse } from "../types/analysis";

const STORAGE_KEY = "interview-analyzer:session";

export interface StoredTranscript {
  transcriptId: string;
  expert: string;
  market: string;
  role?: string;
  filePath?: string;
}

export interface AnalysisSession {
  result: FullAnalysisResponse;
  completedAt: string;
  guidePath: string;
  transcripts: StoredTranscript[];
}

function isStoredTranscript(value: unknown): value is StoredTranscript {
  if (!isRecord(value)) return false;
  if (
    typeof value.transcriptId !== "string" ||
    typeof value.expert !== "string" ||
    typeof value.market !== "string"
  ) {
    return false;
  }
  if (value.role !== undefined && typeof value.role !== "string") return false;
  if (value.filePath !== undefined && typeof value.filePath !== "string") return false;
  return true;
}

function isSession(value: unknown): value is AnalysisSession {
  if (!isRecord(value)) return false;
  return (
    isFullAnalysisResponse(value.result) &&
    typeof value.completedAt === "string" &&
    typeof value.guidePath === "string" &&
    Array.isArray(value.transcripts) &&
    value.transcripts.every(isStoredTranscript)
  );
}

export function loadSession(): AnalysisSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(session: AnalysisSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
