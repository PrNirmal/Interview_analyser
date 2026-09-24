from pathlib import Path

from app.application.analysis_service import CrossExpertAnalysisService
from app.application.full_analysis_service import FullInterviewAnalysisService


# =============================================================================
# PATHS
# =============================================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"

GUIDE_PATH = DATA_DIR / "Interview_Guide.txt"


# =============================================================================
# TRANSCRIPTS
# =============================================================================
#
# IMPORTANT:
# FullInterviewAnalysisService expects:
#
#   transcript_id
#   expert
#   role
#   market
#   file_path
#
# Do not rename file_path to path.
# =============================================================================

TRANSCRIPTS = [
    {
        "transcript_id": "Transcript_1_France",
        "expert": "Dr. Jean Martin",
        "role": "Head of Urology",
        "market": "France",
        "file_path": str(
            DATA_DIR / "Transcript_1_France.txt"
        ),
    },
    {
        "transcript_id": "Transcript_2_Germany",
        "expert": "Anna Keller",
        "role": "Former Hospital Procurement Director",
        "market": "Germany",
        "file_path": str(
            DATA_DIR / "Transcript_2_Germany.txt"
        ),
    },
    {
        "transcript_id": "Transcript_3_UK",
        "expert": "Dr. Emily Carter",
        "role": "Consultant Surgeon",
        "market": "United Kingdom",
        "file_path": str(
            DATA_DIR / "Transcript_3_UK.txt"
        ),
    },
]


# =============================================================================
# TEST
# =============================================================================

def test_full_analysis():

    # -------------------------------------------------------------------------
    # 1. Analyze all three expert interviews
    # -------------------------------------------------------------------------

    interview_service = FullInterviewAnalysisService()

    analyses = interview_service.analyze_all(
        guide_path=str(GUIDE_PATH),
        transcripts=TRANSCRIPTS,
    )

    # -------------------------------------------------------------------------
    # 2. Basic validation
    # -------------------------------------------------------------------------

    assert len(analyses) == 3

    for analysis in analyses:

        assert analysis.transcript_id
        assert analysis.expert
        assert analysis.role
        assert analysis.market

        # Interview guide currently contains 6 questions.
        assert len(analysis.answers) == 6

        for answer in analysis.answers:

            assert answer.question_id
            assert answer.question
            assert answer.answer

            assert answer.confidence in {
                "high",
                "medium",
                "low",
            }

            # Individual answer evidence uses answer.evidence.
            assert answer.evidence is not None

            for evidence in answer.evidence:

                assert evidence.segment_id
                assert evidence.timestamp
                assert evidence.quote

    # -------------------------------------------------------------------------
    # 3. Print individual expert analysis
    # -------------------------------------------------------------------------

    print("\n")
    print("=" * 100)
    print("ALL EXPERT INTERVIEW ANALYSIS")
    print("=" * 100)

    for analysis in analyses:

        print("\n")
        print("#" * 100)

        print(f"Expert: {analysis.expert}")
        print(f"Role: {analysis.role}")
        print(f"Market: {analysis.market}")
        print(f"Transcript: {analysis.transcript_id}")

        print("#" * 100)

        for answer in analysis.answers:

            print("\n" + "-" * 80)

            print(
                f"{answer.question_id}: "
                f"{answer.question}"
            )

            print("\nANSWER:")
            print(answer.answer)

            print("\nCONFIDENCE:")
            print(answer.confidence)

            print("\nEVIDENCE:")

            for evidence in answer.evidence:

                print(
                    f"[{evidence.segment_id}] "
                    f"{evidence.timestamp}"
                )

                print(
                    f'"{evidence.quote}"'
                )

    # -------------------------------------------------------------------------
    # 4. Cross-expert analysis
    # -------------------------------------------------------------------------

    cross_service = CrossExpertAnalysisService()

    cross_analysis = cross_service.analyze(
        analyses
    )

    # -------------------------------------------------------------------------
    # 5. Validate cross-expert result
    # -------------------------------------------------------------------------

    assert cross_analysis is not None

    assert hasattr(
        cross_analysis,
        "common_themes",
    )

    assert hasattr(
        cross_analysis,
        "disagreements",
    )

    # -------------------------------------------------------------------------
    # 6. Print common themes
    # -------------------------------------------------------------------------

    print("\n")
    print("=" * 100)
    print("CROSS-EXPERT ANALYSIS")
    print("=" * 100)

    print("\n")
    print("=" * 100)
    print("COMMON THEMES")
    print("=" * 100)

    for theme in cross_analysis.common_themes:

        print("\n")
        print(f"THEME: {theme.theme}")

        print("\nDescription:")
        print(theme.description)

        print("\nExperts:")

        for expert in theme.experts:

            print("\n" + "-" * 80)

            print(
                f"Expert: {expert.expert}"
            )

            print(
                f"Market: {expert.market}"
            )

            print(
                f"Position: {expert.position}"
            )

            # IMPORTANT:
            # ExpertPosition has evidence_segment_ids,
            # NOT evidence.
            print("\nEvidence Segment IDs:")

            for segment_id in expert.evidence_segment_ids:

                print(
                    f"- {segment_id}"
                )

    # -------------------------------------------------------------------------
    # 7. Print disagreements
    # -------------------------------------------------------------------------

    print("\n")
    print("=" * 100)
    print("DISAGREEMENTS")
    print("=" * 100)

    for disagreement in cross_analysis.disagreements:

        print("\n")
        print(
            f"TOPIC: {disagreement.topic}"
        )

        print("\nDescription:")
        print(disagreement.description)

        print("\nExpert Positions:")

        for expert_position in disagreement.expert_positions:

            print("\n" + "-" * 80)

            print(
                f"Expert: {expert_position.expert}"
            )

            print(
                f"Market: {expert_position.market}"
            )

            print(
                f"Position: {expert_position.position}"
            )

            print("\nEvidence Segment IDs:")

            for segment_id in expert_position.evidence_segment_ids:

                print(
                    f"- {segment_id}"
                )

    # -------------------------------------------------------------------------
    # 8. Basic cross-analysis assertions
    # -------------------------------------------------------------------------

    for theme in cross_analysis.common_themes:

        assert theme.theme
        assert theme.description
        assert theme.experts

        for expert in theme.experts:

            assert expert.expert
            assert expert.market
            assert expert.position

            assert isinstance(
                expert.evidence_segment_ids,
                list,
            )

    for disagreement in cross_analysis.disagreements:

        assert disagreement.topic
        assert disagreement.description
        assert disagreement.expert_positions

        for expert_position in disagreement.expert_positions:

            assert expert_position.expert
            assert expert_position.market
            assert expert_position.position

            assert isinstance(
                expert_position.evidence_segment_ids,
                list,
            )

    # -------------------------------------------------------------------------
    # 9. Final success message
    # -------------------------------------------------------------------------

    print("\n")
    print("=" * 100)
    print("FULL ANALYSIS TEST PASSED")
    print("=" * 100)