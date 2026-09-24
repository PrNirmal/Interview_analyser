from pathlib import Path

from langchain_core.documents import Document

from app.ingestion.document_loader import load_document


DATA_DIR = Path(__file__).parent.parent / "data"


def test_load_available_txt_files():
    txt_files = list(DATA_DIR.glob("*.txt"))

    assert txt_files, f"No .txt files found in {DATA_DIR}"

    for file_path in txt_files:
        documents = load_document(str(file_path))

        assert isinstance(documents, list)
        assert len(documents) > 0

        for document in documents:
            assert isinstance(document, Document)
            assert document.page_content.strip()

        print(f"\nLoaded: {file_path.name}")
        print(f"Documents: {len(documents)}")
        print(f"Characters: {len(''.join(d.page_content for d in documents))}")


def test_loaded_transcript_contains_expected_content():
    txt_files = list(DATA_DIR.glob("*.txt"))

    assert txt_files, f"No .txt files found in {DATA_DIR}"

    for file_path in txt_files:
        documents = load_document(str(file_path))

        content = "\n".join(
            document.page_content
            for document in documents
        )

        assert len(content.strip()) > 0

        print(f"\n--- {file_path.name} ---")
        print(content[:500])