from langchain_core.documents import Document

from app.domain.answer import InterviewAnswer
from app.retrieval.hybrid_retriever import HybridRetriever
from app.llm.structure_output import generate_answer
from app.validation.answer_validator import validate_answer


class QuestionAnswerService:

    def __init__(
        self,
        documents: list[Document],
    ):
        self.documents = documents

        self.retriever = HybridRetriever(
            documents
        )

    def answer(
        self,
        question: str,
        top_k: int = 5,
    ) -> InterviewAnswer:

        # -----------------------------------------
        # 1. Retrieve relevant evidence
        # -----------------------------------------
        evidence_documents = self.retriever.retrieve(
            query=question,
            k=top_k,
        )

        if not evidence_documents:
            raise ValueError(
                "No relevant evidence found for the question."
            )

        # -----------------------------------------
        # 2. Generate answer
        # -----------------------------------------
        answer = generate_answer(
            question=question,
            documents=evidence_documents,
        )

        # -----------------------------------------
        # 3. Validate answer
        # -----------------------------------------
        is_valid = validate_answer(
            answer=answer,
            documents=evidence_documents,
        )

        if not is_valid:
            raise ValueError(
                "Generated answer failed evidence validation."
            )

        return answer