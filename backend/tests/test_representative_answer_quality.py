from app.application.ingestion_service import IngestionService
from app.domain.transcript import TranscriptMetadata
from app.llm.structure_output import generate_answer
from app.retrieval.hybrid_retriever import HybridRetriever
from app.validation.answer_validator import validate_answer


CASES = [
    {
        "transcript_id": "Transcript_1_France",
        "expert": "Dr. Jean Martin",
        "role": "Head of Urology",
        "market": "France",
        "file_path": "data/Transcript_1_France.txt",
        "question": "What are the main barriers to adoption?",
    },
    {
        "transcript_id": "Transcript_2_Germany",
        "expert": "Anna Keller",
        "role": "Former Hospital Procurement Director",
        "market": "Germany",
        "file_path": "data/Transcript_2_Germany.txt",
        "question": "How important are hospital budgets and ROI?",
    },
    {
        "transcript_id": "Transcript_3_UK",
        "expert": "Dr. Emily Carter",
        "role": "Consultant Urologist",
        "market": "United Kingdom",
        "file_path": "data/Transcript_3_UK.txt",
        "question": "What is the typical hospital purchasing decision timeline?",
    },
    {
        "transcript_id": "Transcript_3_UK",
        "expert": "Dr. Emily Carter",
        "role": "Consultant Urologist",
        "market": "United Kingdom",
        "file_path": "data/Transcript_3_UK.txt",
        "question": "What are the main barriers to adoption?",
    },
]


def load_documents(case):
    metadata = TranscriptMetadata(
        transcript_id=case["transcript_id"],
        expert=case["expert"],
        role=case["role"],
        market=case["market"],
    )

    ingestion_service = IngestionService()

    return ingestion_service.ingest_transcript(
        file_path=case["file_path"],
        metadata=metadata,
    )


def test_representative_answer_quality():

    for case in CASES:

        print("\n")
        print("=" * 80)
        print(f"QUESTION: {case['question']}")
        print(f"EXPERT: {case['expert']}")
        print(f"MARKET: {case['market']}")
        print("=" * 80)

        documents = load_documents(case)

        retriever = HybridRetriever(
            documents=documents
        )

        evidence_documents = retriever.retrieve(
            query=case["question"],
            k=5,
            transcript_id=case["transcript_id"],
        )

        assert evidence_documents, (
            f"No evidence retrieved for: {case['question']}"
        )

        print("\nEVIDENCE SENT TO LLM")
        print("-" * 80)

        for document in evidence_documents:
            print(
                f"[{document.metadata['segment_id']}] "
                f"{document.metadata['timestamp']}"
            )
            print(document.page_content)
            print()

        answer = generate_answer(
            question=case["question"],
            documents=evidence_documents,
        )

        assert validate_answer(
            answer,
            evidence_documents,
        )

        assert answer.evidence, (
            f"No evidence selected for: {case['question']}"
        )

        print("\nGENERATED ANSWER")
        print("-" * 80)
        print(answer.answer)

        print("\nSELECTED EVIDENCE")
        print("-" * 80)

        for evidence in answer.evidence:
            print(
                f"[{evidence.segment_id}] "
                f"{evidence.timestamp}"
            )
            print(evidence.quote)
            print()