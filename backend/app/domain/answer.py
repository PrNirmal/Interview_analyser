from pydantic import BaseModel, Field


class EvidenceReference(BaseModel):
    segment_id: str
    timestamp: str
    quote: str
    question_id: str | None = None


class InterviewAnswer(BaseModel):
    answer: str = Field(
        description="Answer based only on the provided transcript evidence."
    )

    evidence: list[EvidenceReference] = Field(
        description="Evidence supporting the answer."
    )

    confidence: str = Field(
        description="Confidence: high, medium, or low."
    )