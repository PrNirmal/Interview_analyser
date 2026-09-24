from app.domain.analysis import CrossExpertAnalysis
from app.domain.interview import InterviewAnalysis


def build_evidence_map(
    expert_analyses: list[InterviewAnalysis],
) -> dict:

    evidence_map = {}

    for expert_analysis in expert_analyses:

        for answer in expert_analysis.answers:

            for evidence in answer.evidence:

                evidence_map[evidence.segment_id] = {
                    "timestamp": evidence.timestamp,
                    "quote": evidence.quote,
                    "expert": expert_analysis.expert,
                    "market": expert_analysis.market,
                    "question_id": answer.question_id,
                    "question": answer.question,
                }

    return evidence_map


def validate_position(
    expert: str,
    market: str,
    evidence_segment_ids: list[str],
    evidence_map: dict,
) -> bool:

    if not evidence_segment_ids:
        return False

    for segment_id in evidence_segment_ids:

        source = evidence_map.get(segment_id)

        if not source:
            return False

        if source["expert"] != expert:
            return False

        if source["market"] != market:
            return False

    return True


def validate_common_themes(
    analysis: CrossExpertAnalysis,
    evidence_map: dict,
) -> bool:

    for theme in analysis.common_themes:

        if len(theme.experts) < 2:
            return False

        experts = {
            position.expert
            for position in theme.experts
        }

        if len(experts) < 2:
            return False

        for position in theme.experts:

            if not validate_position(
                expert=position.expert,
                market=position.market,
                evidence_segment_ids=position.evidence_segment_ids,
                evidence_map=evidence_map,
            ):
                return False

    return True


def validate_disagreements(
    analysis: CrossExpertAnalysis,
    evidence_map: dict,
) -> bool:

    for disagreement in analysis.disagreements:

        if len(disagreement.expert_positions) < 2:
            return False

        experts = {
            position.expert
            for position in disagreement.expert_positions
        }

        if len(experts) < 2:
            return False

        for position in disagreement.expert_positions:

            if not validate_position(
                expert=position.expert,
                market=position.market,
                evidence_segment_ids=position.evidence_segment_ids,
                evidence_map=evidence_map,
            ):
                return False

    return True


def validate_cross_expert_analysis(
    analysis: CrossExpertAnalysis,
    expert_analyses: list[InterviewAnalysis],
) -> bool:

    evidence_map = build_evidence_map(
        expert_analyses
    )

    if not validate_common_themes(
        analysis,
        evidence_map,
    ):
        return False

    if not validate_disagreements(
        analysis,
        evidence_map,
    ):
        return False

    return True