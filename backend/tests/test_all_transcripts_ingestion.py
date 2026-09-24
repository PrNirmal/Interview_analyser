from pathlib import Path

from app.application.ingestion_service import IngestionService
from app.domain.transcript import TranscriptMetadata


DATA_DIR = Path(__file__).parent.parent / "data"


TRANSCRIPTS = [
    {
        "file": "Transcript_1_France.txt",
        "id": "Transcript_1_France",
        "expert": "Dr. Jean Martin",
        "role": "Head of Urology",
        "market": "France",
    },
    {
        "file": "Transcript_2_Germany.txt",
        "id": "Transcript_2_Germany",
        "expert": "Anna Keller",
        "role": "Former Hospital Procurement Director",
        "market": "Germany",
    },
    {
        "file": "Transcript_3_UK.txt",
        "id": "Transcript_3_UK",
        "expert": "Dr. Emily Carter",
        "role": "Consultant Urologist",
        "market": "United Kingdom",
    },
]


def test_all_transcripts_ingestion():

    service = IngestionService()

    total_documents = 0

    for transcript in TRANSCRIPTS:

        metadata = TranscriptMetadata(
            transcript_id=transcript["id"],
            expert=transcript["expert"],
            role=transcript["role"],
            market=transcript["market"],
        )

        documents = service.ingest_transcript(
            file_path=str(
                DATA_DIR / transcript["file"]
            ),
            metadata=metadata,
        )

        assert documents

        total_documents += len(documents)

        print(
            f"\n{transcript['market']}: "
            f"{len(documents)} segments"
        )

        for document in documents:
            assert document.metadata["transcript_id"] == transcript["id"]
            assert document.metadata["expert"] == transcript["expert"]
            assert document.metadata["market"] == transcript["market"]
            assert document.metadata["timestamp"]
            assert document.metadata["speaker"]
            assert document.page_content

    print(
        f"\nTotal transcript segments: {total_documents}"
    )

    assert total_documents > 0