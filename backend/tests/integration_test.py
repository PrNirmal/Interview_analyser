from pathlib import Path

from app.application.question_answer_service import (
    QuestionAnswerService,
)
from app.ingestion.document_loader import load_document
from app.ingestion.metadata import segments_to_documents
from app.ingestion.transcript_parser import parse_transcript


TEST_FILE = Path(__file__).parent / "Transcript_2_Germany_test.txt"


def build_service():

    documents = load_document(
        str(TEST_FILE)
    )

    segments = parse_transcript(
        documents=documents,
        transcript_id="Transcript_2_Germany_test",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
    )

    retrieval_documents = segments_to_documents(
        segments
    )

    return QuestionAnswerService(
        retrieval_documents
    )


def test_question_answer_service():

    service = build_service()

    question = (
        "What are the main barriers to robotic surgery adoption?"
    )

    answer = service.answer(
        question=question,
        top_k=5,
    )

    print("\nANSWER")
    print("=" * 70)
    print(answer.answer)

    print("\nEVIDENCE")
    print("=" * 70)

    for evidence in answer.evidence:

        print(
            f"\nSegment: {evidence.segment_id}"
        )

        print(
            f"Timestamp: {evidence.timestamp}"
        )

        print(
            f"Quote: {evidence.quote}"
        )

    print(
        f"\nConfidence: {answer.confidence}"
    )

    assert answer.answer
    assert answer.evidence