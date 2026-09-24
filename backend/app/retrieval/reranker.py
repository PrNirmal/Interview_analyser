from functools import lru_cache

from sentence_transformers import CrossEncoder
from langchain_core.documents import Document


RERANKER_MODEL = "BAAI/bge-reranker-base"


@lru_cache(maxsize=1)
def get_reranker() -> CrossEncoder:
    return CrossEncoder(
        RERANKER_MODEL,
        device="cpu",
    )


def rerank_documents(
    query: str,
    documents: list[Document],
    top_k: int = 5,
) -> list[Document]:

    if not documents:
        return []

    reranker = get_reranker()

    pairs = [
        (query, document.page_content)
        for document in documents
    ]

    scores = reranker.predict(pairs, show_progress_bar=False)

    ranked = sorted(
        zip(documents, scores),
        key=lambda item: float(item[1]),
        reverse=True,
    )

    return [
        document
        for document, _ in ranked[:top_k]
    ]