export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export interface UserFacingError {
  title: string;
  description: string;
}

const GENERIC_TITLE = "Analysis could not be completed.";
const GENERIC_DESCRIPTION = "Please check the interview files and try again.";

function looksLikeTrace(message: string): boolean {
  return message.includes("Traceback") || message.includes('File "');
}

export function userFacingError(error: ApiError): UserFacingError {
  if (looksLikeTrace(error.message)) {
    return { title: GENERIC_TITLE, description: GENERIC_DESCRIPTION };
  }

  switch (error.status) {
    case 0:
      return {
        title: "API unavailable",
        description: "Cannot connect to the analysis server.",
      };
    case 408:
      return {
        title: GENERIC_TITLE,
        description:
          "The request timed out before the analysis finished. Please try again.",
      };
    case 401:
    case 403:
      return {
        title: GENERIC_TITLE,
        description: "You do not have permission to run this analysis.",
      };
    case 404:
      return {
        title: GENERIC_TITLE,
        description: error.message || "A required interview file could not be found.",
      };
    case 422:
      return {
        title: "Request validation failed",
        description:
          "The analysis request was rejected. Please check the selected interviews.",
      };
    case 500:
      return {
        title: "Backend analysis failed",
        description: "The analysis service encountered an internal error.",
      };
    case 501:
      return {
        title: GENERIC_TITLE,
        description: error.message || GENERIC_DESCRIPTION,
      };
    case 503:
      return {
        title: "Backend unavailable",
        description: "The analysis service is unavailable. Please try again shortly.",
      };
    case 400:
      return {
        title: GENERIC_TITLE,
        description: error.message || GENERIC_DESCRIPTION,
      };
    default:
      return {
        title: GENERIC_TITLE,
        description: GENERIC_DESCRIPTION,
      };
  }
}
