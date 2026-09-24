from app.application.analysis_service import CrossExpertAnalysisService
from app.domain.answer import EvidenceReference
from app.domain.interview import (
    InterviewAnalysis,
    InterviewQuestionAnswer,
)
from app.validation.cross_analysis_validator import (
    validate_cross_expert_analysis,
)


def build_france_analysis() -> InterviewAnalysis:

    return InterviewAnalysis(
        transcript_id="Transcript_1_France",
        expert="Dr. Jean Martin",
        role="Head of Urology",
        market="France",
        answers=[
            InterviewQuestionAnswer(
                question_id="Q1",
                question=(
                    "How would you describe current adoption "
                    "of robotic surgery in your market?"
                ),
                answer=(
                    "Adoption is growing, but concentrated in larger "
                    "academic hospitals and private centres."
                ),
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="france-001-1",
                        timestamp="00:18",
                        quote=(
                            "Adoption is growing, but it is still "
                            "concentrated in larger academic hospitals "
                            "and private centres."
                        ),
                    )
                ],
            ),
            InterviewQuestionAnswer(
                question_id="Q2",
                question="What are the main barriers to adoption?",
                answer=(
                    "Capital budget approval is a major barrier, "
                    "particularly for smaller hospitals."
                ),
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="france-001-7",
                        timestamp="01:20",
                        quote=(
                            "The biggest issue is still capital "
                            "budget approval."
                        ),
                    )
                ],
            ),
            InterviewQuestionAnswer(
                question_id="Q5",
                question=(
                    "What adoption trend do you expect "
                    "over the next 3–5 years?"
                ),
                answer=(
                    "Adoption should continue increasing steadily."
                ),
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="france-001-10",
                        timestamp="05:07",
                        quote=(
                            "I expect adoption to continue increasing, "
                            "probably steadily rather than explosively."
                        ),
                    )
                ],
            ),
        ],
    )


def build_germany_analysis() -> InterviewAnalysis:

    return InterviewAnalysis(
        transcript_id="Transcript_2_Germany",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
        answers=[
            InterviewQuestionAnswer(
                question_id="Q1",
                question=(
                    "How would you describe current adoption "
                    "of robotic surgery in your market?"
                ),
                answer=(
                    "Adoption is growing unevenly, with university "
                    "hospitals more advanced."
                ),
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="germany-001-1",
                        timestamp="00:16",
                        quote=(
                            "It is growing, but adoption is quite uneven."
                        ),
                    )
                ],
            ),
            InterviewQuestionAnswer(
                question_id="Q2",
                question="What are the main barriers to adoption?",
                answer=(
                    "Cost and proving sufficient utilisation "
                    "are major barriers."
                ),
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="germany-001-7",
                        timestamp="01:10",
                        quote=(
                            "Cost is the first barrier. These are "
                            "large capital purchases."
                        ),
                    )
                ],
            ),
            InterviewQuestionAnswer(
                question_id="Q5",
                question=(
                    "What adoption trend do you expect "
                    "over the next 3–5 years?"
                ),
                answer=(
                    "Growth is expected to be gradual."
                ),
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="germany-001-10",
                        timestamp="05:08",
                        quote=(
                            "I would expect continued growth, "
                            "but probably closer to high single "
                            "digits or low double digits."
                        ),
                    )
                ],
            ),
        ],
    )


def build_uk_analysis() -> InterviewAnalysis:

    return InterviewAnalysis(
        transcript_id="Transcript_3_UK",
        expert="Dr. Emily Carter",
        role="Consultant Urologist",
        market="United Kingdom",
        answers=[
            InterviewQuestionAnswer(
                question_id="Q1",
                question=(
                    "How would you describe current adoption "
                    "of robotic surgery in your market?"
                ),
                answer=(
                    "Adoption is increasing, with larger NHS trusts "
                    "using robotic surgery for selected procedures."
                ),
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="uk-001-1",
                        timestamp="00:14",
                        quote=(
                            "Adoption is increasing, and in some "
                            "larger NHS trusts robotic surgery is "
                            "becoming standard."
                        ),
                    )
                ],
            ),
            InterviewQuestionAnswer(
                question_id="Q2",
                question="What are the main barriers to adoption?",
                answer=(
                    "Funding and training capacity are important "
                    "constraints."
                ),
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="uk-001-6",
                        timestamp="01:05",
                        quote=(
                            "Funding is important, but I would say "
                            "training capacity is just as important."
                        ),
                    )
                ],
            ),
            InterviewQuestionAnswer(
                question_id="Q5",
                question=(
                    "What adoption trend do you expect "
                    "over the next 3–5 years?"
                ),
                answer=(
                    "Adoption could accelerate if training expands "
                    "and systems become more cost competitive."
                ),
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="uk-001-10",
                        timestamp="04:06",
                        quote=(
                            "I think adoption could accelerate if "
                            "training expands and systems become "
                            "more cost competitive."
                        ),
                    )
                ],
            ),
        ],
    )


def test_cross_expert_analysis():

    france = build_france_analysis()
    germany = build_germany_analysis()
    uk = build_uk_analysis()

    service = CrossExpertAnalysisService()

    result = service.analyze(
        expert_analyses=[
            france,
            germany,
            uk,
        ]
    )

    assert validate_cross_expert_analysis(
        analysis=result,
        expert_analyses=[
            france,
            germany,
            uk,
        ],
    )

    print("\n")
    print("=" * 80)
    print("CROSS-EXPERT ANALYSIS")
    print("=" * 80)

    # --------------------------------------------------
    # COMMON THEMES
    # --------------------------------------------------

    print("\nCOMMON THEMES")
    print("=" * 80)

    for theme in result.common_themes:

        print(
            f"\nTheme: {theme.theme}"
        )

        print(
            f"Description: {theme.description}"
        )

        for expert in theme.experts:

            print(
                f"\nExpert: {expert.expert}"
            )

            print(
                f"Market: {expert.market}"
            )

            print(
                f"Position: {expert.position}"
            )

            print("Evidence Segment IDs:")

            for segment_id in expert.evidence_segment_ids:

                print(
                    f"- {segment_id}"
                )

    # --------------------------------------------------
    # DIFFERENCES
    # --------------------------------------------------

    print("\n")
    print("=" * 80)
    print("DIFFERENCES")
    print("=" * 80)

    for difference in result.differences:

        print(
            f"\nTopic: {difference.topic}"
        )

        print(
            f"Description: {difference.description}"
        )

        for expert in difference.expert_positions:

            print(
                f"\nExpert: {expert.expert}"
            )

            print(
                f"Market: {expert.market}"
            )

            print(
                f"Position: {expert.position}"
            )

            print("Evidence Segment IDs:")

            for segment_id in expert.evidence_segment_ids:

                print(
                    f"- {segment_id}"
                )

    # --------------------------------------------------
    # DISAGREEMENTS
    # --------------------------------------------------

    print("\n")
    print("=" * 80)
    print("DISAGREEMENTS")
    print("=" * 80)

    for disagreement in result.disagreements:

        print(
            f"\nTopic: {disagreement.topic}"
        )

        print(
            f"Description: {disagreement.description}"
        )

        for expert in disagreement.expert_positions:

            print(
                f"\nExpert: {expert.expert}"
            )

            print(
                f"Market: {expert.market}"
            )

            print(
                f"Position: {expert.position}"
            )

            print("Evidence Segment IDs:")

            for segment_id in expert.evidence_segment_ids:

                print(
                    f"- {segment_id}"
                )