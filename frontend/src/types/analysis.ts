/**
 * Types for the Interview Analyzer HTTP API.
 *
 * These match the FastAPI schemas in backend/app/api/schemas/analysis.py
 * and backend/app/api/schemas/health.py. Field names are the API names.
 */

export interface TranscriptRequest {
  transcript_id: string;
  expert: string;
  role: string;
  market: string;
  file_path: string;
}

export interface FullAnalysisRequest {
  guide_path: string;
  transcripts: TranscriptRequest[];
  retrieval_top_k?: number;
}

export interface EvidenceReference {
  segment_id: string;
  timestamp: string;
  quote: string;
  question_id?: string | null;
}

export interface InterviewQuestionAnswer {
  question_id: string;
  question: string;
  answer: string;
  evidence: EvidenceReference[];
  confidence: string;
}

export interface InterviewAnalysis {
  transcript_id: string;
  expert: string;
  role: string;
  market: string;
  answers: InterviewQuestionAnswer[];
}

export interface ExpertPosition {
  expert: string;
  market: string;
  position: string;
  evidence_segment_ids: string[];
}

export interface CommonTheme {
  theme: string;
  description: string;
  experts: ExpertPosition[];
}

export interface Difference {
  topic: string;
  description: string;
  expert_positions: ExpertPosition[];
}

export interface Disagreement {
  topic: string;
  description: string;
  expert_positions: ExpertPosition[];
}

export interface CrossExpertAnalysis {
  common_themes: CommonTheme[];
  differences: Difference[];
  disagreements: Disagreement[];
}

export interface Validation {
  valid: boolean;
  message: string;
}

export interface FullAnalysisResponse {
  experts: InterviewAnalysis[];
  cross_analysis: CrossExpertAnalysis;
  validation: Validation;
}

export interface HealthResponse {
  status: string;
  service: string;
  llm_provider?: string;
  llm_model?: string;
  embedding_provider?: string;
  embedding_model?: string;
}

export interface QuestionEvidence extends EvidenceReference {
  expert: string;
  role: string;
  market: string;
  speaker: string;
}

export interface AskAcrossInterviewsRequest {
  question: string;
  transcripts: TranscriptRequest[];
}

export interface AskAcrossInterviewsResponse {
  question: string;
  answer: string;
  confidence: string;
  evidence: QuestionEvidence[];
}
