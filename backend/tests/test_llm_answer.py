from openai.types.beta import agent_session_requires_action_event
from pathlib import Path

from app.ingestion.document_loader import load_document
from app.ingestion.metadata import segments_to_documents
from app.ingestion.transcript_parser import parse_transcript
from app.llm.structure_output import generate_answer


TEST_FILE = Path(__file__).parent / "Transcript_2_Germany_test.txt"


def test_llm_answer():

    documents = load_document(str(TEST_FILE))

    segments = parse_transcript(
        documents=documents,
        transcript_id="Transcript_2_Germany_test",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
    )

    retrieval_documents = segments_to_documents(segments)

    # Use a small subset for this test.
    evidence_documents = retrieval_documents[:5]

    question = "What are the main barriers to robotic surgery adoption?"

    result = generate_answer(
        question=question,
        documents=evidence_documents,
    )

    print("\nANSWER")
    print("=" * 60)
    print(result.answer)

    print("\nEVIDENCE")
    print("=" * 60)

    for item in result.evidence:
        print("Segment:", item.segment_id)
        print("Timestamp:", item.timestamp)
        print("Quote:", item.quote)

    print("\nConfidence:", result.confidence)

    assert result.answer
    assert result.evidence