from app.retrieval.huggingface_embeddings import (
    get_huggingface_embeddings,
)


def test_huggingface_embedding():

    embeddings = get_huggingface_embeddings()

    result = embeddings.embed_query(
        "What are the main barriers to robotic surgery adoption?"
    )

    assert result

    assert isinstance(result, list)

    assert len(result) > 0

    print(
        "\nEmbedding dimensions:",
        len(result),
    )