from langchain_core.documents import Document

from app.application.cross_interview_question_service import (
    CrossInterviewQuestionService,
    _attribute_evidence,
)
from app.domain.answer import EvidenceReference, InterviewAnswer


def test_attribute_evidence_copies_speaker_metadata():
    answer = InterviewAnswer(
        answer="Dr. Jean Martin identified capital budget approval.",
        confidence="high",
        evidence=[
            EvidenceReference(
                segment_id="Transcript_1_France-14",
                timestamp="00:14:32",
                quote="The biggest issue is still capital budget approval.",
            )
        ],
    )
    documents = [
        Document(
            page_content="The biggest issue is still capital budget approval.",
            metadata={
                "segment_id": "Transcript_1_France-14",
                "expert": "Dr. Jean Martin",
                "role": "Head of Urology",
                "market": "France",
                "speaker": "Dr. Jean Martin",
            },
        )
    ]

    attributed = _attribute_evidence(answer, documents)

    assert attributed[0].expert == "Dr. Jean Martin"
    assert attributed[0].market == "France"
    assert attributed[0].speaker == "Dr. Jean Martin"
    assert attributed[0].quote == "The biggest issue is still capital budget approval."


def test_answer_rejects_a_blank_question():
    service = CrossInterviewQuestionService()

    try:
        service.answer(question="   ", transcripts=[{"transcript_id": "t"}])
    except ValueError as exc:
        assert "Enter a question" in str(exc)
    else:
        raise AssertionError("A blank question should be rejected.")
