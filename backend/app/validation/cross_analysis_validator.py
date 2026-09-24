"""
Cross-expert analysis validation.

This module validates LLM-generated cross-expert analysis against the
original expert analyses.

Validation goals:
1. Every referenced expert must exist.
2. Every referenced market must match the expert.
3. Every evidence_segment_id must actually belong to that expert.
4. Common-theme evidence must be valid.
5. Disagreement evidence must be valid.
6. Disagreements must represent an actual semantic difference.
7. Obviously compatible statements must NOT be classified as disagreements.
"""

from __future__ import annotations

import re
from typing import Iterable

from app.domain.interview import InterviewAnalysis
from app.domain.analysis import (
    CommonTheme,
    CrossExpertAnalysis,
    Difference,
    Disagreement,
    ExpertPosition,
)


# ---------------------------------------------------------------------------
# Text normalization
# ---------------------------------------------------------------------------


def _normalize_text(text: str) -> str:
    """
    Normalize text for lightweight semantic comparison.

    This is intentionally conservative. We do not try to build a complete
    semantic similarity engine here. The goal is to catch obvious cases
    where the LLM incorrectly labels compatible statements as disagreements.
    """
    if not text:
        return ""

    text = text.lower().strip()

    # Normalize punctuation.
    text = re.sub(r"[^\w\s%.-]", " ", text)

    # Normalize whitespace.
    text = re.sub(r"\s+", " ", text)

    return text


def _contains_any(text: str, terms: Iterable[str]) -> bool:
    """Return True if any term appears in the normalized text."""
    return any(term in text for term in terms)


# ---------------------------------------------------------------------------
# Expert / evidence indexing
# ---------------------------------------------------------------------------


def _build_expert_index(
    expert_analyses: list[InterviewAnalysis],
) -> dict[tuple[str, str], InterviewAnalysis]:
    """
    Build an index using:

        (expert_name, market) -> InterviewAnalysis
    """
    index: dict[tuple[str, str], InterviewAnalysis] = {}

    for analysis in expert_analyses:
        key = (
            _normalize_text(analysis.expert),
            _normalize_text(analysis.market),
        )

        index[key] = analysis

    return index


def _build_evidence_index(
    expert_analyses: list[InterviewAnalysis],
) -> dict[tuple[str, str], set[str]]:
    """
    Build:

        (expert_name, market) -> set(segment_ids)

    Only evidence belonging to the original expert analysis is included.
    """
    index: dict[tuple[str, str], set[str]] = {}

    for analysis in expert_analyses:
        key = (
            _normalize_text(analysis.expert),
            _normalize_text(analysis.market),
        )

        segment_ids: set[str] = set()

        for answer in analysis.answers:
            for evidence in answer.evidence:
                if evidence.segment_id:
                    segment_ids.add(evidence.segment_id)

        index[key] = segment_ids

    return index


# ---------------------------------------------------------------------------
# Expert validation
# ---------------------------------------------------------------------------


def _validate_expert_position_identity(
    expert_position: ExpertPosition,
    expert_index: dict[tuple[str, str], InterviewAnalysis],
) -> bool:
    """
    Validate that the expert + market combination exists in the original
    expert analyses.
    """
    key = (
        _normalize_text(expert_position.expert),
        _normalize_text(expert_position.market),
    )

    return key in expert_index


# ---------------------------------------------------------------------------
# Evidence validation
# ---------------------------------------------------------------------------


def _validate_expert_position_evidence(
    expert_position: ExpertPosition,
    evidence_index: dict[tuple[str, str], set[str]],
) -> bool:
    """
    Validate that every evidence_segment_id referenced by the LLM actually
    belongs to that expert.

    IMPORTANT:
    ExpertPosition uses `evidence_segment_ids`, not `evidence`.
    """
    key = (
        _normalize_text(expert_position.expert),
        _normalize_text(expert_position.market),
    )

    valid_segment_ids = evidence_index.get(key)

    if valid_segment_ids is None:
        return False

    referenced_segment_ids = set(
        expert_position.evidence_segment_ids or []
    )

    # Every position must have evidence.
    if not referenced_segment_ids:
        return False

    # Every referenced segment must belong to this expert.
    if not referenced_segment_ids.issubset(valid_segment_ids):
        return False

    return True


def _validate_positions_evidence(
    positions: list[ExpertPosition],
    expert_index: dict[tuple[str, str], InterviewAnalysis],
    evidence_index: dict[tuple[str, str], set[str]],
) -> bool:
    """
    Validate expert identity and evidence for every position.
    """
    if not positions:
        return False

    seen_experts: set[tuple[str, str]] = set()

    for position in positions:
        if not _validate_expert_position_identity(
            position,
            expert_index,
        ):
            return False

        if not _validate_expert_position_evidence(
            position,
            evidence_index,
        ):
            return False

        key = (
            _normalize_text(position.expert),
            _normalize_text(position.market),
        )

        # The same expert should not appear twice in the same comparison.
        if key in seen_experts:
            return False

        seen_experts.add(key)

    return True


# ---------------------------------------------------------------------------
# Semantic compatibility
# ---------------------------------------------------------------------------


def _has_growth_language(text: str) -> bool:
    """
    Detect general positive-growth language.
    """
    return bool(
        re.search(
            r"\b("
            r"growth|growing|increase|increasing|increased|"
            r"rise|rising|expand|expanding|expansion"
            r")\b",
            text,
        )
    )


def _has_steady_language(text: str) -> bool:
    """
    Detect steady/gradual trajectory language.
    """
    return bool(
        re.search(
            r"\b("
            r"steady|steadily|gradual|gradually|moderate|moderately|"
            r"incremental|incrementally"
            r")\b",
            text,
        )
    )


def _has_decline_language(text: str) -> bool:
    """
    Detect decline / contraction language.
    """
    return bool(
        re.search(
            r"\b("
            r"decline|declining|decrease|decreasing|decreased|"
            r"fall|falling|drop|dropping|contract|contracting|"
            r"contraction"
            r")\b",
            text,
        )
    )


def _has_no_growth_language(text: str) -> bool:
    """
    Detect explicit flat/no-growth language.
    """
    patterns = [
        r"\bno growth\b",
        r"\bflat growth\b",
        r"\bremain flat\b",
        r"\bstagnant\b",
        r"\bstagnation\b",
        r"\bunchanged\b",
        r"\bno increase\b",
        r"\bno meaningful increase\b",
    ]

    return any(re.search(pattern, text) for pattern in patterns)


def _extract_percentage_ranges(
    text: str,
) -> list[tuple[float, float]]:
    """
    Extract simple percentage ranges.

    Examples:
        "15 to 20%" -> [(15, 20)]
        "15-20%"     -> [(15, 20)]
        "15%"        -> [(15, 15)]
    """
    ranges: list[tuple[float, float]] = []

    normalized = text.lower()

    # "15 to 20%"
    for match in re.finditer(
        r"(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*%",
        normalized,
    ):
        low = float(match.group(1))
        high = float(match.group(2))
        ranges.append((low, high))

    # "15%"
    for match in re.finditer(
        r"(\d+(?:\.\d+)?)\s*%",
        normalized,
    ):
        value = float(match.group(1))

        # Avoid duplicating percentages that were already part of a range.
        if not any(low <= value <= high for low, high in ranges):
            ranges.append((value, value))

    return ranges


def _has_meaningful_numeric_difference(
    positions: list[str],
) -> bool:
    """
    Detect explicit numerical differences.

    Example:

        "15 to 20 percent annually"
        vs
        "high single digits or low double digits"

    The first has an explicit numeric range while the second may use
    qualitative numeric language.

    We intentionally do NOT mark every numerical difference as a
    disagreement. We only use this helper when both statements contain
    clear quantitative expectations.
    """
    ranges: list[tuple[float, float]] = []

    for position in positions:
        ranges.extend(_extract_percentage_ranges(position))

    if len(ranges) < 2:
        return False

    # Compare explicit ranges.
    for i in range(len(ranges)):
        for j in range(i + 1, len(ranges)):
            low_a, high_a = ranges[i]
            low_b, high_b = ranges[j]

            # If the ranges don't overlap at all, this is a meaningful
            # quantitative difference.
            if high_a < low_b or high_b < low_a:
                return True

    return False


def statements_are_obviously_compatible(
    positions: list[str],
) -> bool:
    """
    Determine whether statements are obviously compatible.

    This function is intentionally conservative.

    Examples considered compatible:

        "Adoption should continue increasing steadily."
        "Growth is expected to be gradual."

    Also compatible:

        "Adoption will continue growing."
        "Adoption is expected to increase."

    We do NOT consider two different quantitative growth rates automatically
    compatible.
    """
    if len(positions) < 2:
        return False

    normalized = [
        _normalize_text(position)
        for position in positions
        if position
    ]

    if len(normalized) < 2:
        return False

    # ------------------------------------------------------------------
    # Explicit contradiction
    # ------------------------------------------------------------------

    has_decline = any(
        _has_decline_language(text)
        for text in normalized
    )

    has_positive_growth = any(
        _has_growth_language(text)
        for text in normalized
    )

    has_no_growth = any(
        _has_no_growth_language(text)
        for text in normalized
    )

    # One expert predicts decline while another predicts growth.
    if has_decline and has_positive_growth:
        return False

    # One says no growth while another says growth.
    if has_no_growth and has_positive_growth:
        return False

    # ------------------------------------------------------------------
    # Compatible growth trajectory
    # ------------------------------------------------------------------

    has_steady = any(
        _has_steady_language(text)
        for text in normalized
    )

    growth_count = sum(
        _has_growth_language(text)
        for text in normalized
    )

    steady_count = sum(
        _has_steady_language(text)
        for text in normalized
    )

    # Examples:
    #
    # "increasing steadily"
    # "growth will be gradual"
    #
    # These describe the same general trajectory.
    if growth_count >= 1 and steady_count >= 1:
        return True

    # If every statement describes growth without an explicit contradiction,
    # the statements are generally compatible.
    if growth_count == len(normalized):
        # However, if both contain clearly different explicit percentage
        # ranges, retain the disagreement.
        if _has_meaningful_numeric_difference(normalized):
            return False

        return True

    # ------------------------------------------------------------------
    # Explicitly equivalent trajectory wording
    # ------------------------------------------------------------------

    positive_growth_phrases = [
        "continue to grow",
        "continues to grow",
        "continued growth",
        "continue growing",
        "continue increasing",
        "continues increasing",
        "continued increase",
        "steady growth",
        "gradual growth",
        "steady increase",
        "gradual increase",
    ]

    phrase_matches = [
        any(
            phrase in text
            for phrase in positive_growth_phrases
        )
        for text in normalized
    ]

    if all(phrase_matches):
        if _has_meaningful_numeric_difference(normalized):
            return False

        return True

    return False


# ---------------------------------------------------------------------------
# Disagreement validation
# ---------------------------------------------------------------------------


def _validate_disagreement_semantics(
    positions: list[ExpertPosition],
) -> bool:
    """
    Validate that a disagreement actually represents a semantic difference.

    Returns:
        True  -> legitimate disagreement
        False -> obviously compatible statements
    """
    if len(positions) < 2:
        return False

    position_texts = [
        position.position
        for position in positions
        if position.position
    ]

    if len(position_texts) < 2:
        return False

    # If the statements are obviously compatible, this is NOT a disagreement.
    if statements_are_obviously_compatible(position_texts):
        return False

    return True


def _supported_segment_ids(
    expert_position: ExpertPosition,
    evidence_index: dict[tuple[str, str], set[str]],
) -> list[str]:
    """
    Keep only segment ids that belong to this expert, in original order.
    """
    key = (
        _normalize_text(expert_position.expert),
        _normalize_text(expert_position.market),
    )
    valid_segment_ids = evidence_index.get(key)
    if not valid_segment_ids:
        return []

    supported: list[str] = []
    seen: set[str] = set()
    for segment_id in expert_position.evidence_segment_ids or []:
        if segment_id in valid_segment_ids and segment_id not in seen:
            supported.append(segment_id)
            seen.add(segment_id)
    return supported


def _repair_positions(
    positions: list[ExpertPosition],
    expert_index: dict[tuple[str, str], InterviewAnalysis],
    evidence_index: dict[tuple[str, str], set[str]],
) -> list[ExpertPosition]:
    """
    Drop unknown experts and segment ids that are not in that expert's evidence.
    """
    repaired: list[ExpertPosition] = []
    seen_experts: set[tuple[str, str]] = set()

    for position in positions:
        if not _validate_expert_position_identity(position, expert_index):
            continue

        segment_ids = _supported_segment_ids(position, evidence_index)
        if not segment_ids:
            continue

        key = (
            _normalize_text(position.expert),
            _normalize_text(position.market),
        )
        if key in seen_experts:
            continue

        seen_experts.add(key)
        repaired.append(
            position.model_copy(update={"evidence_segment_ids": segment_ids})
        )

    return repaired


def repair_cross_expert_analysis(
    analysis: CrossExpertAnalysis,
    expert_analyses: list[InterviewAnalysis],
) -> CrossExpertAnalysis:
    """
    Keep cross-expert items whose evidence belongs to the cited expert.

    A comparison that is evidence-backed but obviously compatible is stored
    as a difference. It is not left in disagreements, and it does not discard
    the rest of the analysis.
    """
    expert_index = _build_expert_index(expert_analyses)
    evidence_index = _build_evidence_index(expert_analyses)

    themes: list[CommonTheme] = []
    for theme in analysis.common_themes or []:
        if not theme.theme or not theme.description:
            continue
        experts = _repair_positions(
            theme.experts,
            expert_index,
            evidence_index,
        )
        if len(experts) < 2:
            continue
        themes.append(theme.model_copy(update={"experts": experts}))

    differences: list[Difference] = []
    for difference in analysis.differences or []:
        if not difference.topic or not difference.description:
            continue
        positions = _repair_positions(
            difference.expert_positions,
            expert_index,
            evidence_index,
        )
        if len(positions) < 2:
            continue
        differences.append(
            difference.model_copy(update={"expert_positions": positions})
        )

    disagreements: list[Disagreement] = []
    for disagreement in analysis.disagreements or []:
        if not disagreement.topic or not disagreement.description:
            continue
        positions = _repair_positions(
            disagreement.expert_positions,
            expert_index,
            evidence_index,
        )
        if len(positions) < 2:
            continue

        position_texts = [
            position.position
            for position in positions
            if position.position
        ]
        if statements_are_obviously_compatible(position_texts):
            differences.append(
                Difference(
                    topic=disagreement.topic,
                    description=disagreement.description,
                    expert_positions=positions,
                )
            )
            continue

        disagreements.append(
            disagreement.model_copy(update={"expert_positions": positions})
        )

    return CrossExpertAnalysis(
        common_themes=themes,
        differences=differences,
        disagreements=disagreements,
    )


def _validate_difference(
    difference,
    expert_index: dict[tuple[str, str], InterviewAnalysis],
    evidence_index: dict[tuple[str, str], set[str]],
) -> bool:
    """
    Validate one difference.

    Differences require owned evidence, but they do not have to be contradictions.
    """
    if not difference.topic or not difference.description:
        return False

    positions = difference.expert_positions
    if len(positions) < 2:
        return False

    return _validate_positions_evidence(
        positions=positions,
        expert_index=expert_index,
        evidence_index=evidence_index,
    )


def _validate_disagreement(
    disagreement,
    expert_index: dict[tuple[str, str], InterviewAnalysis],
    evidence_index: dict[tuple[str, str], set[str]],
) -> bool:
    """
    Validate one disagreement.
    """
    if not disagreement.topic:
        return False

    if not disagreement.description:
        return False

    positions = disagreement.expert_positions

    if not positions:
        return False

    # A disagreement must involve at least two experts.
    if len(positions) < 2:
        return False

    # Validate expert identity + evidence.
    if not _validate_positions_evidence(
        positions=positions,
        expert_index=expert_index,
        evidence_index=evidence_index,
    ):
        return False

    # Validate that it is an actual disagreement.
    if not _validate_disagreement_semantics(positions):
        return False

    return True


# ---------------------------------------------------------------------------
# Common theme validation
# ---------------------------------------------------------------------------


def _validate_common_theme(
    theme,
    expert_index: dict[tuple[str, str], InterviewAnalysis],
    evidence_index: dict[tuple[str, str], set[str]],
) -> bool:
    """
    Validate one common theme.
    """
    if not theme.theme:
        return False

    if not theme.description:
        return False

    experts = theme.experts

    if not experts:
        return False

    # A common theme should contain at least two experts.
    if len(experts) < 2:
        return False

    return _validate_positions_evidence(
        positions=experts,
        expert_index=expert_index,
        evidence_index=evidence_index,
    )


# ---------------------------------------------------------------------------
# Main validator
# ---------------------------------------------------------------------------


def validate_cross_expert_analysis(
    analysis: CrossExpertAnalysis,
    expert_analyses: list[InterviewAnalysis],
) -> bool:
    """
    Validate an LLM-generated CrossExpertAnalysis.

    Validation includes:

    1. Input sanity.
    2. Expert identity validation.
    3. Evidence ownership validation.
    4. Common theme validation.
    5. Disagreement validation.
    6. Semantic disagreement validation.

    Returns:
        True if the entire cross-expert analysis is valid.
        False otherwise.
    """

    # ------------------------------------------------------------------
    # Input validation
    # ------------------------------------------------------------------

    if analysis is None:
        return False

    if not expert_analyses:
        return False

    if len(expert_analyses) < 2:
        return False

    # ------------------------------------------------------------------
    # Build indexes from the ORIGINAL expert analyses.
    # ------------------------------------------------------------------

    expert_index = _build_expert_index(
        expert_analyses
    )

    evidence_index = _build_evidence_index(
        expert_analyses
    )

    # ------------------------------------------------------------------
    # Validate common themes.
    # ------------------------------------------------------------------

    for theme in analysis.common_themes or []:

        if not _validate_common_theme(
            theme=theme,
            expert_index=expert_index,
            evidence_index=evidence_index,
        ):
            return False

    # ------------------------------------------------------------------
    # Validate differences.
    # ------------------------------------------------------------------

    for difference in analysis.differences or []:

        if not _validate_difference(
            difference=difference,
            expert_index=expert_index,
            evidence_index=evidence_index,
        ):
            return False

    # ------------------------------------------------------------------
    # Validate disagreements.
    # ------------------------------------------------------------------

    for disagreement in analysis.disagreements or []:

        if not _validate_disagreement(
            disagreement=disagreement,
            expert_index=expert_index,
            evidence_index=evidence_index,
        ):
            return False

    # ------------------------------------------------------------------
    # Final sanity check.
    #
    # The analysis should contain at least one cross-expert result.
    # ------------------------------------------------------------------

    if (
        not analysis.common_themes
        and not analysis.differences
        and not analysis.disagreements
    ):
        return False

    return True