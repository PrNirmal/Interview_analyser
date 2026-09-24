from functools import lru_cache

from app.core.config import settings
from app.llm.model import get_llm as get_openrouter_llm
from app.llm.huggingface_model import get_huggingface_llm


@lru_cache(maxsize=1)
def get_llm():
    provider = settings.llm_provider.lower()

    if provider == "openrouter":
        return get_openrouter_llm()

    if provider == "huggingface":
        return get_huggingface_llm()

    raise ValueError(
        f"Unsupported LLM provider: {settings.llm_provider}"
    )