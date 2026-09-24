from langchain_core.documents import Document


def validate_quote(
    quote: str,
    documents: list[Document],
) -> bool:

    normalized_quote = " ".join(quote.split()).strip()

    for document in documents:

        normalized_text = " ".join(
            document.page_content.split()
        ).strip()

        if normalized_quote in normalized_text:
            return True

    return False