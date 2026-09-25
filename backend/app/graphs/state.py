from typing import TypedDict

from langchain_core.documents import Document

from app.domain.answer import InterviewAnswer


class InterviewQuestionState(TypedDict, total=False):

    question: str

    transcript_id: str

    documents: list[Document]

    answer: InterviewAnswer

    is_valid: bool

    error: str | None

    retrieval_top_k: int