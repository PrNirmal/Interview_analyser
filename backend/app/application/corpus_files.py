"""Save custom interview guides and uploaded transcripts under data/uploads."""

from __future__ import annotations

import re
import uuid
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
UPLOAD_DIR = PROJECT_ROOT / "data" / "uploads"
GUIDE_FILENAME = "custom_interview_guide.txt"

ALLOWED_EXTENSIONS = {".txt", ".pdf", ".docx"}
MAX_UPLOAD_BYTES = 15 * 1024 * 1024
MAX_QUESTION_LENGTH = 500

_UNSAFE_NAME = re.compile(r"[^A-Za-z0-9._-]+")
_LEADING_NUMBER = re.compile(r"^\d+\.\s+")


def normalize_question(question: str) -> str:
    """Collapse whitespace and drop a leading question number."""
    collapsed = " ".join(question.split())
    return _LEADING_NUMBER.sub("", collapsed).strip()


def normalize_questions(questions: list[str]) -> list[str]:
    cleaned = [normalize_question(question) for question in questions]
    cleaned = [question for question in cleaned if question]
    if not cleaned:
        raise ValueError("Add at least one interview question.")
    if len(cleaned) > 40:
        raise ValueError("A guide can contain at most 40 questions.")
    too_long = next((question for question in cleaned if len(question) > MAX_QUESTION_LENGTH), None)
    if too_long is not None:
        raise ValueError("Each question must be 500 characters or fewer.")
    return cleaned


def render_guide(title: str, questions: list[str]) -> str:
    lines = [title.strip(), "", "Questions:"]
    lines.extend(f"{index}. {question}" for index, question in enumerate(questions, start=1))
    lines.append("")
    return "\n".join(lines)


def save_guide(title: str, questions: list[str]) -> dict:
    cleaned_title = " ".join(title.split()).strip()
    if not cleaned_title:
        raise ValueError("The interview guide needs a title.")
    cleaned_questions = normalize_questions(questions)

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    path = UPLOAD_DIR / GUIDE_FILENAME
    path.write_text(render_guide(cleaned_title, cleaned_questions), encoding="utf-8")

    return {
        "filename": GUIDE_FILENAME,
        "file_path": f"data/uploads/{GUIDE_FILENAME}",
        "title": cleaned_title,
        "question_count": len(cleaned_questions),
        "questions": cleaned_questions,
    }


def _safe_stem(value: str, fallback: str) -> str:
    cleaned = _UNSAFE_NAME.sub("_", value).strip("._")
    return (cleaned[:80] or fallback)


def save_transcript(
    *,
    original_name: str,
    content: bytes,
    expert: str,
    role: str,
    market: str,
) -> dict:
    cleaned_expert = " ".join(expert.split()).strip()
    cleaned_role = " ".join(role.split()).strip()
    cleaned_market = " ".join(market.split()).strip()
    if not cleaned_expert or not cleaned_role or not cleaned_market:
        raise ValueError("Expert, role, and market are required.")
    if len(cleaned_expert) > 120 or len(cleaned_role) > 120 or len(cleaned_market) > 120:
        raise ValueError("Expert, role, and market must be 120 characters or fewer.")

    extension = Path(original_name).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Upload a .txt, .pdf, or .docx transcript.")
    if not content:
        raise ValueError("The transcript file is empty.")
    if len(content) > MAX_UPLOAD_BYTES:
        raise ValueError("Transcript files must be 15 MB or smaller.")

    stored_name = f"{_safe_stem(Path(original_name).stem, 'transcript')}_{uuid.uuid4().hex[:8]}{extension}"
    transcript_id = f"upload_{_safe_stem(cleaned_expert, 'expert')}_{uuid.uuid4().hex[:8]}"

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    destination = UPLOAD_DIR / stored_name
    destination.write_bytes(content)

    return {
        "transcript_id": transcript_id,
        "expert": cleaned_expert,
        "role": cleaned_role,
        "market": cleaned_market,
        "filename": stored_name,
        "file_path": f"data/uploads/{stored_name}",
    }
