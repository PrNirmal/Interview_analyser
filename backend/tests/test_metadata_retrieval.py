from app.retrieval.semantic_retriever import (
    retrieve_semantic,
)


def test_market_filter():

    results = retrieve_semantic(
        query="What are the main barriers to adoption?",
        market="Germany",
        k=5,
    )

    assert results

    for document in results:
        assert document.metadata["market"] == "Germany"

    print("\nGermany results:")

    for document in results:
        print(
            document.metadata["segment_id"],
            document.metadata["timestamp"],
            document.page_content,
        )