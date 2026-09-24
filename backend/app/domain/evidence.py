from pydantic import BaseModel


class Evidence(BaseModel):
    evidence_id: str
    transcript_id: str
    expert: str
    timestamp: str
    speaker: str
    text: str