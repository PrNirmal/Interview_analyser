import { apiPost, apiPostForm } from "./client";
import { ApiError } from "./errors";
import { isRecord } from "./guards";
import type { TranscriptCatalogItem } from "../data/catalog";

export interface SavedGuide {
  filename: string;
  filePath: string;
  title: string;
  questionCount: number;
  questions: string[];
}

function isSavedGuide(value: unknown): value is {
  filename: string;
  file_path: string;
  title: string;
  question_count: number;
  questions: string[];
} {
  if (!isRecord(value)) return false;
  return (
    typeof value.filename === "string" &&
    typeof value.file_path === "string" &&
    typeof value.title === "string" &&
    typeof value.question_count === "number" &&
    Array.isArray(value.questions) &&
    value.questions.every((question) => typeof question === "string")
  );
}

function isUploadedTranscript(value: unknown): value is {
  transcript_id: string;
  expert: string;
  role: string;
  market: string;
  filename: string;
  file_path: string;
} {
  if (!isRecord(value)) return false;
  return (
    typeof value.transcript_id === "string" &&
    typeof value.expert === "string" &&
    typeof value.role === "string" &&
    typeof value.market === "string" &&
    typeof value.filename === "string" &&
    typeof value.file_path === "string"
  );
}

export async function saveCustomGuide(title: string, questions: readonly string[]): Promise<SavedGuide> {
  const payload = await apiPost("/api/v1/corpus/guide", { title, questions });
  if (!isSavedGuide(payload)) {
    throw new ApiError(502, "MALFORMED_RESPONSE", "The guide could not be saved.");
  }
  return {
    filename: payload.filename,
    filePath: payload.file_path,
    title: payload.title,
    questionCount: payload.question_count,
    questions: payload.questions,
  };
}

export async function uploadTranscript(input: {
  file: File;
  expert: string;
  role: string;
  market: string;
}): Promise<TranscriptCatalogItem> {
  const body = new FormData();
  body.append("file", input.file);
  body.append("expert", input.expert.trim());
  body.append("role", input.role.trim());
  body.append("market", input.market.trim());

  const payload = await apiPostForm("/api/v1/corpus/transcripts", body);
  if (!isUploadedTranscript(payload)) {
    throw new ApiError(502, "MALFORMED_RESPONSE", "The transcript could not be saved.");
  }

  return {
    transcriptId: payload.transcript_id,
    expert: payload.expert,
    role: payload.role,
    market: payload.market,
    filename: payload.filename,
    filePath: payload.file_path,
  };
}
