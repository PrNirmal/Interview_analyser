import { isRecord } from "../api/guards";
import { initials } from "./metrics";
import { loadWorkspace, questionsMatchGuide } from "./workspace";

const STORAGE_KEY = "interview-analyzer:preferences";

export type GuideSource = "bundled" | "custom";
export type MinimumConfidence = "any" | "low" | "medium" | "high";
export type QuoteLength = "short" | "medium" | "full";
export type DisagreementMode = "all" | "contradictions";

export interface AppPreferences {
  displayName: string;
  role: string;
  initials: string;
  workspaceName: string;
  guideSource: GuideSource;
  retrievalTopK: number;
  requireValidation: boolean;
  minimumConfidence: MinimumConfidence;
  showTimestamps: boolean;
  quoteLength: QuoteLength;
  disagreementMode: DisagreementMode;
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  displayName: "Research Lead",
  role: "Strategic Intelligence",
  initials: "RA",
  workspaceName: "Research Team Workspace",
  guideSource: "bundled",
  retrievalTopK: 5,
  requireValidation: false,
  minimumConfidence: "any",
  showTimestamps: true,
  quoteLength: "full",
  disagreementMode: "all",
};

const CONFIDENCE_RANK: Record<Exclude<MinimumConfidence, "any">, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const QUOTE_LIMITS: Record<QuoteLength, number | null> = {
  short: 180,
  medium: 420,
  full: null,
};

function cleanText(value: unknown, fallback: string, max: number): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed === "") return fallback;
  return trimmed.slice(0, max);
}

function cleanInitials(value: unknown, displayName: string): string {
  const source = typeof value === "string" ? value : "";
  const letters = source.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
  return letters || initials(displayName);
}

function cleanTopK(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 20) return DEFAULT_PREFERENCES.retrievalTopK;
  return parsed;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

export function normalizePreferences(value: unknown): AppPreferences {
  const record = isRecord(value) ? value : {};
  const displayName = cleanText(record.displayName, DEFAULT_PREFERENCES.displayName, 80);
  return {
    displayName,
    role: cleanText(record.role, DEFAULT_PREFERENCES.role, 80),
    initials: cleanInitials(record.initials, displayName),
    workspaceName: cleanText(record.workspaceName, DEFAULT_PREFERENCES.workspaceName, 80),
    guideSource: oneOf(record.guideSource, ["bundled", "custom"] as const, defaultGuideSource()),
    retrievalTopK: cleanTopK(record.retrievalTopK),
    requireValidation: record.requireValidation === true,
    minimumConfidence: oneOf(
      record.minimumConfidence,
      ["any", "low", "medium", "high"] as const,
      DEFAULT_PREFERENCES.minimumConfidence,
    ),
    showTimestamps: record.showTimestamps !== false,
    quoteLength: oneOf(
      record.quoteLength,
      ["short", "medium", "full"] as const,
      DEFAULT_PREFERENCES.quoteLength,
    ),
    disagreementMode: oneOf(
      record.disagreementMode,
      ["all", "contradictions"] as const,
      DEFAULT_PREFERENCES.disagreementMode,
    ),
  };
}

function defaultGuideSource(): GuideSource {
  try {
    return questionsMatchGuide(loadWorkspace().questions) ? "bundled" : "custom";
  } catch {
    return "bundled";
  }
}

export function loadPreferences(): AppPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_PREFERENCES, guideSource: defaultGuideSource() };
    }
    return normalizePreferences(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PREFERENCES, guideSource: defaultGuideSource() };
  }
}

export function savePreferences(preferences: AppPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function answerIsUsable(confidence: string, minimum: MinimumConfidence): boolean {
  if (minimum === "any") return true;
  const rank = CONFIDENCE_RANK[confidence.trim().toLowerCase() as Exclude<MinimumConfidence, "any">] ?? 0;
  return rank >= CONFIDENCE_RANK[minimum];
}

export function displayQuote(quote: string, length: QuoteLength): string {
  const trimmed = quote.trim();
  const limit = QUOTE_LIMITS[length];
  if (limit === null || trimmed.length <= limit) return trimmed;
  const slice = trimmed.slice(0, limit);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > limit * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trimEnd()}…`;
}
