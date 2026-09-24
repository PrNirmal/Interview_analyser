from typing import Any

import requests

from app.core.config import settings


class OpenRouterEmbeddings:
    """LangChain-compatible embedding adapter for OpenRouter."""

    def __init__(self) -> None:
        self.url = f"{settings.openrouter_base_url}/embeddings"
        self.api_key = settings.openrouter_api_key
        self.model = settings.embedding_model

    def embed_query(self, text: str) -> list[float]:
        return self._embed_batch([text])[0]

    def embed_documents(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        return self._embed_batch(texts)

    def _embed_batch(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        response = requests.post(
            self.url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": self.model,
                "input": [
                    {
                        "content": [
                            {
                                "type": "text",
                                "text": text,
                            }
                        ]
                    }
                    for text in texts
                ],
                "encoding_format": "float",
            },
            timeout=60,
        )

        response.raise_for_status()

        data: dict[str, Any] = response.json()

        embeddings = data["data"]

        # Preserve input ordering.
        embeddings.sort(
            key=lambda item: item.get("index", 0)
        )

        return [
            item["embedding"]
            for item in embeddings
        ]


def get_embeddings() -> OpenRouterEmbeddings:
    return OpenRouterEmbeddings()