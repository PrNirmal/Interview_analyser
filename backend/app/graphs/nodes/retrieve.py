from app.core.config import settings
from app.graphs.state import InterviewQuestionState
from app.retrieval.hybrid_retriever import HybridRetriever


def retrieve_node(
    state: InterviewQuestionState,
    retriever: HybridRetriever,
) -> dict:

    requested = state.get("retrieval_top_k")
    k = requested if isinstance(requested, int) and requested > 0 else settings.retrieval_top_k

    documents = retriever.retrieve(
        query=state["question"],
        k=k,
        transcript_id=state.get("transcript_id"),
    )

    return {
        "documents": documents,
    }