from app.llm.llm_factory import get_llm


def test_local_llm():

    llm = get_llm()

    response = llm.invoke(
        'Return only this JSON: {"status": "ok"}'
    )

    print("\nLLM RESPONSE:")
    print(response)

    assert response