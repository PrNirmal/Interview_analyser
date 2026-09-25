"""Upload custom interview guides and transcript files."""

from __future__ import annotations

import logging

from fastapi import APIRouter, File, Form, UploadFile

from app.api.errors import api_error
from app.api.schemas.analysis import ErrorResponse
from app.api.schemas.corpus import (
    GuideWriteRequest,
    GuideWriteResponse,
    TranscriptUploadResponse,
)
from app.application.corpus_files import save_guide, save_transcript

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/corpus",
    tags=["Corpus"],
)


@router.post(
    "/guide",
    summary="Save a custom interview guide",
    description=(
        "Write the supplied questions to a guide file the analysis "
        "endpoint can read."
    ),
    response_model=GuideWriteResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid guide"},
    },
)
def write_guide(request: GuideWriteRequest) -> GuideWriteResponse:
    try:
        saved = save_guide(request.title, request.questions)
    except ValueError as exc:
        raise api_error(400, "INVALID_GUIDE", str(exc)) from exc
    except OSError as exc:
        logger.exception("Could not save interview guide")
        raise api_error(
            500,
            "GUIDE_SAVE_FAILED",
            "The interview guide could not be saved.",
        ) from exc

    logger.info("Saved custom guide with %d questions", saved["question_count"])
    return GuideWriteResponse(**saved)


@router.post(
    "/transcripts",
    summary="Upload a transcript",
    description="Store a transcript file and return the path analysis can read.",
    response_model=TranscriptUploadResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid upload"},
    },
)
def upload_transcript(
    file: UploadFile = File(...),
    expert: str = Form(...),
    role: str = Form(...),
    market: str = Form(...),
) -> TranscriptUploadResponse:
    content = file.file.read()
    try:
        saved = save_transcript(
            original_name=file.filename or "transcript.txt",
            content=content,
            expert=expert,
            role=role,
            market=market,
        )
    except ValueError as exc:
        raise api_error(400, "INVALID_UPLOAD", str(exc)) from exc
    except OSError as exc:
        logger.exception("Could not save transcript upload")
        raise api_error(
            500,
            "UPLOAD_FAILED",
            "The transcript could not be saved.",
        ) from exc

    logger.info("Saved transcript upload %s", saved["transcript_id"])
    return TranscriptUploadResponse(**saved)
