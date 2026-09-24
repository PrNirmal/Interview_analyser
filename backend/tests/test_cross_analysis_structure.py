from app.domain.analysis import (
    CommonTheme,
    CrossExpertAnalysis,
    Difference,
    Disagreement,
    ExpertPosition,
)


def test_cross_analysis_structure():

    position = ExpertPosition(
        expert="Dr. Jean Martin",
        market="France",
        position="Adoption continues to increase.",
        evidence_segment_ids=[
            "Transcript_1_France-12"
        ],
    )

    theme = CommonTheme(
        theme="Increasing adoption",
        description="Adoption is expected to continue increasing.",
        experts=[
            position,
            ExpertPosition(
                expert="Anna Keller",
                market="Germany",
                position="Adoption is growing.",
                evidence_segment_ids=[
                    "Transcript_2_Germany-12"
                ],
            ),
        ],
    )

    difference = Difference(
        topic="Barriers to adoption",
        description="Experts emphasize different barriers.",
        expert_positions=[
            ExpertPosition(
                expert="Dr. Jean Martin",
                market="France",
                position="Capital budget approval is a major barrier.",
                evidence_segment_ids=[
                    "Transcript_1_France-20"
                ],
            ),
            ExpertPosition(
                expert="Anna Keller",
                market="Germany",
                position="Cost is a major barrier.",
                evidence_segment_ids=[
                    "Transcript_2_Germany-20"
                ],
            ),
        ],
    )

    disagreement = Disagreement(
        topic="Adoption direction",
        description="Experts express incompatible expectations.",
        expert_positions=[
            ExpertPosition(
                expert="Dr. Jean Martin",
                market="France",
                position="Adoption will increase.",
                evidence_segment_ids=[
                    "Transcript_1_France-30"
                ],
            ),
            ExpertPosition(
                expert="Anna Keller",
                market="Germany",
                position="Adoption will decline.",
                evidence_segment_ids=[
                    "Transcript_2_Germany-30"
                ],
            ),
        ],
    )

    analysis = CrossExpertAnalysis(
        common_themes=[theme],
        differences=[difference],
        disagreements=[disagreement],
    )

    assert len(analysis.common_themes) == 1
    assert len(analysis.differences) == 1
    assert len(analysis.disagreements) == 1

    assert analysis.common_themes[0].theme == "Increasing adoption"

    assert (
        analysis.differences[0].topic
        == "Barriers to adoption"
    )

    assert (
        analysis.disagreements[0].topic
        == "Adoption direction"
    )