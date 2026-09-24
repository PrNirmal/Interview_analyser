from langchain_core.documents import Document

from app.domain.transcript import TranscriptMetadata, TranscriptSegment
from app.ingestion.document_loader import load_document
from app.ingestion.metadata import segments_to_documents
from app.ingestion.transcript_parser import parse_transcript


class IngestionService:

    def ingest_transcript(
        self,
        file_path: str,
        metadata: TranscriptMetadata,
    ) -> list[Document]:

        documents = load_document(file_path)

        if not documents:
            raise ValueError(
                f"No content found in {file_path}"
            )

        segments: list[TranscriptSegment] = parse_transcript(
            documents=documents,
            transcript_id=metadata.transcript_id,
            expert=metadata.expert,
            role=metadata.role,
            market=metadata.market,
        )

        if not segments:
            raise ValueError(
                f"No transcript segments found in {file_path}"
            )

        return segments_to_documents(segments)