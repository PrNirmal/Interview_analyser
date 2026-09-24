from functools import lru_cache

from app.core.config import settings
from app.retrieval.embeddings import OpenRouterEmbeddings
from app.retrieval.huggingface_embeddings import (
    get_huggingface_embeddings,
)


@lru_cache(maxsize=1)
def get_embedding_model():

    provider = settings.embedding_provider.lower()

    if provider == "openrouter":
        return OpenRouterEmbeddings()

    if provider == "huggingface":
        return get_huggingface_embeddings()

    raise ValueError(
        f"Unsupported embedding provider: {provider}"
    )