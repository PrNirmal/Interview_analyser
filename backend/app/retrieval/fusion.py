from langchain_core.documents import Document


def reciprocal_rank_fusion(
    result_lists: list[list[Document]],
    k: int = 60,
    top_n: int = 5,
) -> list[Document]:

    scores: dict[str, float] = {}
    documents: dict[str, Document] = {}

    for results in result_lists:

        for rank, document in enumerate(results, start=1):

            document_id = document.metadata["segment_id"]

            scores[document_id] = (
                scores.get(document_id, 0.0)
                + 1 / (k + rank)
            )

            documents[document_id] = document

    ranked_ids = sorted(
        scores,
        key=scores.get,
        reverse=True,
    )

    return [
        documents[document_id]
        for document_id in ranked_ids[:top_n]
    ]