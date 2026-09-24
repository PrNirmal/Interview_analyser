from langchain_core.documents import Document

from app.core.config import settings
from app.retrieval.vector_store import get_vector_store


def retrieve_semantic(
    query: str,
    k: int | None = None,
    transcript_id: str | None = None,
    market: str | None = None,
) -> list[Document]:

    top_k = k or settings.retrieval_top_k

    vector_store = get_vector_store()

    filter_conditions = {}

    if transcript_id:
        filter_conditions["transcript_id"] = transcript_id

    if market:
        filter_conditions["market"] = market

    search_kwargs = {
        "k": top_k,
    }

    if filter_conditions:

        if len(filter_conditions) == 1:
            search_kwargs["filter"] = filter_conditions

        else:
            search_kwargs["filter"] = {
                "$and": [
                    {
                        key: value
                    }
                    for key, value in filter_conditions.items()
                ]
            }

    return vector_store.similarity_search(
        query,
        **search_kwargs,
    )