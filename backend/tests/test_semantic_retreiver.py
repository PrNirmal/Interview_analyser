from app.retrieval.semantic_retriever import retrieve_semantic

def test_interview_guide_retrieval():

    queries = [
        "What is the current adoption of robotic surgery?",
        "What are the main barriers to adoption?",
        "How important are hospital budgets and ROI?",
        "How important are surgeon training and clinical outcomes?",
        "What will adoption look like over the next 3 to 5 years?",
        "How long does the hospital purchasing process usually take?",
    ]

    for query in queries:

        results = retrieve_semantic(query, k=3)

        print("\n" + "=" * 80)
        print("QUESTION:", query)
        print("=" * 80)

        for index, result in enumerate(results, start=1):

            print(f"\n[{index}]")
            print(
                f"[{result.metadata['timestamp']}] "
                f"{result.metadata['speaker']}"
            )
            print(result.page_content)