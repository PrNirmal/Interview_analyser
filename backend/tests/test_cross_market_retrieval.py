from app.retrieval.semantic_retriever import (
    retrieve_semantic,
)


def test_cross_market_retrieval():

    results = retrieve_semantic(
        query="What are the main barriers to robotic surgery adoption?",
        k=10,
    )

    assert results

    markets = {
        document.metadata["market"]
        for document in results
    }

    print("\nMarkets found:", markets)

    for document in results:
        print(
            "\n---",
            document.metadata["market"],
            "---",
        )
        print(
            document.metadata["timestamp"]
        )
        print(document.page_content)

    assert len(markets) >= 2