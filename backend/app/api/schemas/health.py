"""Health check response schema."""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Service liveness payload. Does not report model readiness."""

    status: str
    service: str
