"""
Dependency injection for the API layer.

Services are constructed lazily to avoid loading heavy models
(e.g., Hugging Face) at module import time. The /health endpoint
must work without initializing the LLM.
"""

from __future__ import annotations

import logging
from functools import lru_cache

from app.application.analysis_service import CrossExpertAnalysisService
from app.application.cross_interview_question_service import CrossInterviewQuestionService
from app.application.full_analysis_service import FullInterviewAnalysisService

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_full_analysis_service() -> FullInterviewAnalysisService:
    """
    Return a cached FullInterviewAnalysisService instance.

    The service itself is lightweight — the heavy LLM model is only
    loaded when analysis is actually invoked, not during construction.
    """
    logger.info("Initializing FullInterviewAnalysisService")
    return FullInterviewAnalysisService()


@lru_cache(maxsize=1)
def get_cross_expert_analysis_service() -> CrossExpertAnalysisService:
    """
    Return a cached CrossExpertAnalysisService instance.

    Same lazy-loading principle: the service is lightweight, the LLM
    is loaded on first analysis call.
    """
    logger.info("Initializing CrossExpertAnalysisService")
    return CrossExpertAnalysisService()


@lru_cache(maxsize=1)
def get_cross_interview_question_service() -> CrossInterviewQuestionService:
    """
    Return a cached CrossInterviewQuestionService instance.

    Retrieval models and the LLM load when a question is answered,
    not when this service is constructed.
    """
    logger.info("Initializing CrossInterviewQuestionService")
    return CrossInterviewQuestionService()
