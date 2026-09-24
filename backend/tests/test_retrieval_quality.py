from pathlib import Path

from app.ingestion.document_loader import load_document
from app.ingestion.metadata import segments_to_documents
from app.ingestion.transcript_parser import parse_transcript
from app.domain.transcript import TranscriptMetadata
from app.retrieval.hybrid_retriever import HybridRetriever


DATA_DIR = Path("data")


def load_transcript(
    file_name: str,
    transcript_id: str,
    expert: str,
    role: str,
    market: str,
):
    metadata = TranscriptMetadata(
        transcript_id=transcript_id,
        expert=expert,
        role=role,
        market=market,
    )

    raw_documents = load_document(
        str(DATA_DIR / file_name)
    )

    segments = parse_transcript(
        documents=raw_documents,
        transcript_id=transcript_id,
        expert=expert,
        role=role,
        market=market,
    )

    return segments_to_documents(segments)


def print_results(title: str, results):
    print("\n" + "=" * 80)
    print(title)
    print("=" * 80)

    for index, document in enumerate(results, start=1):

        metadata = document.metadata

        print(
            f"\n#{index}"
            f"\nSEGMENT: {metadata['segment_id']}"
            f"\nTIMESTAMP: {metadata['timestamp']}"
            f"\nSPEAKER: {metadata['speaker']}"
            f"\nTEXT: {document.page_content}"
        )


def test_retrieval_quality():

    germany_documents = load_transcript(
        file_name="Transcript_2_Germany.txt",
        transcript_id="Transcript_2_Germany",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
    )

    uk_documents = load_transcript(
        file_name="Transcript_3_UK.txt",
        transcript_id="Transcript_3_UK",
        expert="Dr. Emily Carter",
        role="Consultant Urologist",
        market="United Kingdom",
    )

    france_documents = load_transcript(
        file_name="Transcript_1_France.txt",
        transcript_id="Transcript_1_France",
        expert="Dr. Jean Martin",
        role="Head of Urology",
        market="France",
    )

    # ---------------------------------------------------------
    # Germany Q3
    # ---------------------------------------------------------

    germany_retriever = HybridRetriever(
        documents=germany_documents
    )

    results = germany_retriever.retrieve(
        query=(
            "How important are hospital budgets and ROI "
            "in purchasing decisions?"
        ),
        k=5,
        transcript_id="Transcript_2_Germany",
    )

    print_results(
        "GERMANY Q3 - BUDGET / ROI",
        results,
    )

    # ---------------------------------------------------------
    # Germany Q6
    # ---------------------------------------------------------

    results = germany_retriever.retrieve(
        query=(
            "What is the typical hospital decision-making "
            "timeline for purchasing a new robotic system?"
        ),
        k=5,
        transcript_id="Transcript_2_Germany",
    )

    print_results(
        "GERMANY Q6 - PURCHASING TIMELINE",
        results,
    )

    # ---------------------------------------------------------
    # UK Q6
    # ---------------------------------------------------------

    uk_retriever = HybridRetriever(
        documents=uk_documents
    )

    results = uk_retriever.retrieve(
        query=(
            "What is the typical hospital decision-making "
            "timeline for purchasing a new robotic system?"
        ),
        k=5,
        transcript_id="Transcript_3_UK",
    )

    print_results(
        "UK Q6 - PURCHASING TIMELINE",
        results,
    )

    # ---------------------------------------------------------
    # France Q2
    # ---------------------------------------------------------

    france_retriever = HybridRetriever(
        documents=france_documents
    )

    results = france_retriever.retrieve(
        query="What are the main barriers to adoption?",
        k=5,
        transcript_id="Transcript_1_France",
    )

    print_results(
        "FRANCE Q2 - BARRIERS",
        results,
    )