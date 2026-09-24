from app.domain.analysis import CrossExpertAnalysis


COMPATIBLE_TERMS = {
    "steady": {"gradual", "continued", "continue", "increasing", "growth"},
    "gradual": {"steady", "continued", "continue", "increasing", "growth"},
    "continued": {"steady", "gradual", "continue", "increasing", "growth"},
}


def statements_are_obviously_compatible(
    positions: list[str],
) -> bool:

    if len(positions) < 2:
        return False

    normalized = [
        position.lower()
        for position in positions
    ]

    has_steady = any(
        "steady" in position
        for position in normalized
    )

    has_gradual = any(
        "gradual" in position
        for position in normalized
    )

    if has_steady and has_gradual:
        return True

    return False


def validate_disagreement_semantics(
    analysis: CrossExpertAnalysis,
) -> bool:

    for disagreement in analysis.disagreements:

        positions = [
            position.position
            for position in disagreement.expert_positions
        ]

        if statements_are_obviously_compatible(
            positions
        ):
            return False

    return True