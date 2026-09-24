from app.graphs.state import InterviewQuestionState
from app.llm.structure_output import generate_answer


def generate_node(
    state: InterviewQuestionState,
) -> InterviewQuestionState:

    answer = generate_answer(
        question=state["question"],
        documents=state["documents"],
    )

    return {
        "answer": answer,
    }