from app.application.corpus_service import CorpusService
from app.ingestion.corpus import TRANSCRIPTS
from app.retrieval.vector_store import get_vector_store


def test_chroma_ingestion():

    service = CorpusService()

    total = service.ingest_transcripts(
        TRANSCRIPTS
    )

    print(
        f"\nInserted {total} transcript segments into ChromaDB"
    )

    assert total > 0

    vector_store = get_vector_store()

    results = vector_store.similarity_search(
        "What are the main barriers to adoption?",
        k=5,
    )

    assert results

    print("\nRetrieved evidence:")

    for document in results:

        print("\n---")
        print(
            "Segment:",
            document.metadata["segment_id"]
        )
        print(
            "Expert:",
            document.metadata["expert"]
        )
        print(
            "Market:",
            document.metadata["market"]
        )
        print(
            "Timestamp:",
            document.metadata["timestamp"]
        )
        print(
            "Text:",
            document.page_content
        )