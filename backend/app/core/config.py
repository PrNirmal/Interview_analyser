# app/core/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):


    openrouter_api_key: str

    openrouter_base_url: str = (
        "https://openrouter.ai/api/v1"
    )

    llm_model: str = (
        "inclusionai/ling-3.0-flash-fin:free"
    )

    llm_provider: str = "openrouter"

    hf_llm_model: str = (
        "Qwen/Qwen2.5-3B-Instruct"
    )
    

    # Embedding configuration
    embedding_provider: str = "huggingface"

    embedding_model: str = (
        "nvidia/llama-nemotron-embed-vl-1b-v2:free"
    )

    hf_embedding_model: str = (
        "sentence-transformers/all-MiniLM-L6-v2"
    )

    chroma_path: str = "storage/chroma"

    chroma_collection: str = (
        "expert_transcripts"
    )

    retrieval_top_k: int = 5

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()