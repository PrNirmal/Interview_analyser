import type { FullAnalysisResponse } from "../types/analysis";

export interface AnalysisMetrics {
  experts: number;
  answers: number;
  questions: number;
  evidence: number;
  themes: number;
  differences: number;
  disagreements: number;
  validationValid: boolean;
}

export function deriveMetrics(result: FullAnalysisResponse): AnalysisMetrics {
  const questionIds = new Set<string>();
  let answers = 0;
  let evidence = 0;

  for (const expert of result.experts) {
    for (const answer of expert.answers) {
      answers += 1;
      questionIds.add(answer.question_id);
      evidence += answer.evidence.length;
    }
  }

  return {
    experts: result.experts.length,
    answers,
    questions: questionIds.size,
    evidence,
    themes: result.cross_analysis.common_themes.length,
    differences: result.cross_analysis.differences.length,
    disagreements: result.cross_analysis.disagreements.length,
    validationValid: result.validation.valid,
  };
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function initials(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter((part) => part !== "" && part !== "Dr." && part !== "Dr");
  const letters = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase());
  return letters.join("") || "?";
}

export function evidenceLabel(count: number): string {
  return count === 1 ? "1 supporting segment" : `${count} supporting segments`;
}
