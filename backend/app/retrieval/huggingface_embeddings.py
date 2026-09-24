from functools import lru_cache

from langchain_huggingface import HuggingFaceEmbeddings

from app.core.config import settings


@lru_cache(maxsize=1)
def get_huggingface_embeddings() -> HuggingFaceEmbeddings:
    # show_progress is passed by LangChain as show_progress_bar.
    # Do not also put show_progress_bar in encode_kwargs — SentenceTransformer
    # then receives the argument twice and raises TypeError.
    return HuggingFaceEmbeddings(
        model_name=settings.hf_embedding_model,
        model_kwargs={
            "device": "cpu",
        },
        encode_kwargs={
            "normalize_embeddings": True,
        },
        show_progress=False,
    )