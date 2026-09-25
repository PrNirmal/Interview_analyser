"""Request and response schemas for custom guides and transcript uploads."""

from pydantic import BaseModel, Field


class GuideWriteRequest(BaseModel):
    """Questions to save as an interview guide file."""

    title: str = Field(
        description="Title written at the top of the guide.",
        min_length=1,
        max_length=200,
        examples=["European Robotic Surgery Market"],
    )
    questions: list[str] = Field(
        description="Interview questions, in the order they should be asked.",
        min_length=1,
        max_length=40,
    )


class GuideWriteResponse(BaseModel):
    """Saved interview guide the analysis API can read."""

    filename: str
    file_path: str
    title: str
    question_count: int
    questions: list[str]


class TranscriptUploadResponse(BaseModel):
    """A transcript saved under the data directory."""

    transcript_id: str
    expert: str
    role: str
    market: str
    filename: str
    file_path: str
