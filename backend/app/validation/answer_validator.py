from langchain_core.documents import Document

from app.domain.answer import InterviewAnswer
from app.validation.citation_validator import validate_citation
from app.validation.quote_validator import validate_quote


def validate_answer(
    answer: InterviewAnswer,
    documents: list[Document],
) -> bool:

    # If the model says there is no supporting evidence,
    # allow an empty evidence list.
    if not answer.evidence:
        return True

    for evidence in answer.evidence:

        citation_valid = validate_citation(
            segment_id=evidence.segment_id,
            timestamp=evidence.timestamp,
            documents=documents,
        )

        if not citation_valid:
            return False

        quote_valid = validate_quote(
            quote=evidence.quote,
            documents=documents,
        )

        if not quote_valid:
            return False

    return True