from pathlib import Path

from app.ingestion.document_loader import load_document
from app.ingestion.metadata import segments_to_documents
from app.ingestion.transcript_parser import parse_transcript
from app.domain.transcript import TranscriptMetadata
from app.retrieval.hybrid_retriever import HybridRetriever
from app.retrieval.reranker import rerank_documents


DATA_DIR = Path("data")


def load_transcript():

    metadata = TranscriptMetadata(
        transcript_id="Transcript_2_Germany",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
    )

    raw_documents = load_document(
        str(DATA_DIR / "Transcript_2_Germany.txt")
    )

    segments = parse_transcript(
        documents=raw_documents,
        transcript_id=metadata.transcript_id,
        expert=metadata.expert,
        role=metadata.role,
        market=metadata.market,
    )

    return segments_to_documents(segments)


def test_germany_timeline_reranking():

    documents = load_transcript()

    retriever = HybridRetriever(
        documents=documents
    )

    query = (
        "What is the typical hospital decision-making "
        "timeline for purchasing a new robotic system?"
    )

    # Retrieve a larger candidate pool.
    candidates = retriever.retrieve(
        query=query,
        k=10,
        transcript_id="Transcript_2_Germany",
    )

    print("\n" + "=" * 80)
    print("BEFORE RERANKING")
    print("=" * 80)

    for index, document in enumerate(candidates, start=1):
        print(
            f"\n#{index} "
            f"{document.metadata['segment_id']}"
        )
        print(document.page_content)

    reranked = rerank_documents(
        query=query,
        documents=candidates,
        top_k=5,
    )

    print("\n" + "=" * 80)
    print("AFTER RERANKING")
    print("=" * 80)

    for index, document in enumerate(reranked, start=1):
        print(
            f"\n#{index} "
            f"{document.metadata['segment_id']}"
        )
        print(document.page_content)

    assert len(reranked) <= 5