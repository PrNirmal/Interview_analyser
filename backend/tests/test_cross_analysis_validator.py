from app.domain.analysis import (
    CommonTheme,
    CrossExpertAnalysis,
    Difference,
    Disagreement,
    ExpertPosition,
)
from app.domain.answer import EvidenceReference
from app.domain.interview import (
    InterviewAnalysis,
    InterviewQuestionAnswer,
)
from app.validation.cross_analysis_validator import (
    repair_cross_expert_analysis,
    validate_cross_expert_analysis,
)


def test_cross_analysis_validator_accepts_correct_evidence():

    france = InterviewAnalysis(
        transcript_id="Transcript_1_France",
        expert="Dr. Jean Martin",
        role="Head of Urology",
        market="France",
        answers=[
            InterviewQuestionAnswer(
                question_id="Q1",
                question="How would you describe adoption?",
                answer="Adoption is increasing.",
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="Transcript_1_France-12",
                        timestamp="05:07",
                        quote="Adoption continues increasing.",
                    )
                ],
            )
        ],
    )

    germany = InterviewAnalysis(
        transcript_id="Transcript_2_Germany",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
        answers=[
            InterviewQuestionAnswer(
                question_id="Q1",
                question="How would you describe adoption?",
                answer="Adoption is increasing.",
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="Transcript_2_Germany-2",
                        timestamp="05:10",
                        quote="Adoption is growing.",
                    )
                ],
            )
        ],
    )

    cross_analysis = CrossExpertAnalysis(
        common_themes=[
            CommonTheme(
                theme="Increasing adoption",
                description="Adoption is increasing.",
                experts=[
                    ExpertPosition(
                        expert="Dr. Jean Martin",
                        market="France",
                        position="Adoption is increasing.",
                        evidence_segment_ids=[
                            "Transcript_1_France-12"
                        ],
                    ),
                    ExpertPosition(
                        expert="Anna Keller",
                        market="Germany",
                        position="Adoption is increasing.",
                        evidence_segment_ids=[
                            "Transcript_2_Germany-2"
                        ],
                    ),
                ],
            )
        ],
        differences=[],
        disagreements=[],
    )

    assert validate_cross_expert_analysis(
        analysis=cross_analysis,
        expert_analyses=[
            france,
            germany,
        ],
    )


def test_cross_analysis_validator_rejects_unknown_evidence():

    france = InterviewAnalysis(
        transcript_id="Transcript_1_France",
        expert="Dr. Jean Martin",
        role="Head of Urology",
        market="France",
        answers=[
            InterviewQuestionAnswer(
                question_id="Q1",
                question="How would you describe adoption?",
                answer="Adoption is increasing.",
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="Transcript_1_France-12",
                        timestamp="05:07",
                        quote="Adoption continues increasing.",
                    )
                ],
            )
        ],
    )

    germany = InterviewAnalysis(
        transcript_id="Transcript_2_Germany",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
        answers=[
            InterviewQuestionAnswer(
                question_id="Q1",
                question="How would you describe adoption?",
                answer="Adoption is increasing.",
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="Transcript_2_Germany-2",
                        timestamp="05:10",
                        quote="Adoption is growing.",
                    )
                ],
            )
        ],
    )

    cross_analysis = CrossExpertAnalysis(
        common_themes=[
            CommonTheme(
                theme="Increasing adoption",
                description="Adoption is increasing.",
                experts=[
                    ExpertPosition(
                        expert="Dr. Jean Martin",
                        market="France",
                        position="Adoption is increasing.",
                        evidence_segment_ids=[
                            "Transcript_1_France-999"
                        ],
                    ),
                    ExpertPosition(
                        expert="Anna Keller",
                        market="Germany",
                        position="Adoption is increasing.",
                        evidence_segment_ids=[
                            "Transcript_2_Germany-2"
                        ],
                    ),
                ],
            )
        ],
        differences=[],
        disagreements=[],
    )

    assert not validate_cross_expert_analysis(
        analysis=cross_analysis,
        expert_analyses=[
            france,
            germany,
        ],
    )


def test_cross_analysis_validator_rejects_wrong_expert_evidence():

    france = InterviewAnalysis(
        transcript_id="Transcript_1_France",
        expert="Dr. Jean Martin",
        role="Head of Urology",
        market="France",
        answers=[
            InterviewQuestionAnswer(
                question_id="Q1",
                question="How would you describe adoption?",
                answer="Adoption is increasing.",
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="Transcript_1_France-12",
                        timestamp="05:07",
                        quote="Adoption continues increasing.",
                    )
                ],
            )
        ],
    )

    germany = InterviewAnalysis(
        transcript_id="Transcript_2_Germany",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
        answers=[
            InterviewQuestionAnswer(
                question_id="Q1",
                question="How would you describe adoption?",
                answer="Adoption is increasing.",
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="Transcript_2_Germany-2",
                        timestamp="05:10",
                        quote="Adoption is growing.",
                    )
                ],
            )
        ],
    )

    cross_analysis = CrossExpertAnalysis(
        common_themes=[
            CommonTheme(
                theme="Increasing adoption",
                description="Adoption is increasing.",
                experts=[
                    ExpertPosition(
                        expert="Dr. Jean Martin",
                        market="France",
                        position="Adoption is increasing.",
                        evidence_segment_ids=[
                            "Transcript_2_Germany-2"
                        ],
                    ),
                    ExpertPosition(
                        expert="Anna Keller",
                        market="Germany",
                        position="Adoption is increasing.",
                        evidence_segment_ids=[
                            "Transcript_2_Germany-2"
                        ],
                    ),
                ],
            )
        ],
        differences=[],
        disagreements=[],
    )

    assert not validate_cross_expert_analysis(
        analysis=cross_analysis,
        expert_analyses=[
            france,
            germany,
        ],
    )


def test_cross_analysis_validator_rejects_modified_expert_name():

    france = InterviewAnalysis(
        transcript_id="Transcript_1_France",
        expert="Dr. Jean Martin",
        role="Head of Urology",
        market="France",
        answers=[
            InterviewQuestionAnswer(
                question_id="Q1",
                question="How would you describe adoption?",
                answer="Adoption is increasing.",
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="Transcript_1_France-12",
                        timestamp="05:07",
                        quote="Adoption continues increasing.",
                    )
                ],
            )
        ],
    )

    germany = InterviewAnalysis(
        transcript_id="Transcript_2_Germany",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
        answers=[
            InterviewQuestionAnswer(
                question_id="Q1",
                question="How would you describe adoption?",
                answer="Adoption is increasing.",
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="Transcript_2_Germany-2",
                        timestamp="05:10",
                        quote="Adoption is growing.",
                    )
                ],
            )
        ],
    )

    cross_analysis = CrossExpertAnalysis(
        common_themes=[
            CommonTheme(
                theme="Increasing adoption",
                description="Adoption is increasing.",
                experts=[
                    ExpertPosition(
                        expert="Dr. Jean Martin (France)",
                        market="France",
                        position="Adoption is increasing.",
                        evidence_segment_ids=[
                            "Transcript_1_France-12"
                        ],
                    ),
                    ExpertPosition(
                        expert="Anna Keller",
                        market="Germany",
                        position="Adoption is increasing.",
                        evidence_segment_ids=[
                            "Transcript_2_Germany-2"
                        ],
                    ),
                ],
            )
        ],
        differences=[],
        disagreements=[],
    )

    assert not validate_cross_expert_analysis(
        analysis=cross_analysis,
        expert_analyses=[
            france,
            germany,
        ],
    )


def test_cross_analysis_validator_rejects_incompatible_disagreement():

    france = InterviewAnalysis(
        transcript_id="Transcript_1_France",
        expert="Dr. Jean Martin",
        role="Head of Urology",
        market="France",
        answers=[
            InterviewQuestionAnswer(
                question_id="Q1",
                question="How would you describe adoption?",
                answer="Adoption is increasing.",
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="Transcript_1_France-30",
                        timestamp="10:00",
                        quote="Adoption will increase.",
                    )
                ],
            )
        ],
    )

    germany = InterviewAnalysis(
        transcript_id="Transcript_2_Germany",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
        answers=[
            InterviewQuestionAnswer(
                question_id="Q1",
                question="How would you describe adoption?",
                answer="Adoption is declining.",
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="Transcript_2_Germany-30",
                        timestamp="10:00",
                        quote="Adoption will decline.",
                    )
                ],
            )
        ],
    )

    cross_analysis = CrossExpertAnalysis(
        common_themes=[],
        differences=[],
        disagreements=[
            Disagreement(
                topic="Adoption direction",
                description="The experts express incompatible expectations.",
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
        ],
    )

    assert validate_cross_expert_analysis(
        analysis=cross_analysis,
        expert_analyses=[
            france,
            germany,
        ],
    )


def test_cross_analysis_validator_rejects_obviously_compatible_disagreement():

    france = InterviewAnalysis(
        transcript_id="Transcript_1_France",
        expert="Dr. Jean Martin",
        role="Head of Urology",
        market="France",
        answers=[
            InterviewQuestionAnswer(
                question_id="Q5",
                question="What adoption trend do you expect?",
                answer="Adoption should continue increasing steadily.",
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="Transcript_1_France-40",
                        timestamp="11:00",
                        quote="Adoption should continue increasing steadily.",
                    )
                ],
            )
        ],
    )

    germany = InterviewAnalysis(
        transcript_id="Transcript_2_Germany",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
        answers=[
            InterviewQuestionAnswer(
                question_id="Q5",
                question="What adoption trend do you expect?",
                answer="Growth is expected to be gradual.",
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id="Transcript_2_Germany-40",
                        timestamp="11:00",
                        quote="Growth is expected to be gradual.",
                    )
                ],
            )
        ],
    )

    cross_analysis = CrossExpertAnalysis(
        common_themes=[],
        differences=[],
        disagreements=[
            Disagreement(
                topic="Expected adoption trend",
                description="The experts express different growth expectations.",
                expert_positions=[
                    ExpertPosition(
                        expert="Dr. Jean Martin",
                        market="France",
                        position="Adoption should continue increasing steadily.",
                        evidence_segment_ids=[
                            "Transcript_1_France-40"
                        ],
                    ),
                    ExpertPosition(
                        expert="Anna Keller",
                        market="Germany",
                        position="Growth is expected to be gradual.",
                        evidence_segment_ids=[
                            "Transcript_2_Germany-40"
                        ],
                    ),
                ],
            )
        ],
    )

    assert not validate_cross_expert_analysis(
        analysis=cross_analysis,
        expert_analyses=[
            france,
            germany,
        ],
    )


def _analysis_with_segments(
    transcript_id: str,
    expert: str,
    market: str,
    segment_ids: list[str],
) -> InterviewAnalysis:
    return InterviewAnalysis(
        transcript_id=transcript_id,
        expert=expert,
        role="Expert",
        market=market,
        answers=[
            InterviewQuestionAnswer(
                question_id="Q1",
                question="Question",
                answer="Answer",
                confidence="high",
                evidence=[
                    EvidenceReference(
                        segment_id=segment_id,
                        timestamp="00:01",
                        quote=f"Quote for {segment_id}",
                    )
                    for segment_id in segment_ids
                ],
            )
        ],
    )


def test_repair_keeps_valid_theme_and_reclassifies_compatible_disagreement():
    france = _analysis_with_segments(
        "Transcript_1_France",
        "Dr. Jean Martin",
        "France",
        [
            "Transcript_1_France-2",
            "Transcript_1_France-4",
            "Transcript_1_France-8",
            "Transcript_1_France-12",
        ],
    )
    germany = _analysis_with_segments(
        "Transcript_2_Germany",
        "Anna Keller",
        "Germany",
        [
            "Transcript_2_Germany-2",
            "Transcript_2_Germany-4",
            "Transcript_2_Germany-6",
            "Transcript_2_Germany-10",
            "Transcript_2_Germany-12",
            "Transcript_2_Germany-14",
        ],
    )
    uk = _analysis_with_segments(
        "Transcript_3_UK",
        "Dr. Emily Carter",
        "United Kingdom",
        [
            "Transcript_3_UK-4",
            "Transcript_3_UK-10",
        ],
    )
    experts = [france, germany, uk]

    generated = CrossExpertAnalysis(
        common_themes=[
            CommonTheme(
                theme="Adoption is increasing across the markets.",
                description=(
                    "All three experts expect adoption to increase, "
                    "although they describe different growth expectations."
                ),
                experts=[
                    ExpertPosition(
                        expert="Dr. Jean Martin",
                        market="France",
                        position=(
                            "Adoption is growing but still concentrated in "
                            "larger academic hospitals, with about 15 to 20% "
                            "more procedures annually in stronger centers."
                        ),
                        evidence_segment_ids=[
                            "Transcript_1_France-2",
                            "Transcript_1_France-12",
                            "Transcript_1_France-999",
                        ],
                    ),
                    ExpertPosition(
                        expert="Anna Keller",
                        market="Germany",
                        position=(
                            "Adoption is expected to be around high single "
                            "digits or low double digits in procedure volumes."
                        ),
                        evidence_segment_ids=[
                            "Transcript_2_Germany-12",
                            "Transcript_2_Germany-4",
                        ],
                    ),
                    ExpertPosition(
                        expert="Dr. Emily Carter",
                        market="United Kingdom",
                        position=(
                            "Adoption is expected to accelerate if training "
                            "expands, with procedure growth potentially above "
                            "15 percent annually in some areas."
                        ),
                        evidence_segment_ids=["Transcript_3_UK-10"],
                    ),
                ],
            )
        ],
        differences=[
            Difference(
                topic="Main barriers to adoption",
                description="Experts emphasize different adoption barriers.",
                expert_positions=[
                    ExpertPosition(
                        expert="Dr. Jean Martin",
                        market="France",
                        position="Capital budget approval is the main barrier.",
                        evidence_segment_ids=["Transcript_1_France-4"],
                    ),
                    ExpertPosition(
                        expert="Anna Keller",
                        market="Germany",
                        position="Cost and the economic case are the main barriers.",
                        evidence_segment_ids=["Transcript_2_Germany-4"],
                    ),
                    ExpertPosition(
                        expert="Dr. Emily Carter",
                        market="United Kingdom",
                        position="Training capacity is as important as funding.",
                        evidence_segment_ids=["Transcript_3_UK-4"],
                    ),
                ],
            )
        ],
        disagreements=[
            Disagreement(
                topic="Expected annual procedure growth",
                description=(
                    "Experts express different but compatible expectations "
                    "regarding the rate of adoption growth."
                ),
                expert_positions=[
                    ExpertPosition(
                        expert="Dr. Jean Martin",
                        market="France",
                        position=(
                            "He expects adoption to continue increasing, but "
                            "smaller hospitals will remain slower."
                        ),
                        evidence_segment_ids=[
                            "Transcript_1_France-12",
                            "Transcript_1_France-2",
                        ],
                    ),
                    ExpertPosition(
                        expert="Anna Keller",
                        market="Germany",
                        position=(
                            "She expects adoption to grow at a moderate pace, "
                            "possibly around high single digits or low double digits."
                        ),
                        evidence_segment_ids=["Transcript_2_Germany-12"],
                    ),
                    ExpertPosition(
                        expert="Dr. Emily Carter",
                        market="United Kingdom",
                        position=(
                            "She expects adoption to accelerate if training expands, "
                            "with procedure growth potentially above 15 percent "
                            "annually in some areas."
                        ),
                        evidence_segment_ids=["Transcript_3_UK-10"],
                    ),
                ],
            )
        ],
    )

    assert not validate_cross_expert_analysis(
        analysis=generated,
        expert_analyses=experts,
    )

    repaired = repair_cross_expert_analysis(
        analysis=generated,
        expert_analyses=experts,
    )

    assert validate_cross_expert_analysis(
        analysis=repaired,
        expert_analyses=experts,
    )
    assert len(repaired.common_themes) == 1
    assert repaired.common_themes[0].experts[0].evidence_segment_ids == [
        "Transcript_1_France-2",
        "Transcript_1_France-12",
    ]
    assert repaired.disagreements == []
    assert len(repaired.differences) == 2
    assert repaired.differences[1].topic == "Expected annual procedure growth"


def test_repair_keeps_a_real_disagreement():
    france = _analysis_with_segments(
        "Transcript_1_France",
        "Dr. Jean Martin",
        "France",
        ["Transcript_1_France-30"],
    )
    germany = _analysis_with_segments(
        "Transcript_2_Germany",
        "Anna Keller",
        "Germany",
        ["Transcript_2_Germany-30"],
    )
    generated = CrossExpertAnalysis(
        common_themes=[],
        differences=[],
        disagreements=[
            Disagreement(
                topic="Adoption direction",
                description="One expert expects growth and the other expects decline.",
                expert_positions=[
                    ExpertPosition(
                        expert="Dr. Jean Martin",
                        market="France",
                        position="Adoption will increase.",
                        evidence_segment_ids=["Transcript_1_France-30"],
                    ),
                    ExpertPosition(
                        expert="Anna Keller",
                        market="Germany",
                        position="Adoption will decline.",
                        evidence_segment_ids=["Transcript_2_Germany-30"],
                    ),
                ],
            )
        ],
    )

    repaired = repair_cross_expert_analysis(
        analysis=generated,
        expert_analyses=[france, germany],
    )

    assert len(repaired.disagreements) == 1
    assert repaired.differences == []
    assert validate_cross_expert_analysis(
        analysis=repaired,
        expert_analyses=[france, germany],
    )