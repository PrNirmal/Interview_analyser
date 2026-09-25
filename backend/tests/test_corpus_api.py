"""API tests for custom guides and transcript uploads."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.api.main import app
from app.application import corpus_files

client = TestClient(app)


def test_save_guide_writes_numbered_questions(tmp_path, monkeypatch):
    monkeypatch.setattr(corpus_files, "UPLOAD_DIR", tmp_path)

    response = client.post(
        "/api/v1/corpus/guide",
        json={
            "title": "Custom market study",
            "questions": [
                "  How is adoption changing?  ",
                "2. What blocks a purchase?",
            ],
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["file_path"] == "data/uploads/custom_interview_guide.txt"
    assert body["question_count"] == 2
    assert body["questions"] == [
        "How is adoption changing?",
        "What blocks a purchase?",
    ]
    written = (tmp_path / "custom_interview_guide.txt").read_text(encoding="utf-8")
    assert "Custom market study" in written
    assert "1. How is adoption changing?" in written
    assert "2. What blocks a purchase?" in written


def test_save_guide_rejects_blank_questions():
    response = client.post(
        "/api/v1/corpus/guide",
        json={"title": "Custom", "questions": ["   "]},
    )
    assert response.status_code == 400
    assert response.json()["detail"]["error"]["code"] == "INVALID_GUIDE"


def test_upload_transcript(tmp_path, monkeypatch):
    monkeypatch.setattr(corpus_files, "UPLOAD_DIR", tmp_path)

    response = client.post(
        "/api/v1/corpus/transcripts",
        data={"expert": " Sam Lee ", "role": "Analyst", "market": "Spain"},
        files={"file": ("spain notes.txt", b"00:00\nSam Lee: Adoption is uneven.\n", "text/plain")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["expert"] == "Sam Lee"
    assert body["role"] == "Analyst"
    assert body["market"] == "Spain"
    assert body["file_path"].startswith("data/uploads/")
    assert body["file_path"].endswith(".txt")
    assert (tmp_path / body["filename"]).read_bytes().startswith(b"00:00")


def test_upload_rejects_unsupported_type():
    response = client.post(
        "/api/v1/corpus/transcripts",
        data={"expert": "Sam Lee", "role": "Analyst", "market": "Spain"},
        files={"file": ("notes.csv", b"a,b\n", "text/csv")},
    )
    assert response.status_code == 400
    assert response.json()["detail"]["error"]["code"] == "INVALID_UPLOAD"


def test_upload_rejects_empty_file():
    response = client.post(
        "/api/v1/corpus/transcripts",
        data={"expert": "Sam Lee", "role": "Analyst", "market": "Spain"},
        files={"file": ("notes.txt", b"", "text/plain")},
    )
    assert response.status_code == 400
