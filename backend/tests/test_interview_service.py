from pathlib import Path

from app.application.interview_service import InterviewService
from app.ingestion.document_loader import load_document
from app.ingestion.interview_guide_parser import (
    parse_interview_guide,
)
from app.ingestion.metadata import segments_to_documents
from app.ingestion.transcript_parser import parse_transcript


BASE_DIR = Path(__file__).parent

GUIDE_FILE = (
    BASE_DIR / "Interview_Guide_test.txt"
)

TRANSCRIPT_FILE = (
    BASE_DIR / "Transcript_2_Germany_test.txt"
)


def build_service():

    # ==================================================
    # 1. Load Interview Guide
    # ==================================================

    guide_documents = load_document(
        str(GUIDE_FILE)
    )

    questions = parse_interview_guide(
        guide_documents
    )

    assert questions

    # ==================================================
    # 2. Load Expert Transcript
    # ==================================================

    transcript_documents = load_document(
        str(TRANSCRIPT_FILE)
    )

    assert transcript_documents

    # ==================================================
    # 3. Parse Transcript
    # ==================================================

    segments = parse_transcript(
        documents=transcript_documents,
        transcript_id="Transcript_2_Germany_test",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
    )

    assert segments

    # ==================================================
    # 4. Convert Transcript to Retrieval Documents
    # ==================================================

    retrieval_documents = segments_to_documents(
        segments
    )

    assert retrieval_documents

    # ==================================================
    # 5. Build Interview Service
    # ==================================================

    return InterviewService(
        documents=retrieval_documents,
        questions=questions,
        transcript_id="Transcript_2_Germany_test",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
    )


def test_full_interview_analysis():

    service = build_service()

    # ==================================================
    # Run Analysis
    # ==================================================

    result = service.analyze()

    # ==================================================
    # Display Results
    # ==================================================

    print("\n")
    print("=" * 80)
    print("INTERVIEW ANALYSIS")
    print("=" * 80)

    print(
        f"\nExpert: {result.expert}"
    )

    print(
        f"Role: {result.role}"
    )

    print(
        f"Market: {result.market}"
    )

    print(
        f"Transcript: {result.transcript_id}"
    )

    print(
        f"\nQuestions processed: "
        f"{len(result.answers)}"
    )

    # ==================================================
    # Print Every Answer
    # ==================================================

    for answer in result.answers:

        print("\n")
        print("=" * 80)

        print(
            f"{answer.question_id}: "
            f"{answer.question}"
        )

        print("-" * 80)

        print("\nANSWER:")
        print(answer.answer)

        print("\nCONFIDENCE:")
        print(answer.confidence)

        print("\nEVIDENCE:")

        if not answer.evidence:

            print(
                "No supporting evidence found."
            )

        for evidence in answer.evidence:

            print(
                f"\nSegment: "
                f"{evidence.segment_id}"
            )

            print(
                f"Timestamp: "
                f"{evidence.timestamp}"
            )

            print(
                f'Quote: "{evidence.quote}"'
            )

    # ==================================================
    # Assertions
    # ==================================================

    assert result

    assert (
        result.transcript_id
        == "Transcript_2_Germany_test"
    )

    assert (
        result.expert
        == "Anna Keller"
    )

    assert (
        result.market
        == "Germany"
    )

    assert len(result.answers) == len(
        result.answers
    )

    for answer in result.answers:

        assert answer.question_id

        assert answer.question

        assert answer.answer

        assert answer.confidence in {
            "high",
            "medium",
            "low",
        }