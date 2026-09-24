"""HTTP error helpers for the API layer."""

from __future__ import annotations

from fastapi import HTTPException


def api_error(status_code: int, code: str, message: str) -> HTTPException:
    """Build an HTTPException with the API error envelope."""
    return HTTPException(
        status_code=status_code,
        detail={
            "error": {
                "code": code,
                "message": message,
            }
        },
    )
