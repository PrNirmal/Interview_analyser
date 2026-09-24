from pydantic import BaseModel


class TranscriptMetadata(BaseModel):
    transcript_id: str
    expert: str
    role: str
    market: str


class TranscriptSegment(BaseModel):
    segment_id: str
    transcript_id: str
    expert: str
    role: str
    market: str
    timestamp: str
    speaker: str
    text: str