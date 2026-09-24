"""
Health check endpoint.

This endpoint must remain lightweight and must NOT trigger model loading.
"""

from fastapi import APIRouter

from app.api.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])


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
    )
