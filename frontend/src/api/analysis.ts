import { apiGet, apiPost } from "./client";
import { ApiError } from "./errors";
import { isFullAnalysisResponse, isHealthResponse } from "./guards";
import type {
  AskAcrossInterviewsRequest,
  AskAcrossInterviewsResponse,
  FullAnalysisRequest,
  FullAnalysisResponse,
  HealthResponse,
} from "../types/analysis";

export async function healthCheck(): Promise<HealthResponse> {
  const payload = await apiGet("/health");
  if (!isHealthResponse(payload)) {
    throw new ApiError(
      502,
      "MALFORMED_RESPONSE",
      "The analysis service returned a response that could not be read.",
    );
  }
  return payload;
}

export async function runFullAnalysis(
  request: FullAnalysisRequest,
): Promise<FullAnalysisResponse> {
  const payload = await apiPost("/api/v1/analysis/full", request);
  if (!isFullAnalysisResponse(payload)) {
    throw new ApiError(
      502,
      "MALFORMED_RESPONSE",
      "The analysis service returned a response that could not be read.",
    );
  }
  return payload;
}

/**
 * Question answering is not part of the current API.
 * This function is the integration point for a future endpoint.
 * It never synthesizes an answer.
 */
export async function askAcrossInterviews(
  request: AskAcrossInterviewsRequest,
): Promise<AskAcrossInterviewsResponse> {
  const question = request.question.trim();
  if (question === "") {
    throw new ApiError(
      400,
      "EMPTY_QUESTION",
      "Enter a question to ask across the analyzed interviews.",
    );
  }

  throw new ApiError(
    501,
    "QUESTION_ENDPOINT_UNAVAILABLE",
    "The analysis API does not include a question endpoint, so no answer was generated.",
  );
}
