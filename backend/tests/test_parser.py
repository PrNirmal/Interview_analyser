from pathlib import Path

from app.ingestion.document_loader import load_document
from app.ingestion.transcript_parser import parse_transcript


TEST_FILE = (
    Path(__file__).parent
    / "Transcript_2_Germany_test.txt"
)


def test_parse_germany_transcript():

    assert TEST_FILE.exists(), (
        f"Test transcript not found: {TEST_FILE}"
    )

    documents = load_document(str(TEST_FILE))

    assert documents, "No documents were loaded"

    segments = parse_transcript(
        documents=documents,
        transcript_id="Transcript_2_Germany_test",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
    )

    assert segments, "No transcript segments were extracted"

    print(f"\nFile: {TEST_FILE.name}")
    print(f"Segments: {len(segments)}")

    for segment in segments:
        print(
            f"[{segment.timestamp}] "
            f"{segment.speaker}: "
            f"{segment.text}"
        )


def test_germany_transcript_structure():

    documents = load_document(str(TEST_FILE))

    segments = parse_transcript(
        documents=documents,
        transcript_id="Transcript_2_Germany_test",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
    )

    assert len(segments) > 0

    first_segment = segments[0]

    assert first_segment.transcript_id == (
        "Transcript_2_Germany_test"
    )

    assert first_segment.market == "Germany"
    assert first_segment.expert == "Anna Keller"
    assert first_segment.role == (
        "Former Hospital Procurement Director"
    )

    assert first_segment.timestamp
    assert first_segment.speaker
    assert first_segment.text