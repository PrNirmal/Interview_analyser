"""Map domain models to API response schemas."""

from __future__ import annotations

from app.api.schemas.analysis import (
    CommonThemeResponse,
    CrossExpertAnalysisResponse,
    DifferenceResponse,
    DisagreementResponse,
    EvidenceReferenceResponse,
    ExpertPositionResponse,
    InterviewAnalysisResponse,
    InterviewQuestionAnswerResponse,
)
from app.domain.analysis import (
    CommonTheme,
    CrossExpertAnalysis,
    Difference,
    Disagreement,
    ExpertPosition,
)
from app.domain.interview import InterviewAnalysis, InterviewQuestionAnswer


def serialize_evidence(evidence) -> EvidenceReferenceResponse:
    return EvidenceReferenceResponse(
        segment_id=evidence.segment_id,
        timestamp=evidence.timestamp,
        quote=evidence.quote,
        question_id=getattr(evidence, "question_id", None),
    )


def serialize_answer(
    answer: InterviewQuestionAnswer,
) -> InterviewQuestionAnswerResponse:
    return InterviewQuestionAnswerResponse(
        question_id=answer.question_id,
        question=answer.question,
        answer=answer.answer,
        evidence=[serialize_evidence(item) for item in answer.evidence],
        confidence=answer.confidence,
    )


def serialize_expert_analysis(
    analysis: InterviewAnalysis,
) -> InterviewAnalysisResponse:
    return InterviewAnalysisResponse(
        transcript_id=analysis.transcript_id,
        expert=analysis.expert,
        role=analysis.role,
        market=analysis.market,
        answers=[serialize_answer(item) for item in analysis.answers],
    )


def serialize_expert_position(
    position: ExpertPosition,
) -> ExpertPositionResponse:
    return ExpertPositionResponse(
        expert=position.expert,
        market=position.market,
        position=position.position,
        evidence_segment_ids=position.evidence_segment_ids,
    )


def serialize_common_theme(theme: CommonTheme) -> CommonThemeResponse:
    return CommonThemeResponse(
        theme=theme.theme,
        description=theme.description,
        experts=[serialize_expert_position(item) for item in theme.experts],
    )


def serialize_difference(difference: Difference) -> DifferenceResponse:
    return DifferenceResponse(
        topic=difference.topic,
        description=difference.description,
        expert_positions=[
            serialize_expert_position(item)
            for item in difference.expert_positions
        ],
    )


def serialize_disagreement(
    disagreement: Disagreement,
) -> DisagreementResponse:
    return DisagreementResponse(
        topic=disagreement.topic,
        description=disagreement.description,
        expert_positions=[
            serialize_expert_position(item)
            for item in disagreement.expert_positions
        ],
    )


def serialize_cross_analysis(
    cross_analysis: CrossExpertAnalysis,
) -> CrossExpertAnalysisResponse:
    return CrossExpertAnalysisResponse(
        common_themes=[
            serialize_common_theme(item) for item in cross_analysis.common_themes
        ],
        differences=[
            serialize_difference(item) for item in cross_analysis.differences
        ],
        disagreements=[
            serialize_disagreement(item)
            for item in cross_analysis.disagreements
        ],
    )
