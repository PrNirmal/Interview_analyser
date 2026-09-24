from langchain_core.documents import Document


def validate_citation(
    segment_id: str,
    timestamp: str,
    documents: list[Document],
) -> bool:
    """
    Validate that the segment_id and timestamp returned by the LLM
    belong to one of the retrieved evidence documents.
    """

    for document in documents:
        metadata = document.metadata

        if (
            metadata.get("segment_id") == segment_id
            and metadata.get("timestamp") == timestamp
        ):
            return True

    return False