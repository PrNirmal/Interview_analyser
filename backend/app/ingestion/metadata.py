from langchain_core.documents import Document

from app.domain.transcript import TranscriptSegment


def segments_to_documents(
    segments: list[TranscriptSegment],
) -> list[Document]:

    documents: list[Document] = []

    for segment in segments:

        document = Document(
            page_content=segment.text,
            metadata={
                "segment_id": segment.segment_id,
                "transcript_id": segment.transcript_id,
                "expert": segment.expert,
                "role": segment.role,
                "market": segment.market,
                "timestamp": segment.timestamp,
                "speaker": segment.speaker,
            },
        )

        documents.append(document)

    return documents