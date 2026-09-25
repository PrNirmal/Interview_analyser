"""
API request and response schemas for interview analysis.

These schemas define the HTTP API contract. They mirror the existing
domain models to ensure consistency, but are separate so the API
surface can evolve independently of the domain layer.
"""

from pydantic import BaseModel, Field

# ============================================================
# REQUEST SCHEMAS
# ============================================================


class TranscriptRequest(BaseModel):
    """A single transcript to analyze."""

    transcript_id: str = Field(
        description="Unique identifier for the transcript.",
        examples=["Transcript_1_France"],
    )

    expert: str = Field(
        description="Name of the expert being interviewed.",
        examples=["Dr. Jean Martin"],
    )

    role: str = Field(
        description="Professional role of the expert.",
        examples=["Head of Urology"],
    )

    market: str = Field(
        description="Geographic market of the expert.",
        examples=["France"],
    )

    file_path: str = Field(
        description="Path to the transcript file, relative to the project data directory.",
        examples=["data/Transcript_1_France.txt"],
    )


class FullAnalysisRequest(BaseModel):
    """Request body for a full interview analysis run."""

    guide_path: str = Field(
        description="Path to the interview guide file.",
        examples=["data/Interview_Guide.txt"],
    )

    transcripts: list[TranscriptRequest] = Field(
        description="List of transcripts to analyze.",
        min_length=1,
    )

    retrieval_top_k: int | None = Field(
        default=None,
        ge=1,
        le=20,
        description=(
            "How many transcript passages to retrieve for each question. "
            "Uses the server default when omitted."
        ),
    )


class QuestionRequest(BaseModel):
    """A free-form question asked across the supplied transcripts."""

    question: str = Field(
        description="Question to answer from the interview transcripts.",
        min_length=1,
        examples=["Who said capital budget approval is the biggest issue?"],
    )

    transcripts: list[TranscriptRequest] = Field(
        description="Transcripts to search. These are the interviews in the current analysis.",
        min_length=1,
    )


# ============================================================
# RESPONSE SCHEMAS — Individual Expert Analysis
# ============================================================


class EvidenceReferenceResponse(BaseModel):
    """A single piece of evidence supporting an answer."""

    segment_id: str
    timestamp: str
    quote: str
    question_id: str | None = None


class InterviewQuestionAnswerResponse(BaseModel):
    """An answer to a single interview question."""

    question_id: str
    question: str
    answer: str
    evidence: list[EvidenceReferenceResponse]
    confidence: str


class InterviewAnalysisResponse(BaseModel):
    """Analysis results for a single expert interview."""

    transcript_id: str
    expert: str
    role: str
    market: str
    answers: list[InterviewQuestionAnswerResponse]


# ============================================================
# RESPONSE SCHEMAS — Cross-Expert Analysis
# ============================================================


class ExpertPositionResponse(BaseModel):
    """An expert's position within a theme or disagreement."""

    expert: str
    market: str
    position: str
    evidence_segment_ids: list[str]


class CommonThemeResponse(BaseModel):
    """A theme shared across multiple experts."""

    theme: str
    description: str
    experts: list[ExpertPositionResponse]


class DifferenceResponse(BaseModel):
    """A difference identified across experts."""

    topic: str
    description: str
    expert_positions: list[ExpertPositionResponse]


class DisagreementResponse(BaseModel):
    """A disagreement identified between experts."""

    topic: str
    description: str
    expert_positions: list[ExpertPositionResponse]


class CrossExpertAnalysisResponse(BaseModel):
    """Cross-expert analysis results."""

    common_themes: list[CommonThemeResponse]
    differences: list[DifferenceResponse]
    disagreements: list[DisagreementResponse]


# ============================================================
# RESPONSE SCHEMAS — Validation
# ============================================================


class ValidationResponse(BaseModel):
    """Validation status of cross-expert analysis."""

    valid: bool
    message: str


# ============================================================
# RESPONSE SCHEMAS — Full Analysis Result
# ============================================================


class FullAnalysisResponse(BaseModel):
    """Complete analysis response including all experts and cross-analysis."""

    experts: list[InterviewAnalysisResponse]
    cross_analysis: CrossExpertAnalysisResponse
    validation: ValidationResponse


class QuestionEvidenceResponse(BaseModel):
    """Evidence for a cross-interview answer, including who said it."""

    segment_id: str
    timestamp: str
    quote: str
    expert: str
    role: str
    market: str
    speaker: str


class QuestionResponse(BaseModel):
    """Answer to a question asked across interview transcripts."""

    question: str
    answer: str
    confidence: str
    evidence: list[QuestionEvidenceResponse]


# ============================================================
# ERROR SCHEMAS
# ============================================================


class ErrorDetail(BaseModel):
    """Structured error response."""

    code: str
    message: str


class ErrorResponse(BaseModel):
    """API error envelope."""

    error: ErrorDetail
