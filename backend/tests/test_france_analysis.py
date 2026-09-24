from app.application.ingestion_service import IngestionService
from app.application.interview_service import InterviewService
from app.domain.transcript import TranscriptMetadata
from app.ingestion.document_loader import load_document
from app.ingestion.interview_guide_parser import parse_interview_guide


def test_france_analysis():

    # ---------------------------------------------
    # 1. Load interview guide
    # ---------------------------------------------

    guide_documents = load_document(
        "data/Interview_Guide.txt"
    )

    questions = parse_interview_guide(
        guide_documents
    )

    assert len(questions) == 6

    # ---------------------------------------------
    # 2. Transcript metadata
    # ---------------------------------------------

    metadata = TranscriptMetadata(
        transcript_id="Transcript_1_France",
        expert="Dr. Jean Martin",
        role="Head of Urology",
        market="France",
    )

    # ---------------------------------------------
    # 3. Parse transcript
    # ---------------------------------------------

    ingestion_service = IngestionService()

    documents = ingestion_service.ingest_transcript(
        file_path="data/Transcript_1_France.txt",
        metadata=metadata,
    )

    assert documents

    # ---------------------------------------------
    # 4. Create interview service
    # ---------------------------------------------

    service = InterviewService(
        documents=documents,
        questions=questions,
        transcript_id=metadata.transcript_id,
        expert=metadata.expert,
        role=metadata.role,
        market=metadata.market,
    )

    # ---------------------------------------------
    # 5. Analyze all 6 questions
    # ---------------------------------------------

    result = service.analyze()

    # ---------------------------------------------
    # 6. Print results
    # ---------------------------------------------

    print("\n")
    print("=" * 80)
    print("FRANCE INTERVIEW ANALYSIS")
    print("=" * 80)

    print(f"\nExpert: {result.expert}")
    print(f"Role: {result.role}")
    print(f"Market: {result.market}")
    print(f"Questions answered: {len(result.answers)}")

    for answer in result.answers:

        print("\n" + "-" * 80)

        print(
            f"{answer.question_id}: "
            f"{answer.question}"
        )

        print("\nANSWER:")
        print(answer.answer)

        print("\nCONFIDENCE:")
        print(answer.confidence)

        print("\nEVIDENCE:")

        for evidence in answer.evidence:

            print(
                f"\n[{evidence.segment_id}] "
                f"{evidence.timestamp}"
            )

            print(
                f'"{evidence.quote}"'
            )

    print("\n" + "=" * 80)

    # ---------------------------------------------
    # 7. Assertions
    # ---------------------------------------------

    assert result.transcript_id == "Transcript_1_France"
    assert result.expert == "Dr. Jean Martin"
    assert result.market == "France"

    assert len(result.answers) == 6

    for answer in result.answers:

        assert answer.question
        assert answer.answer
        assert answer.confidence in {
            "high",
            "medium",
            "low",
        }