from pydantic import BaseModel


class InterviewQuestion(BaseModel):
    question_id: str
    question: str


class InterviewQuestionAnswer(BaseModel):
    question_id: str
    question: str
    answer: str
    evidence: list
    confidence: str


class InterviewAnalysis(BaseModel):
    transcript_id: str
    expert: str
    role: str
    market: str
    answers: list[InterviewQuestionAnswer]