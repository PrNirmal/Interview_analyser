from langchain_core.documents import Document

from app.validation.citation_validator import validate_citation


def test_valid_citation():

    documents = [
        Document(
            page_content="Cost is an important barrier.",
            metadata={
                "segment_id": "segment-1",
                "timestamp": "04:12",
                "speaker": "Anna Keller",
            },
        )
    ]

    assert validate_citation(
        segment_id="segment-1",
        timestamp="04:12",
        documents=documents,
    )


def test_invalid_segment():

    documents = [
        Document(
            page_content="Cost is an important barrier.",
            metadata={
                "segment_id": "segment-1",
                "timestamp": "04:12",
            },
        )
    ]

    assert not validate_citation(
        segment_id="segment-999",
        timestamp="04:12",
        documents=documents,
    )


def test_invalid_timestamp():

    documents = [
        Document(
            page_content="Cost is an important barrier.",
            metadata={
                "segment_id": "segment-1",
                "timestamp": "04:12",
            },
        )
    ]

    assert not validate_citation(
        segment_id="segment-1",
        timestamp="09:30",
        documents=documents,
    )