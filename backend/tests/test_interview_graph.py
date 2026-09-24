from pathlib import Path

from app.graphs.interview_graph import build_interview_graph
from app.ingestion.document_loader import load_document
from app.ingestion.metadata import segments_to_documents
from app.ingestion.transcript_parser import parse_transcript
from app.retrieval.hybrid_retriever import HybridRetriever


TEST_FILE = Path(__file__).parent / "Transcript_2_Germany_test.txt"


def build_graph():

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

    retriever = HybridRetriever(
        retrieval_documents
    )

    return build_interview_graph(
        retriever
    )


def test_interview_graph():

    graph = build_graph()

    question = (
        "What are the main barriers to robotic surgery adoption?"
    )

    result = graph.invoke(
        {
            "question": question,
        }
    )

    print("\nANSWER")
    print("=" * 70)
    print(result["answer"].answer)

    print("\nEVIDENCE")
    print("=" * 70)

    for evidence in result["answer"].evidence:

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
        "\nVALID:",
        result["is_valid"],
    )

    assert result["answer"]
    assert result["is_valid"]