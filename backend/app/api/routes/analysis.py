"""
Analysis API routes.

The route validates input, calls the existing application services,
and serializes their results. Analysis logic stays in the services.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter

from app.api import dependencies
from app.api.errors import api_error
from app.api.schemas.analysis import (
    CrossExpertAnalysisResponse,
    ErrorResponse,
    FullAnalysisRequest,
    FullAnalysisResponse,
    QuestionEvidenceResponse,
    QuestionRequest,
    QuestionResponse,
    ValidationResponse,
)
from app.api.security import validate_file_path
from app.api.serializers import (
    serialize_cross_analysis,
    serialize_expert_analysis,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/analysis",
    tags=["Analysis"],
)


@router.post(
    "/full",
    summary="Run full expert interview analysis",
    description=(
        "Analyze all supplied expert interviews using the configured "
        "interview guide and return individual expert answers, evidence, "
        "cross-expert themes, differences, disagreements, and validation "
        "information."
    ),
    response_model=FullAnalysisResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        404: {"model": ErrorResponse, "description": "File not found"},
        500: {"model": ErrorResponse, "description": "Analysis failure"},
        503: {"model": ErrorResponse, "description": "Service unavailable"},
    },
)
def run_full_analysis(request: FullAnalysisRequest) -> FullAnalysisResponse:
    """
    Orchestrate the full interview analysis pipeline.

    Flow:
        1. Validate all file paths.
        2. Run FullInterviewAnalysisService.analyze_all().
        3. Run CrossExpertAnalysisService.analyze() when at least two
           transcripts were analyzed.
        4. Return the serialized result.
    """
    guide_resolved = validate_file_path(request.guide_path)
    transcripts_for_service = _transcripts_for_service(request.transcripts)

    logger.info(
        "Starting full analysis: guide=%s, transcripts=%d",
        request.guide_path,
        len(request.transcripts),
    )

    try:
        full_service = dependencies.get_full_analysis_service()
        expert_analyses = full_service.analyze_all(
            guide_path=str(guide_resolved),
            transcripts=transcripts_for_service,
            retrieval_top_k=request.retrieval_top_k,
        )
    except FileNotFoundError as exc:
        logger.error("File not found during analysis: %s", exc)
        raise api_error(404, "FILE_NOT_FOUND", str(exc)) from exc
    except ValueError as exc:
        logger.error("Validation error during analysis: %s", exc)
        raise api_error(400, "INVALID_INPUT", str(exc)) from exc
    except Exception as exc:
        logger.exception("Individual analysis failed")
        raise api_error(
            500,
            "ANALYSIS_FAILED",
            "Interview analysis could not be completed.",
        ) from exc

    validation_result = ValidationResponse(
        valid=True,
        message="Cross-expert analysis skipped (fewer than 2 transcripts).",
    )
    cross_analysis_response = CrossExpertAnalysisResponse(
        common_themes=[],
        differences=[],
        disagreements=[],
    )

    if len(expert_analyses) >= 2:
        try:
            cross_service = dependencies.get_cross_expert_analysis_service()
            cross_analysis = cross_service.analyze(expert_analyses)
            cross_analysis_response = serialize_cross_analysis(cross_analysis)
            validation_result = ValidationResponse(
                valid=True,
                message="Cross-expert analysis passed validation.",
            )
        except ValueError as exc:
            logger.warning("Cross-expert validation failed: %s", exc)
            validation_result = ValidationResponse(
                valid=False,
                message=str(exc),
            )
        except Exception as exc:
            logger.exception("Cross-expert analysis failed")
            raise api_error(
                500,
                "CROSS_ANALYSIS_FAILED",
                "Cross-expert analysis could not be completed.",
            ) from exc
    else:
        logger.info(
            "Skipping cross-expert analysis: only %d transcript(s) provided.",
            len(expert_analyses),
        )

    logger.info("Analysis completed successfully")

    return FullAnalysisResponse(
        experts=[serialize_expert_analysis(item) for item in expert_analyses],
        cross_analysis=cross_analysis_response,
        validation=validation_result,
    )


def _transcripts_for_service(transcripts) -> list[dict]:
    return [
        {
            "transcript_id": transcript.transcript_id,
            "expert": transcript.expert,
            "role": transcript.role,
            "market": transcript.market,
            "file_path": str(validate_file_path(transcript.file_path)),
        }
        for transcript in transcripts
    ]


@router.post(
    "/question",
    summary="Ask a question across interviews",
    description=(
        "Answer a free-form question using only the supplied interview "
        "transcripts. The answer includes the supporting quotes and the "
        "expert who said each one."
    ),
    response_model=QuestionResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        404: {"model": ErrorResponse, "description": "File not found"},
        500: {"model": ErrorResponse, "description": "Answer failure"},
    },
)
def ask_question(request: QuestionRequest) -> QuestionResponse:
    """Answer one question from the transcripts in the current analysis."""
    transcripts_for_service = _transcripts_for_service(request.transcripts)

    logger.info(
        "Answering question across %d transcript(s)",
        len(transcripts_for_service),
    )

    try:
        service = dependencies.get_cross_interview_question_service()
        result = service.answer(
            question=request.question,
            transcripts=transcripts_for_service,
        )
    except FileNotFoundError as exc:
        logger.error("File not found while answering question: %s", exc)
        raise api_error(404, "FILE_NOT_FOUND", str(exc)) from exc
    except ValueError as exc:
        message = str(exc)
        if "failed evidence validation" in message:
            logger.warning("Question answer failed validation: %s", exc)
            raise api_error(
                500,
                "ANSWER_VALIDATION_FAILED",
                "The answer could not be verified against the transcripts.",
            ) from exc
        logger.warning("Question could not be answered: %s", exc)
        raise api_error(400, "QUESTION_FAILED", message) from exc
    except Exception as exc:
        logger.exception("Question answering failed")
        raise api_error(
            500,
            "QUESTION_FAILED",
            "The question could not be answered from the transcripts.",
        ) from exc

    logger.info("Question answered successfully")
    return QuestionResponse(
        question=result.question,
        answer=result.answer,
        confidence=result.confidence,
        evidence=[
            QuestionEvidenceResponse(
                segment_id=item.segment_id,
                timestamp=item.timestamp,
                quote=item.quote,
                expert=item.expert,
                role=item.role,
                market=item.market,
                speaker=item.speaker,
            )
            for item in result.evidence
        ],
    )
