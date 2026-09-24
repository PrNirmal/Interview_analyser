from pathlib import Path

from app.ingestion.document_loader import load_document
from app.ingestion.transcript_parser import parse_transcript
from app.ingestion.metadata import segments_to_documents
from app.retrieval.vector_store import (
    get_vector_store,
    add_documents,
)


TEST_FILE = (
    Path(__file__).parent
    / "Transcript_2_Germany_test.txt"
)


def test_chroma_ingestion_and_retrieval():

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

    add_documents(retrieval_documents)

    vector_store = get_vector_store()

    results = vector_store.similarity_search(
        "What are the main barriers to robotic surgery adoption?",
        k=3,
    )

    assert results

    for result in results:
        print("\n--- RESULT ---")
        print("Content:", result.page_content)
        print("Metadata:", result.metadata)

    assert any(
        "barrier" in result.page_content.lower()
        or "cost" in result.page_content.lower()
        or "utilisation" in result.page_content.lower()
        for result in results
    )