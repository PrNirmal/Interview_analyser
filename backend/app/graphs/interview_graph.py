from langgraph.graph import END, START, StateGraph

from app.graphs.nodes.generate import generate_node
from app.graphs.nodes.retrieve import retrieve_node
from app.graphs.nodes.validate import validate_node
from app.graphs.state import InterviewQuestionState
from app.retrieval.hybrid_retriever import HybridRetriever


def build_interview_graph(
    retriever: HybridRetriever,
):
    graph = StateGraph(InterviewQuestionState)

    # ---------------------------------------------
    # Nodes
    # ---------------------------------------------

    graph.add_node(
        "retrieve",
        lambda state: retrieve_node(
            state,
            retriever,
        ),
    )

    graph.add_node(
        "generate",
        generate_node,
    )

    graph.add_node(
        "validate",
        validate_node,
    )

    # ---------------------------------------------
    # Flow
    # ---------------------------------------------

    graph.add_edge(
        START,
        "retrieve",
    )

    graph.add_edge(
        "retrieve",
        "generate",
    )

    graph.add_edge(
        "generate",
        "validate",
    )

    graph.add_edge(
        "validate",
        END,
    )

    # Return the actual compiled LangGraph
    return graph.compile()