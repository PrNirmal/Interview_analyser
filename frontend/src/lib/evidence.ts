import type { EvidenceReference, FullAnalysisResponse } from "../types/analysis";

export interface ResolvedEvidence {
  expert: string;
  role: string;
  market: string;
  questionId: string;
  question: string;
  items: EvidenceReference[];
  index: number;
}

export function findEvidenceBySegmentId(
  result: FullAnalysisResponse,
  segmentId: string,
): ResolvedEvidence | null {
  for (const expert of result.experts) {
    for (const answer of expert.answers) {
      const index = answer.evidence.findIndex((item) => item.segment_id === segmentId);
      if (index >= 0) {
        return {
          expert: expert.expert,
          role: expert.role,
          market: expert.market,
          questionId: answer.question_id,
          question: answer.question,
          items: answer.evidence,
          index,
        };
      }
    }
  }
  return null;
}

export function marketsInOrder(result: FullAnalysisResponse): string[] {
  const markets: string[] = [];
  for (const expert of result.experts) {
    if (!markets.includes(expert.market)) markets.push(expert.market);
  }
  return markets;
}
