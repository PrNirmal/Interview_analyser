from pathlib import Path

from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    UnstructuredWordDocumentLoader,
)


def load_document(file_path: str):
    path = Path(file_path)

    extension = path.suffix.lower()

    if extension == ".pdf":
        loader = PyPDFLoader(str(path))

    elif extension == ".docx":
        loader = UnstructuredWordDocumentLoader(str(path))

    elif extension == ".txt":
        loader = TextLoader(
            str(path),
            encoding="utf-8",
        )

    else:
        raise ValueError(
            f"Unsupported file type: {extension}"
        )

    return loader.load()