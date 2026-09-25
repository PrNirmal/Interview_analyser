import type {
  AskAcrossInterviewsResponse,
  CrossExpertAnalysis,
  EvidenceReference,
  ExpertPosition,
  FullAnalysisResponse,
  HealthResponse,
  InterviewAnalysis,
  InterviewQuestionAnswer,
  QuestionEvidence,
} from "../types/analysis";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isEvidence(value: unknown): value is EvidenceReference {
  if (!isRecord(value)) return false;
  if (!isString(value.segment_id) || !isString(value.timestamp) || !isString(value.quote)) {
    return false;
  }
  if (
    value.question_id !== undefined &&
    value.question_id !== null &&
    !isString(value.question_id)
  ) {
    return false;
  }
  return true;
}

function isAnswer(value: unknown): value is InterviewQuestionAnswer {
  if (!isRecord(value)) return false;
  return (
    isString(value.question_id) &&
    isString(value.question) &&
    isString(value.answer) &&
    isString(value.confidence) &&
    Array.isArray(value.evidence) &&
    value.evidence.every(isEvidence)
  );
}

function isExpertAnalysis(value: unknown): value is InterviewAnalysis {
  if (!isRecord(value)) return false;
  return (
    isString(value.transcript_id) &&
    isString(value.expert) &&
    isString(value.role) &&
    isString(value.market) &&
    Array.isArray(value.answers) &&
    value.answers.every(isAnswer)
  );
}

function isExpertPosition(value: unknown): value is ExpertPosition {
  if (!isRecord(value)) return false;
  return (
    isString(value.expert) &&
    isString(value.market) &&
    isString(value.position) &&
    Array.isArray(value.evidence_segment_ids) &&
    value.evidence_segment_ids.every(isString)
  );
}

function isCrossAnalysis(value: unknown): value is CrossExpertAnalysis {
  if (!isRecord(value)) return false;
  const themes = value.common_themes;
  const differences = value.differences;
  const disagreements = value.disagreements;
  if (!Array.isArray(themes) || !Array.isArray(differences) || !Array.isArray(disagreements)) {
    return false;
  }

  const themesOk = themes.every((theme) => {
    if (!isRecord(theme)) return false;
    return (
      isString(theme.theme) &&
      isString(theme.description) &&
      Array.isArray(theme.experts) &&
      theme.experts.every(isExpertPosition)
    );
  });

  const positionsOk = (items: unknown[]) =>
    items.every((item) => {
      if (!isRecord(item)) return false;
      return (
        isString(item.topic) &&
        isString(item.description) &&
        Array.isArray(item.expert_positions) &&
        item.expert_positions.every(isExpertPosition)
      );
    });

  return themesOk && positionsOk(differences) && positionsOk(disagreements);
}

export function isFullAnalysisResponse(value: unknown): value is FullAnalysisResponse {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.experts) || !value.experts.every(isExpertAnalysis)) return false;
  if (!isCrossAnalysis(value.cross_analysis)) return false;
  if (!isRecord(value.validation)) return false;
  return typeof value.validation.valid === "boolean" && isString(value.validation.message);
}

export function isHealthResponse(value: unknown): value is HealthResponse {
  if (!isRecord(value)) return false;
  return isString(value.status) && isString(value.service);
}

function isQuestionEvidence(value: unknown): value is QuestionEvidence {
  if (!isEvidence(value)) return false;
  const record = value as unknown as Record<string, unknown>;
  return (
    isString(record.expert) &&
    isString(record.role) &&
    isString(record.market) &&
    isString(record.speaker)
  );
}

export function isQuestionResponse(value: unknown): value is AskAcrossInterviewsResponse {
  if (!isRecord(value)) return false;
  if (!isString(value.question) || !isString(value.answer) || !isString(value.confidence)) {
    return false;
  }
  if (!Array.isArray(value.evidence)) return false;
  return value.evidence.every(isQuestionEvidence);
}
