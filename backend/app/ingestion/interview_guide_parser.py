import re

from langchain_core.documents import Document

from app.domain.interview import InterviewQuestion


QUESTION_PATTERN = re.compile(
    r"^\s*(\d+)\.\s+(.+?)\s*$"
)


def parse_interview_guide(
    documents: list[Document],
) -> list[InterviewQuestion]:

    questions: list[InterviewQuestion] = []

    for document in documents:

        for raw_line in document.page_content.splitlines():

            line = raw_line.strip()

            if not line:
                continue

            match = QUESTION_PATTERN.match(line)

            if not match:
                continue

            question_number = match.group(1)
            question_text = match.group(2).strip()

            questions.append(
                InterviewQuestion(
                    question_id=f"Q{question_number}",
                    question=question_text,
                )
            )

    return questions