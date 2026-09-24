from functools import lru_cache

from langchain_chroma import Chroma
from langchain_core.documents import Document

from app.core.config import settings
from app.retrieval.embedding_factory import get_embedding_model


@lru_cache(maxsize=1)
def get_vector_store() -> Chroma:
    embeddings = get_embedding_model()

    return Chroma(
        collection_name=settings.chroma_collection,
        embedding_function=embeddings,
        persist_directory=settings.chroma_path,
    )


def add_documents(
    documents: list[Document],
) -> None:

    if not documents:
        return

    vector_store = get_vector_store()

    ids = [
        document.metadata["segment_id"]
        for document in documents
    ]

    vector_store.add_documents(
        documents=documents,
        ids=ids,
    )