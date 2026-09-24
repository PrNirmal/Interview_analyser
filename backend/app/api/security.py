"""File-path checks for analysis requests.

Callers may only read files under the project data and tests directories.
"""

from __future__ import annotations

import logging
from pathlib import Path

from app.api.errors import api_error

logger = logging.getLogger(__name__)

# backend/app/api/security.py -> backend/
_PROJECT_ROOT = Path(__file__).resolve().parents[2]

_ALLOWED_ROOTS = [
    _PROJECT_ROOT / "data",
    _PROJECT_ROOT / "tests",
]


def validate_file_path(file_path: str) -> Path:
    """
    Validate that a file path:
        1. Resolves to within an allowed directory.
        2. Actually exists on disk.
        3. Is a regular file.

    Returns the resolved absolute path.
    """
    resolved = (_PROJECT_ROOT / file_path).resolve()

    is_allowed = any(
        resolved == root or root in resolved.parents
        for root in _ALLOWED_ROOTS
    )

    if not is_allowed:
        logger.warning(
            "Blocked file access outside allowed directories: %s",
            file_path,
        )
        raise api_error(
            400,
            "INVALID_PATH",
            f"File path is not within the allowed data directories: {file_path}",
        )

    if not resolved.exists():
        raise api_error(
            404,
            "FILE_NOT_FOUND",
            f"File not found: {file_path}",
        )

    if not resolved.is_file():
        raise api_error(
            400,
            "INVALID_PATH",
            f"Path is not a regular file: {file_path}",
        )

    return resolved
