from langchain_core.documents import Document

from app.domain.answer import (
    EvidenceReference,
    InterviewAnswer,
)
from app.validation.answer_validator import validate_answer


def test_valid_answer():

    documents = [
        Document(
            page_content=(
                "The biggest barriers are cost and proving that "
                "there will be sufficient utilisation to justify "
                "the investment."
            ),
            metadata={
                "segment_id": "segment-1",
                "timestamp": "04:12",
                "speaker": "Anna Keller",
            },
        )
    ]

    answer = InterviewAnswer(
        answer="Cost and utilisation are major barriers.",
        evidence=[
            EvidenceReference(
                segment_id="segment-1",
                timestamp="04:12",
                quote=(
                    "The biggest barriers are cost and proving that "
                    "there will be sufficient utilisation to justify "
                    "the investment."
                ),
            )
        ],
        confidence="high",
    )

    assert validate_answer(
        answer=answer,
        documents=documents,
    )


def test_invalid_answer():

    documents = [
        Document(
            page_content=(
                "The biggest barriers are cost and proving that "
                "there will be sufficient utilisation to justify "
                "the investment."
            ),
            metadata={
                "segment_id": "segment-1",
                "timestamp": "04:12",
                "speaker": "Anna Keller",
            },
        )
    ]

    answer = InterviewAnswer(
        answer="Cost is the biggest barrier.",
        evidence=[
            EvidenceReference(
                segment_id="segment-999",
                timestamp="09:30",
                quote="Cost is the biggest barrier.",
            )
        ],
        confidence="high",
    )

    assert not validate_answer(
        answer=answer,
        documents=documents,
    )