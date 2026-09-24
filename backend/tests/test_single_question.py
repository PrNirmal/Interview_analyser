from app.application.ingestion_service import IngestionService
from app.domain.transcript import TranscriptMetadata
from app.application.interview_service import InterviewService
from app.ingestion.interview_guide_parser import parse_interview_guide
from app.ingestion.document_loader import load_document


def test_single_question():

    # 1. Load interview guide
    guide_documents = load_document(
        "data/Interview_Guide.txt"
    )

    questions = parse_interview_guide(
        guide_documents
    )

    # Use only Q1 for now
    question = questions[0]

    # 2. Load transcript
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

    # 3. Create interview service
    service = InterviewService(
        documents=documents,
        questions=[question],
        transcript_id=metadata.transcript_id,
        expert=metadata.expert,
        role=metadata.role,
        market=metadata.market,
    )

    # 4. Analyze
    result = service.analyze()

    print("\n================ RESULT ================\n")
    print("Expert:", result.expert)
    print("Market:", result.market)

    for answer in result.answers:

        print("\nQuestion:")
        print(answer.question)

        print("\nAnswer:")
        print(answer.answer)

        print("\nConfidence:")
        print(answer.confidence)

        print("\nEvidence:")

        for evidence in answer.evidence:
            print("\nSegment:", evidence.segment_id)
            print("Timestamp:", evidence.timestamp)
            print("Quote:", evidence.quote)

    assert len(result.answers) == 1
    assert result.answers[0].answer
    assert result.answers[0].confidence