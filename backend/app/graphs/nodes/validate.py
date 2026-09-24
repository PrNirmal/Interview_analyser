from app.graphs.state import InterviewQuestionState
from app.validation.answer_validator import validate_answer


def validate_node(
    state: InterviewQuestionState,
) -> InterviewQuestionState:

    is_valid = validate_answer(
        answer=state["answer"],
        documents=state["documents"],
    )

    return {
        "is_valid": is_valid,
    }