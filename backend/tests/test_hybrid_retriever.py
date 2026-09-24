from pathlib import Path

from app.ingestion.document_loader import load_document
from app.ingestion.metadata import segments_to_documents
from app.ingestion.transcript_parser import parse_transcript
from app.retrieval.hybrid_retriever import HybridRetriever
from app.llm.structure_output import generate_answer


TEST_FILE = Path(__file__).parent / "Transcript_2_Germany_test.txt"


def test_llm_answer():

    # -----------------------------------------
    # 1. Load transcript
    # -----------------------------------------
    documents = load_document(str(TEST_FILE))

    # -----------------------------------------
    # 2. Parse transcript
    # -----------------------------------------
    segments = parse_transcript(
        documents=documents,
        transcript_id="Transcript_2_Germany_test",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
    )

    # -----------------------------------------
    # 3. Convert to retrieval documents
    # -----------------------------------------
    retrieval_documents = segments_to_documents(segments)

    # -----------------------------------------
    # 4. Create hybrid retriever
    # -----------------------------------------
    retriever = HybridRetriever(retrieval_documents)

    question = "What are the main barriers to robotic surgery adoption?"

    # -----------------------------------------
    # 5. Retrieve relevant evidence
    # -----------------------------------------
    evidence_documents = retriever.retrieve(
        query=question,
        k=5,
    )

    assert evidence_documents

    print("\nRETRIEVED EVIDENCE")
    print("=" * 70)

    for index, document in enumerate(evidence_documents, start=1):

        print(f"\nResult {index}")
        print("-" * 50)

        print(document.page_content)

        print("\nMetadata:")
        print(document.metadata)

    # -----------------------------------------
    # 6. Generate answer
    # -----------------------------------------
    result = generate_answer(
        question=question,
        documents=evidence_documents,
    )

    # -----------------------------------------
    # 7. Display answer
    # -----------------------------------------
    print("\n\nFINAL ANSWER")
    print("=" * 70)
    print(result.answer)

    print("\nEVIDENCE")
    print("=" * 70)

    for item in result.evidence:
        print(f"\nSegment: {item.segment_id}")
        print(f"Timestamp: {item.timestamp}")
        print(f"Quote: {item.quote}")

    print("\nConfidence:", result.confidence)

    # -----------------------------------------
    # 8. Assertions
    # -----------------------------------------
    assert result.answer
    assert result.evidence
    assert result.confidence in {"high", "medium", "low"}