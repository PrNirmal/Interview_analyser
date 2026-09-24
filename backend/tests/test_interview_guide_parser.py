from pathlib import Path

from app.ingestion.document_loader import load_document
from app.ingestion.interview_guide_parser import (
    parse_interview_guide,
)


TEST_FILE = (
    Path(__file__).parent
    / "Interview_Guide_test.txt"
)


def test_parse_interview_guide():

    documents = load_document(
        str(TEST_FILE)
    )

    assert documents

    questions = parse_interview_guide(
        documents
    )

    print("\nINTERVIEW GUIDE QUESTIONS")
    print("=" * 70)

    for question in questions:

        print(
            f"{question.question_id}: "
            f"{question.question}"
        )

    assert questions

    assert len(questions) == 6

    assert questions[0].question_id == "Q1"

    assert questions[1].question_id == "Q2"

    assert questions[-1].question_id == "Q6"