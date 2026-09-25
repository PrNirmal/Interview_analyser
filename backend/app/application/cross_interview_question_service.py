"""Answer a free-form question across one or more interview transcripts."""

from __future__ import annotations

from dataclasses import dataclass

from langchain_core.documents import Document

from app.application.ingestion_service import IngestionService
from app.application.question_answer_service import QuestionAnswerService
from app.domain.answer import InterviewAnswer
from app.domain.transcript import TranscriptMetadata


@dataclass(frozen=True)
class AttributedEvidence:
    segment_id: str
    timestamp: str
    quote: str
    expert: str
    role: str
    market: str
    speaker: str


@dataclass(frozen=True)
class CrossInterviewAnswer:
    question: str
    answer: str
    confidence: str
    evidence: list[AttributedEvidence]


class CrossInterviewQuestionService:
    def __init__(self, ingestion_service: IngestionService | None = None):
        self.ingestion_service = ingestion_service or IngestionService()

    def answer(
        self,
        question: str,
        transcripts: list[dict],
    ) -> CrossInterviewAnswer:
        cleaned = " ".join(question.split()).strip()
        if not cleaned:
            raise ValueError(
                "Enter a question to ask across the analyzed interviews."
            )
        if not transcripts:
            raise ValueError("At least one transcript is required.")

        documents: list[Document] = []
        for transcript in transcripts:
            metadata = TranscriptMetadata(
                transcript_id=transcript["transcript_id"],
                expert=transcript["expert"],
                role=transcript["role"],
                market=transcript["market"],
            )
            documents.extend(
                self.ingestion_service.ingest_transcript(
                    file_path=transcript["file_path"],
                    metadata=metadata,
                )
            )

        generated = QuestionAnswerService(documents).answer(question=cleaned)
        return CrossInterviewAnswer(
            question=cleaned,
            answer=generated.answer,
            confidence=generated.confidence,
            evidence=_attribute_evidence(generated, documents),
        )


def _attribute_evidence(
    answer: InterviewAnswer,
    documents: list[Document],
) -> list[AttributedEvidence]:
    by_segment = {
        str(document.metadata.get("segment_id")): document
        for document in documents
        if document.metadata.get("segment_id")
    }
    attributed: list[AttributedEvidence] = []
    for item in answer.evidence:
        document = by_segment.get(item.segment_id)
        metadata = document.metadata if document is not None else {}
        attributed.append(
            AttributedEvidence(
                segment_id=item.segment_id,
                timestamp=item.timestamp,
                quote=item.quote,
                expert=str(metadata.get("expert", "")),
                role=str(metadata.get("role", "")),
                market=str(metadata.get("market", "")),
                speaker=str(metadata.get("speaker", "")),
            )
        )
    return attributed
