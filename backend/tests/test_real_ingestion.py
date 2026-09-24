from pathlib import Path

from app.application.ingestion_service import (
    IngestionService,
)
from app.domain.transcript import TranscriptMetadata


TEST_FILE = (
    Path(__file__).parent
    / "Transcript_2_Germany_test.txt"
)


def test_ingest_transcript():

    service = IngestionService()

    metadata = TranscriptMetadata(
        transcript_id="Transcript_2_Germany_test",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
    )

    documents = service.ingest_transcript(
        file_path=str(TEST_FILE),
        metadata=metadata,
    )

    assert documents

    print("\nINGESTION RESULT")
    print("=" * 70)

    print(
        "Documents:",
        len(documents),
    )

    for document in documents[:3]:

        print("\nText:")
        print(document.page_content)

        print("\nMetadata:")
        print(document.metadata)