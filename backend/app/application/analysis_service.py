import logging

from app.domain.analysis import CrossExpertAnalysis
from app.domain.interview import InterviewAnalysis
from app.llm.cross_expert_analysis import generate_cross_expert_analysis
from app.validation.cross_analysis_validator import (
    repair_cross_expert_analysis,
    validate_cross_expert_analysis,
)

logger = logging.getLogger(__name__)


class CrossExpertAnalysisService:

    def analyze(
        self,
        expert_analyses: list[InterviewAnalysis],
    ) -> CrossExpertAnalysis:

        if len(expert_analyses) < 2:
            raise ValueError(
                "Cross-expert analysis requires at least two experts."
            )

        generated = generate_cross_expert_analysis(
            expert_analyses
        )
        result = repair_cross_expert_analysis(
            analysis=generated,
            expert_analyses=expert_analyses,
        )
        logger.info(
            "Cross-expert analysis prepared: themes=%d differences=%d disagreements=%d",
            len(result.common_themes),
            len(result.differences),
            len(result.disagreements),
        )

        is_valid = validate_cross_expert_analysis(
            analysis=result,
            expert_analyses=expert_analyses,
        )

        if not is_valid:
            raise ValueError(
                "Cross-expert analysis failed evidence validation."
            )

        return result