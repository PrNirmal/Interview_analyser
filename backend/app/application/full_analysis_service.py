from pathlib import Path

from app.application.ingestion_service import IngestionService
from app.application.interview_service import InterviewService
from app.domain.transcript import TranscriptMetadata
from app.ingestion.document_loader import load_document
from app.ingestion.interview_guide_parser import parse_interview_guide


class FullInterviewAnalysisService:

    def __init__(self):
        self.ingestion_service = IngestionService()

    def load_questions(
        self,
        guide_path: str,
    ):
        documents = load_document(guide_path)

        questions = parse_interview_guide(
            documents
        )

        if not questions:
            raise ValueError(
                "No interview questions found."
            )

        return questions

    def analyze_transcript(
        self,
        transcript: dict,
        questions,
    ):

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

        service = InterviewService(
            documents=documents,
            questions=questions,
            transcript_id=metadata.transcript_id,
            expert=metadata.expert,
            role=metadata.role,
            market=metadata.market,
        )

        return service.analyze()

    def analyze_all(
        self,
        guide_path: str,
        transcripts: list[dict],
    ):

        questions = self.load_questions(
            guide_path
        )

        analyses = []

        for transcript in transcripts:

            analysis = self.analyze_transcript(
                transcript=transcript,
                questions=questions,
            )

            analyses.append(analysis)

        return analyses