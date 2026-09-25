"""Health check response schema."""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Service liveness payload. Does not report model readiness or secrets."""

    status: str
    service: str
    llm_provider: str = ""
    llm_model: str = ""
    embedding_provider: str = ""
    embedding_model: str = ""
