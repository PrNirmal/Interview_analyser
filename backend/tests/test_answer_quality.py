from pathlib import Path

from app.application.ingestion_service import IngestionService
from app.domain.transcript import TranscriptMetadata
from app.llm.structure_output import generate_answer
from app.retrieval.hybrid_retriever import HybridRetriever
from app.validation.answer_validator import validate_answer


def test_germany_q6_answer():

    metadata = TranscriptMetadata(
        transcript_id="Transcript_2_Germany",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
    )

    ingestion_service = IngestionService()

    documents = ingestion_service.ingest_transcript(
        file_path="data/Transcript_2_Germany.txt",
        metadata=metadata,
    )

    retriever = HybridRetriever(
        documents=documents
    )

    question = (
        "What is the typical hospital decision-making "
        "timeline for purchasing a new robotic system?"
    )

    evidence_documents = retriever.retrieve(
        query=question,
        k=5,
        transcript_id="Transcript_2_Germany",
    )

    print("\n" + "=" * 80)
    print("EVIDENCE SENT TO LLM")
    print("=" * 80)

    for document in evidence_documents:
        print(
            f"\n[{document.metadata['segment_id']}] "
            f"{document.metadata['timestamp']}"
        )
        print(document.page_content)

    answer = generate_answer(
        question=question,
        documents=evidence_documents,
    )

    print("\n" + "=" * 80)
    print("GENERATED ANSWER")
    print("=" * 80)

    print(answer.answer)

    print("\nEVIDENCE SELECTED:")

    for evidence in answer.evidence:
        print(
            f"\n[{evidence.segment_id}] "
            f"{evidence.timestamp}"
        )
        print(evidence.quote)

    assert answer.answer

    assert validate_answer(
        answer,
        evidence_documents,
    )

    assert any(
        evidence.segment_id == "Transcript_2_Germany-14"
        for evidence in answer.evidence
    )