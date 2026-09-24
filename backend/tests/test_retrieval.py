from app.application.ingestion_service import IngestionService
from app.domain.transcript import TranscriptMetadata
from app.retrieval.hybrid_retriever import HybridRetriever


def test_retrieval():

    metadata = TranscriptMetadata(
        transcript_id="Transcript_1_France",
        expert="Dr. Jean Martin",
        role="Head of Urology",
        market="France",
    )

    ingestion_service = IngestionService()

    documents = ingestion_service.ingest_transcript(
        file_path="data/Transcript_1_France.txt",
        metadata=metadata,
    )

    retriever = HybridRetriever(documents)

    question = (
        "How would you describe current adoption "
        "of robotic surgery in your market?"
    )

    results = retriever.retrieve(
        query=question,
        k=5,
        transcript_id="Transcript_1_France",
    )

    print(
        "\n================ RETRIEVAL RESULTS ================\n"
    )

    for index, document in enumerate(results, start=1):

        print(f"--- RESULT {index} ---")

        print(
            "Segment:",
            document.metadata.get("segment_id"),
        )

        print(
            "Timestamp:",
            document.metadata.get("timestamp"),
        )

        print(
            "Speaker:",
            document.metadata.get("speaker"),
        )

        print("\nText:")
        print(document.page_content)

        print("\n")

    assert results
    assert len(results) <= 5

    # Ensure retrieval did not leak another transcript
    for document in results:
        assert (
            document.metadata.get("transcript_id")
            == "Transcript_1_France"
        )