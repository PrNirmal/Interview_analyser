import { ApiError } from "./errors";
import { isRecord } from "./guards";

const DEFAULT_ANALYSIS_TIMEOUT_MS = 20 * 60 * 1000;
const HEALTH_TIMEOUT_MS = 8000;

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (!configured || configured.trim() === "") {
    throw new ApiError(
      0,
      "MISSING_API_BASE_URL",
      "VITE_API_BASE_URL is not configured.",
    );
  }
  return configured.replace(/\/$/, "");
}

export function getAnalysisTimeoutMs(): number {
  const raw = import.meta.env.VITE_API_TIMEOUT_MS;
  if (!raw) return DEFAULT_ANALYSIS_TIMEOUT_MS;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_ANALYSIS_TIMEOUT_MS;
  return parsed;
}

interface ParsedError {
  code: string;
  message: string;
}

function readErrorObject(value: unknown): ParsedError | null {
  if (!isRecord(value)) return null;
  if (typeof value.code !== "string" || typeof value.message !== "string") return null;
  return { code: value.code, message: value.message };
}

export function parseErrorPayload(status: number, payload: unknown): ApiError {
  if (isRecord(payload)) {
    const direct = readErrorObject(payload.error);
    if (direct) return new ApiError(status, direct.code, direct.message);

    const detail = payload.detail;
    if (isRecord(detail)) {
      const nested = readErrorObject(detail.error);
      if (nested) return new ApiError(status, nested.code, nested.message);
    }

    if (Array.isArray(detail)) {
      const messages = detail.flatMap((item) => {
        if (isRecord(item) && typeof item.msg === "string") return [item.msg];
        return [];
      });
      if (messages.length > 0) {
        return new ApiError(status, "VALIDATION_ERROR", messages.join(" "));
      }
    }

    if (typeof detail === "string" && detail.trim() !== "") {
      return new ApiError(status, "HTTP_ERROR", detail);
    }
  }

  return new ApiError(
    status,
    "HTTP_ERROR",
    "The analysis service returned an unexpected error.",
  );
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.trim() === "") return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function toApiError(error: unknown, timeoutMs: number): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return new ApiError(408, "TIMEOUT", `The request timed out after ${timeoutMs}ms.`);
  }
  if (error instanceof Error && error.name === "TimeoutError") {
    return new ApiError(408, "TIMEOUT", `The request timed out after ${timeoutMs}ms.`);
  }
  return new ApiError(0, "NETWORK_ERROR", "The analysis service could not be reached.");
}

export async function apiGet(path: string, timeoutMs = HEALTH_TIMEOUT_MS): Promise<unknown> {
  return request(path, { method: "GET" }, timeoutMs);
}

export async function apiPost(
  path: string,
  body: unknown,
  timeoutMs = getAnalysisTimeoutMs(),
): Promise<unknown> {
  return request(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    },
    timeoutMs,
  );
}

function timeoutSignal(timeoutMs: number): AbortSignal {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(timeoutMs);
  }
  const controller = new AbortController();
  window.setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

async function request(path: string, init: RequestInit, timeoutMs: number): Promise<unknown> {
  const baseUrl = getApiBaseUrl();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...init.headers,
      },
      signal: timeoutSignal(timeoutMs),
    });
  } catch (error) {
    throw toApiError(error, timeoutMs);
  }

  const payload = await readBody(response);
  if (!response.ok) {
    if (payload === null) {
      throw new ApiError(
        response.status,
        "HTTP_ERROR",
        "The analysis service returned an unexpected error.",
      );
    }
    throw parseErrorPayload(response.status, payload);
  }

  if (payload === null) {
    throw new ApiError(
      502,
      "MALFORMED_RESPONSE",
      "The analysis service returned a response that could not be read.",
    );
  }

  return payload;
}
