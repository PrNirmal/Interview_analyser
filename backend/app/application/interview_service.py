from app.application import question_answer_service
from langchain_core.documents import Document

from app.domain.interview import (
    InterviewAnalysis,
    InterviewQuestion,
    InterviewQuestionAnswer,
)
from app.graphs.interview_graph import build_interview_graph
from app.retrieval.hybrid_retriever import HybridRetriever


class InterviewService:

    def __init__(
        self,
        documents: list[Document],
        questions: list[InterviewQuestion],
        transcript_id: str,
        expert: str,
        role: str,
        market: str,
    ):
        self.transcript_id = transcript_id
        self.expert = expert
        self.role = role
        self.market = market
        self.questions = questions

        # These documents belong to the current transcript.
        self.documents = documents

        retriever = HybridRetriever(
            documents=documents
        )

        self.graph = build_interview_graph(
            retriever=retriever,
        )

    def analyze(self) -> InterviewAnalysis:

        answers = []

        for interview_question in self.questions:

            result = self.graph.invoke(
                {
                    "question": interview_question.question,
                    "transcript_id": self.transcript_id,
                }
            )
            answer = result["answer"]

            for evidence in answer.evidence:
                evidence.question_id = interview_question.question_id

            answers.append(
                InterviewQuestionAnswer(
                    question_id=interview_question.question_id,
                    question=interview_question.question,
                    answer=answer.answer,
                    evidence=answer.evidence,
                    confidence=answer.confidence,
                )
            )

        return InterviewAnalysis(
            transcript_id=self.transcript_id,
            expert=self.expert,
            role=self.role,
            market=self.market,
            answers=answers,
        )