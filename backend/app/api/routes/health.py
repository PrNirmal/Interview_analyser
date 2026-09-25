"""
Health check endpoint.

This endpoint must remain lightweight and must NOT trigger model loading.
"""

from fastapi import APIRouter

from app.api.schemas.health import HealthResponse
from app.core.config import settings

router = APIRouter(tags=["Health"])


def _active_llm_model() -> str:
    if settings.llm_provider.lower() == "huggingface":
        return settings.hf_llm_model
    return settings.llm_model


def _active_embedding_model() -> str:
    if settings.embedding_provider.lower() == "huggingface":
        return settings.hf_embedding_model
    return settings.embedding_model


@router.get(
    "/health",
    summary="Health check",
    description="Returns the service health status. Does not load any models.",
    response_model=HealthResponse,
)
def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="interview-analyzer",
        llm_provider=settings.llm_provider,
        llm_model=_active_llm_model(),
        embedding_provider=settings.embedding_provider,
        embedding_model=_active_embedding_model(),
    )
