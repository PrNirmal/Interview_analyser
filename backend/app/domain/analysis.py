from pydantic import BaseModel


class ExpertPosition(BaseModel):
    expert: str
    market: str
    position: str
    evidence_segment_ids: list[str]


class CommonTheme(BaseModel):
    theme: str
    description: str
    experts: list[ExpertPosition]


class Disagreement(BaseModel):
    topic: str
    description: str
    expert_positions: list[ExpertPosition]


class Difference(BaseModel):
    topic: str
    description: str
    expert_positions: list[ExpertPosition]

class CrossExpertAnalysis(BaseModel):
    common_themes: list[CommonTheme]
    differences: list[Difference]
    disagreements: list[Disagreement]