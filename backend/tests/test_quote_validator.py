from langchain_core.documents import Document

from app.validation.quote_validator import validate_quote


def test_valid_quote():

    documents = [
        Document(
            page_content=(
                "The biggest barriers are cost and proving that "
                "there will be sufficient utilisation to justify "
                "the investment."
            ),
            metadata={
                "segment_id": "segment-1",
            },
        )
    ]

    quote = (
        "The biggest barriers are cost and proving that "
        "there will be sufficient utilisation to justify "
        "the investment."
    )

    assert validate_quote(
        quote=quote,
        documents=documents,
    )


def test_invalid_quote():

    documents = [
        Document(
            page_content=(
                "The biggest barriers are cost and proving that "
                "there will be sufficient utilisation to justify "
                "the investment."
            ),
            metadata={
                "segment_id": "segment-1",
            },
        )
    ]

    quote = "Cost is the biggest barrier."

    assert not validate_quote(
        quote=quote,
        documents=documents,
    )