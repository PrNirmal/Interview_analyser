"""
API tests for the Interview Analyzer.

These tests mock the application services to avoid loading the real
Hugging Face model. They verify that the API layer:
    - routes requests correctly
    - serializes responses properly
    - handles errors gracefully
    - delegates to services (not implementing logic itself)
"""

from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.api.main import app
from app.domain.analysis import (
    CommonTheme,
    CrossExpertAnalysis,
    Difference,
    Disagreement,
    ExpertPosition,
)
from app.domain.answer import EvidenceReference
from app.domain.interview import (
    InterviewAnalysis,
    InterviewQuestionAnswer,
)

client = TestClient(app)


# ============================================================
# Fixtures
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


def _make_evidence(
    segment_id: str = "seg_001",
    timestamp: str = "00:01:30",
    quote: str = "This is a test quote from the transcript.",
    question_id: str | None = "Q1",
) -> EvidenceReference:
    return EvidenceReference(
        segment_id=segment_id,
        timestamp=timestamp,
        quote=quote,
        question_id=question_id,
    )


def _make_answer(
    question_id: str = "Q1",
    question: str = "What is the adoption rate?",
    answer: str = "Adoption is growing steadily.",
    confidence: str = "high",
) -> InterviewQuestionAnswer:
    return InterviewQuestionAnswer(
        question_id=question_id,
        question=question,
        answer=answer,
        evidence=[_make_evidence(question_id=question_id)],
        confidence=confidence,
    )


def _make_expert_analysis(
    transcript_id: str = "Transcript_1_France",
    expert: str = "Dr. Jean Martin",
    role: str = "Head of Urology",
    market: str = "France",
) -> InterviewAnalysis:
    return InterviewAnalysis(
        transcript_id=transcript_id,
        expert=expert,
        role=role,
        market=market,
        answers=[
            _make_answer(question_id="Q1"),
            _make_answer(question_id="Q2", question="What are the barriers?"),
        ],
    )


def _make_cross_analysis() -> CrossExpertAnalysis:
    return CrossExpertAnalysis(
        common_themes=[
            CommonTheme(
                theme="Growing adoption",
                description="All experts agree adoption is increasing.",
                experts=[
                    ExpertPosition(
                        expert="Dr. Jean Martin",
                        market="France",
                        position="Adoption is steadily increasing.",
                        evidence_segment_ids=["seg_001"],
                    ),
                    ExpertPosition(
                        expert="Anna Keller",
                        market="Germany",
                        position="Growth is ongoing.",
                        evidence_segment_ids=["seg_002"],
                    ),
                ],
            ),
        ],
        differences=[
            Difference(
                topic="Adoption pace",
                description="Experts differ on the pace of adoption.",
                expert_positions=[
                    ExpertPosition(
                        expert="Dr. Jean Martin",
                        market="France",
                        position="Rapid growth expected.",
                        evidence_segment_ids=["seg_001"],
                    ),
                    ExpertPosition(
                        expert="Anna Keller",
                        market="Germany",
                        position="Moderate growth expected.",
                        evidence_segment_ids=["seg_002"],
                    ),
                ],
            ),
        ],
        disagreements=[
            Disagreement(
                topic="Budget impact",
                description="Experts disagree on budget significance.",
                expert_positions=[
                    ExpertPosition(
                        expert="Dr. Jean Martin",
                        market="France",
                        position="Budget is the primary barrier.",
                        evidence_segment_ids=["seg_001"],
                    ),
                    ExpertPosition(
                        expert="Anna Keller",
                        market="Germany",
                        position="Budget is not the main concern.",
                        evidence_segment_ids=["seg_002"],
                    ),
                ],
            ),
        ],
    )


def _make_valid_request() -> dict:
    """Create a valid request payload using real data files."""
    return {
        "guide_path": "data/Interview_Guide.txt",
        "transcripts": [
            {
                "transcript_id": "Transcript_1_France",
                "expert": "Dr. Jean Martin",
                "role": "Head of Urology",
                "market": "France",
                "file_path": "data/Transcript_1_France.txt",
            },
            {
                "transcript_id": "Transcript_2_Germany",
                "expert": "Anna Keller",
                "role": "Former Hospital Procurement Director",
                "market": "Germany",
                "file_path": "data/Transcript_2_Germany.txt",
            },
        ],
    }


# ============================================================
# 1. Health endpoint
# ============================================================


class TestHealth:
    def test_health_returns_200(self):
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_returns_ok_status(self):
        response = client.get("/health")
        data = response.json()
        assert data["status"] == "ok"

    def test_health_returns_service_name(self):
        response = client.get("/health")
        data = response.json()
        assert data["service"] == "interview-analyzer"


# ============================================================
# 2. Full analysis — success
# ============================================================


class TestFullAnalysisSuccess:

    @patch("app.api.dependencies.get_cross_expert_analysis_service")
    @patch("app.api.dependencies.get_full_analysis_service")
    def test_full_analysis_returns_200(
        self, mock_full_svc, mock_cross_svc
    ):
        mock_service = MagicMock()
        mock_service.analyze_all.return_value = [
            _make_expert_analysis(
                transcript_id="Transcript_1_France",
                expert="Dr. Jean Martin",
                market="France",
            ),
            _make_expert_analysis(
                transcript_id="Transcript_2_Germany",
                expert="Anna Keller",
                role="Former Hospital Procurement Director",
                market="Germany",
            ),
        ]
        mock_full_svc.return_value = mock_service

        mock_cross = MagicMock()
        mock_cross.analyze.return_value = _make_cross_analysis()
        mock_cross_svc.return_value = mock_cross

        response = client.post(
            "/api/v1/analysis/full",
            json=_make_valid_request(),
        )
        assert response.status_code == 200

    @patch("app.api.dependencies.get_cross_expert_analysis_service")
    @patch("app.api.dependencies.get_full_analysis_service")
    def test_full_analysis_response_structure(
        self, mock_full_svc, mock_cross_svc
    ):
        mock_service = MagicMock()
        mock_service.analyze_all.return_value = [
            _make_expert_analysis(
                transcript_id="Transcript_1_France",
                expert="Dr. Jean Martin",
                market="France",
            ),
            _make_expert_analysis(
                transcript_id="Transcript_2_Germany",
                expert="Anna Keller",
                role="Former Hospital Procurement Director",
                market="Germany",
            ),
        ]
        mock_full_svc.return_value = mock_service

        mock_cross = MagicMock()
        mock_cross.analyze.return_value = _make_cross_analysis()
        mock_cross_svc.return_value = mock_cross

        response = client.post(
            "/api/v1/analysis/full",
            json=_make_valid_request(),
        )

        data = response.json()

        # Top-level keys
        assert "experts" in data
        assert "cross_analysis" in data
        assert "validation" in data

        # Experts
        assert len(data["experts"]) == 2
        expert = data["experts"][0]
        assert "transcript_id" in expert
        assert "expert" in expert
        assert "role" in expert
        assert "market" in expert
        assert "answers" in expert

        # Answers
        answer = expert["answers"][0]
        assert "question_id" in answer
        assert "question" in answer
        assert "answer" in answer
        assert "evidence" in answer
        assert "confidence" in answer

        # Evidence preserved
        evidence = answer["evidence"][0]
        assert "segment_id" in evidence
        assert "timestamp" in evidence
        assert "quote" in evidence

        # Cross-analysis
        cross = data["cross_analysis"]
        assert "common_themes" in cross
        assert "differences" in cross
        assert "disagreements" in cross

        # Common theme structure
        theme = cross["common_themes"][0]
        assert "theme" in theme
        assert "description" in theme
        assert "experts" in theme

        # ExpertPosition uses evidence_segment_ids
        position = theme["experts"][0]
        assert "evidence_segment_ids" in position
        assert "expert" in position
        assert "market" in position
        assert "position" in position

        # Disagreement structure
        disagreement = cross["disagreements"][0]
        assert "topic" in disagreement
        assert "description" in disagreement
        assert "expert_positions" in disagreement

        # Validation
        assert "valid" in data["validation"]
        assert "message" in data["validation"]

    @patch("app.api.dependencies.get_cross_expert_analysis_service")
    @patch("app.api.dependencies.get_full_analysis_service")
    def test_service_is_called_not_bypassed(
        self, mock_full_svc, mock_cross_svc
    ):
        """Verify the router delegates to services, not implementing logic itself."""
        mock_service = MagicMock()
        mock_service.analyze_all.return_value = [
            _make_expert_analysis(
                transcript_id="Transcript_1_France",
                expert="Dr. Jean Martin",
                market="France",
            ),
            _make_expert_analysis(
                transcript_id="Transcript_2_Germany",
                expert="Anna Keller",
                role="Former Hospital Procurement Director",
                market="Germany",
            ),
        ]
        mock_full_svc.return_value = mock_service

        mock_cross = MagicMock()
        mock_cross.analyze.return_value = _make_cross_analysis()
        mock_cross_svc.return_value = mock_cross

        client.post(
            "/api/v1/analysis/full",
            json=_make_valid_request(),
        )

        # Service was called
        mock_service.analyze_all.assert_called_once()

        # Cross-expert service was called
        mock_cross.analyze.assert_called_once()


# ============================================================
# 3. Invalid request — validation errors
# ============================================================


class TestValidationErrors:
    def test_missing_guide_path_returns_422(self):
        response = client.post(
            "/api/v1/analysis/full",
            json={
                "transcripts": [
                    {
                        "transcript_id": "test",
                        "expert": "test",
                        "role": "test",
                        "market": "test",
                        "file_path": "data/Transcript_1_France.txt",
                    }
                ]
            },
        )
        assert response.status_code == 422

    def test_empty_transcripts_returns_422(self):
        response = client.post(
            "/api/v1/analysis/full",
            json={
                "guide_path": "data/Interview_Guide.txt",
                "transcripts": [],
            },
        )
        assert response.status_code == 422

    def test_missing_transcript_fields_returns_422(self):
        response = client.post(
            "/api/v1/analysis/full",
            json={
                "guide_path": "data/Interview_Guide.txt",
                "transcripts": [
                    {
                        "transcript_id": "test",
                        # missing expert, role, market, file_path
                    }
                ],
            },
        )
        assert response.status_code == 422

    def test_empty_body_returns_422(self):
        response = client.post(
            "/api/v1/analysis/full",
            content=b"",
            headers={"Content-Type": "application/json"},
        )
        assert response.status_code == 422


# ============================================================
# 4. Missing file
# ============================================================


class TestMissingFile:
    def test_missing_guide_file_returns_404(self):
        response = client.post(
            "/api/v1/analysis/full",
            json={
                "guide_path": "data/nonexistent_guide.txt",
                "transcripts": [
                    {
                        "transcript_id": "test",
                        "expert": "test",
                        "role": "test",
                        "market": "test",
                        "file_path": "data/Transcript_1_France.txt",
                    }
                ],
            },
        )
        assert response.status_code == 404
        data = response.json()
        assert data["detail"]["error"]["code"] == "FILE_NOT_FOUND"

    def test_missing_transcript_file_returns_404(self):
        response = client.post(
            "/api/v1/analysis/full",
            json={
                "guide_path": "data/Interview_Guide.txt",
                "transcripts": [
                    {
                        "transcript_id": "test",
                        "expert": "test",
                        "role": "test",
                        "market": "test",
                        "file_path": "data/nonexistent_transcript.txt",
                    }
                ],
            },
        )
        assert response.status_code == 404


# ============================================================
# 5. Path traversal attacks
# ============================================================


class TestPathSecurity:
    def test_path_traversal_blocked(self):
        response = client.post(
            "/api/v1/analysis/full",
            json={
                "guide_path": "../../etc/passwd",
                "transcripts": [
                    {
                        "transcript_id": "test",
                        "expert": "test",
                        "role": "test",
                        "market": "test",
                        "file_path": "data/Transcript_1_France.txt",
                    }
                ],
            },
        )
        assert response.status_code == 400
        data = response.json()
        assert data["detail"]["error"]["code"] == "INVALID_PATH"

    def test_absolute_path_outside_project_blocked(self):
        response = client.post(
            "/api/v1/analysis/full",
            json={
                "guide_path": "/etc/passwd",
                "transcripts": [
                    {
                        "transcript_id": "test",
                        "expert": "test",
                        "role": "test",
                        "market": "test",
                        "file_path": "data/Transcript_1_France.txt",
                    }
                ],
            },
        )
        # Will be blocked — either 400 (INVALID_PATH) or 404
        assert response.status_code in (400, 404)


# ============================================================
# 6. Service failure
# ============================================================


class TestServiceFailure:
    @patch("app.api.dependencies.get_full_analysis_service")
    def test_analysis_service_error_returns_500(self, mock_full_svc):
        mock_service = MagicMock()
        mock_service.analyze_all.side_effect = RuntimeError("LLM crashed")
        mock_full_svc.return_value = mock_service

        response = client.post(
            "/api/v1/analysis/full",
            json=_make_valid_request(),
        )
        assert response.status_code == 500
        data = response.json()
        assert data["detail"]["error"]["code"] == "ANALYSIS_FAILED"

    @patch("app.api.dependencies.get_full_analysis_service")
    def test_value_error_returns_400(self, mock_full_svc):
        mock_service = MagicMock()
        mock_service.analyze_all.side_effect = ValueError(
            "No interview questions found."
        )
        mock_full_svc.return_value = mock_service

        response = client.post(
            "/api/v1/analysis/full",
            json=_make_valid_request(),
        )
        assert response.status_code == 400
        data = response.json()
        assert data["detail"]["error"]["code"] == "INVALID_INPUT"

    @patch("app.api.dependencies.get_cross_expert_analysis_service")
    @patch("app.api.dependencies.get_full_analysis_service")
    def test_cross_analysis_failure_returns_500(
        self, mock_full_svc, mock_cross_svc
    ):
        mock_service = MagicMock()
        mock_service.analyze_all.return_value = [
            _make_expert_analysis(
                transcript_id="Transcript_1_France",
                expert="Dr. Jean Martin",
                market="France",
            ),
            _make_expert_analysis(
                transcript_id="Transcript_2_Germany",
                expert="Anna Keller",
                market="Germany",
            ),
        ]
        mock_full_svc.return_value = mock_service

        mock_cross = MagicMock()
        mock_cross.analyze.side_effect = RuntimeError("LLM exploded")
        mock_cross_svc.return_value = mock_cross

        response = client.post(
            "/api/v1/analysis/full",
            json=_make_valid_request(),
        )
        assert response.status_code == 500
        data = response.json()
        assert data["detail"]["error"]["code"] == "CROSS_ANALYSIS_FAILED"

    @patch("app.api.dependencies.get_cross_expert_analysis_service")
    @patch("app.api.dependencies.get_full_analysis_service")
    def test_cross_analysis_validation_failure_returns_validation_false(
        self, mock_full_svc, mock_cross_svc
    ):
        """
        When CrossExpertAnalysisService raises ValueError (validation failure),
        the response should still be 200 with validation.valid=False.
        """
        mock_service = MagicMock()
        mock_service.analyze_all.return_value = [
            _make_expert_analysis(
                transcript_id="Transcript_1_France",
                expert="Dr. Jean Martin",
                market="France",
            ),
            _make_expert_analysis(
                transcript_id="Transcript_2_Germany",
                expert="Anna Keller",
                market="Germany",
            ),
        ]
        mock_full_svc.return_value = mock_service

        mock_cross = MagicMock()
        mock_cross.analyze.side_effect = ValueError(
            "Cross-expert analysis failed evidence validation."
        )
        mock_cross_svc.return_value = mock_cross

        response = client.post(
            "/api/v1/analysis/full",
            json=_make_valid_request(),
        )
        assert response.status_code == 200
        data = response.json()
        assert data["validation"]["valid"] is False


# ============================================================
# 7. Evidence preservation
# ============================================================


class TestEvidencePreservation:
    @patch("app.api.dependencies.get_cross_expert_analysis_service")
    @patch("app.api.dependencies.get_full_analysis_service")
    def test_evidence_fields_preserved(
        self, mock_full_svc, mock_cross_svc
    ):
        """All three evidence fields (segment_id, timestamp, quote) must be preserved."""
        mock_service = MagicMock()
        analysis = _make_expert_analysis()
        mock_service.analyze_all.return_value = [
            analysis,
            _make_expert_analysis(
                transcript_id="Transcript_2_Germany",
                expert="Anna Keller",
                market="Germany",
            ),
        ]
        mock_full_svc.return_value = mock_service

        mock_cross = MagicMock()
        mock_cross.analyze.return_value = _make_cross_analysis()
        mock_cross_svc.return_value = mock_cross

        response = client.post(
            "/api/v1/analysis/full",
            json=_make_valid_request(),
        )

        data = response.json()
        evidence = data["experts"][0]["answers"][0]["evidence"][0]

        assert evidence["segment_id"] == "seg_001"
        assert evidence["timestamp"] == "00:01:30"
        assert evidence["quote"] == "This is a test quote from the transcript."

    @patch("app.api.dependencies.get_cross_expert_analysis_service")
    @patch("app.api.dependencies.get_full_analysis_service")
    def test_cross_analysis_evidence_segment_ids_preserved(
        self, mock_full_svc, mock_cross_svc
    ):
        """ExpertPosition.evidence_segment_ids must be preserved, not renamed."""
        mock_service = MagicMock()
        mock_service.analyze_all.return_value = [
            _make_expert_analysis(
                transcript_id="Transcript_1_France",
                expert="Dr. Jean Martin",
                market="France",
            ),
            _make_expert_analysis(
                transcript_id="Transcript_2_Germany",
                expert="Anna Keller",
                market="Germany",
            ),
        ]
        mock_full_svc.return_value = mock_service

        mock_cross = MagicMock()
        mock_cross.analyze.return_value = _make_cross_analysis()
        mock_cross_svc.return_value = mock_cross

        response = client.post(
            "/api/v1/analysis/full",
            json=_make_valid_request(),
        )

        data = response.json()
        theme_position = data["cross_analysis"]["common_themes"][0]["experts"][0]

        # Must be evidence_segment_ids, NOT evidence
        assert "evidence_segment_ids" in theme_position
        assert theme_position["evidence_segment_ids"] == ["seg_001"]


# ============================================================
# 8. OpenAPI docs
# ============================================================


class TestOpenAPI:
    def test_docs_available(self):
        response = client.get("/docs")
        assert response.status_code == 200

    def test_redoc_available(self):
        response = client.get("/redoc")
        assert response.status_code == 200

    def test_openapi_json_available(self):
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert data["info"]["title"] == "Interview Analyzer API"
        assert "/health" in data["paths"]
        assert "/api/v1/analysis/full" in data["paths"]
