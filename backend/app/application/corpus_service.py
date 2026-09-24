from pathlib import Path

from app.application.ingestion_service import IngestionService
from app.domain.transcript import TranscriptMetadata
from app.retrieval.vector_store import add_documents


class CorpusService:

    def __init__(self):
        self.ingestion_service = IngestionService()

    def ingest_transcripts(
        self,
        transcripts: list[dict],
    ) -> int:

        total_documents = 0

        for transcript in transcripts:

            metadata = TranscriptMetadata(
                transcript_id=transcript["transcript_id"],
                expert=transcript["expert"],
                role=transcript["role"],
                market=transcript["market"],
            )

            documents = self.ingestion_service.ingest_transcript(
                file_path=transcript["file_path"],
                metadata=metadata,
            )

            add_documents(documents)

            total_documents += len(documents)

        return total_documents