from app.graphs.state import InterviewQuestionState
from app.retrieval.hybrid_retriever import HybridRetriever


def retrieve_node(
    state: InterviewQuestionState,
    retriever: HybridRetriever,
) -> dict:

    documents = retriever.retrieve(
        query=state["question"],
        k=5,
        transcript_id=state.get("transcript_id"),
    )

    return {
        "documents": documents,
    }