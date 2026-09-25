import { isRecord } from "../api/guards";
import { interviewGuide, transcriptCatalog, type TranscriptCatalogItem } from "../data/catalog";

const STORAGE_KEY = "interview-analyzer:workspace";

export interface WorkspaceState {
  questions: string[];
  transcripts: TranscriptCatalogItem[];
}

function isQuestionList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "string" && item.trim() !== "")
  );
}

function isUploadedItem(value: unknown): value is TranscriptCatalogItem {
  if (!isRecord(value)) return false;
  return (
    typeof value.transcriptId === "string" &&
    typeof value.expert === "string" &&
    typeof value.role === "string" &&
    typeof value.market === "string" &&
    typeof value.filename === "string" &&
    typeof value.filePath === "string" &&
    value.filePath.startsWith("data/uploads/") &&
    !value.filePath.includes("..")
  );
}

export function isUploadedTranscript(item: TranscriptCatalogItem): boolean {
  return item.filePath.startsWith("data/uploads/");
}

export function questionsMatchGuide(questions: readonly string[]): boolean {
  return (
    questions.length === interviewGuide.questions.length &&
    questions.every((question, index) => question === interviewGuide.questions[index])
  );
}

export function loadWorkspace(): WorkspaceState {
  const defaults: WorkspaceState = {
    questions: [...interviewGuide.questions],
    transcripts: [...transcriptCatalog],
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return defaults;

    const questions = isQuestionList(parsed.questions)
      ? parsed.questions.map((question) => question.trim())
      : defaults.questions;

    const uploads = Array.isArray(parsed.uploads) ? parsed.uploads.filter(isUploadedItem) : [];
    const known = new Set(transcriptCatalog.map((item) => item.transcriptId));
    const transcripts = [
      ...transcriptCatalog,
      ...uploads.filter((item) => !known.has(item.transcriptId)),
    ];

    return { questions, transcripts };
  } catch {
    return defaults;
  }
}

export function saveWorkspace(questions: readonly string[], transcripts: readonly TranscriptCatalogItem[]): void {
  const uploads = transcripts.filter(isUploadedTranscript);
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      questions,
      uploads,
    }),
  );
}
