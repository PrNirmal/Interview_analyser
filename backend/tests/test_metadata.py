from pathlib import Path

from app.ingestion.document_loader import load_document
from app.ingestion.transcript_parser import parse_transcript
from app.ingestion.metadata import segments_to_documents


TEST_FILE = (
    Path(__file__).parent
    / "Transcript_2_Germany_test.txt"
)


def test_segments_to_documents():

    documents = load_document(str(TEST_FILE))

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

    assert retrieval_documents

    for document in retrieval_documents:

        assert document.page_content.strip()

        assert "segment_id" in document.metadata
        assert "transcript_id" in document.metadata
        assert "expert" in document.metadata
        assert "role" in document.metadata
        assert "market" in document.metadata
        assert "timestamp" in document.metadata
        assert "speaker" in document.metadata

    print(
        f"\nCreated {len(retrieval_documents)} "
        "retrieval documents"
    )

    for document in retrieval_documents[:3]:

        print("\n---")
        print("Content:", document.page_content)
        print("Metadata:", document.metadata)