from pathlib import Path

from app.application.full_analysis_service import (
    FullInterviewAnalysisService,
)
from app.ingestion.corpus import TRANSCRIPTS


DATA_DIR = Path("data")

GUIDE_PATH = (
    DATA_DIR / "Interview_Guide.txt"
)


def test_full_interview_analysis():

    service = FullInterviewAnalysisService()

    analyses = service.analyze_all(
        guide_path=str(GUIDE_PATH),
        transcripts=TRANSCRIPTS,
    )

    assert len(analyses) == 3

    for analysis in analyses:

        print("\n")
        print("=" * 70)
        print(
            f"{analysis.expert} | "
            f"{analysis.market}"
        )
        print("=" * 70)

        assert len(analysis.answers) == 6

        for answer in analysis.answers:

            print("\n")
            print(
                f"{answer.question_id}: "
                f"{answer.question}"
            )

            print(
                "\nANSWER:",
                answer.answer,
            )

            print(
                "\nCONFIDENCE:",
                answer.confidence,
            )

            print("\nEVIDENCE:")

            for evidence in answer.evidence:

                print(
                    f"[{evidence.segment_id}] "
                    f"{evidence.timestamp}"
                )

                print(
                    f'"{evidence.quote}"'
                )

                print("-" * 50)

            assert answer.question
            assert answer.answer
            assert answer.confidence in {
                "high",
                "medium",
                "low",
            }

            for evidence in answer.evidence:
                assert evidence.segment_id
                assert evidence.timestamp
                assert evidence.quote

    total_answers = sum(
        len(analysis.answers)
        for analysis in analyses
    )

    assert total_answers == 18

    print(
        f"\nTotal answers generated: "
        f"{total_answers}"
    )