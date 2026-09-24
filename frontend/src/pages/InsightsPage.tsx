import { AskAcrossInterviews } from "../components/analysis/AskAcrossInterviews";
import { AnalysisHeader } from "../components/analysis/AnalysisHeader";
import { DisagreementList } from "../components/analysis/DisagreementList";
import { ExpertComparison } from "../components/analysis/ExpertComparison";
import { ExpertPositions, type PositionGroup } from "../components/analysis/ExpertPositions";
import { ThemeList } from "../components/analysis/ThemeList";
import { ValidationPanel } from "../components/analysis/ValidationPanel";
import { EmptyState } from "../components/ui/EmptyState";
import { useAnalysis } from "../context/AnalysisContext";
import { findEvidenceBySegmentId, marketsInOrder } from "../lib/evidence";

export function InsightsPage() {
  const { session, openEvidence } = useAnalysis();

  if (!session) {
    return (
      <div className="page">
        <EmptyState
          title="No analysis yet"
          description="Run an analysis to see expert insights."
          actionHref="/"
          actionLabel="Go to overview"
        />
      </div>
    );
  }

  const { cross_analysis: crossAnalysis, validation } = session.result;
  const groups: PositionGroup[] = [
    ...crossAnalysis.common_themes.map((theme) => ({
      source: "Common theme",
      topic: theme.theme,
      positions: theme.experts,
    })),
    ...crossAnalysis.differences.map((item) => ({
      source: "Difference",
      topic: item.topic,
      positions: item.expert_positions,
    })),
    ...crossAnalysis.disagreements.map((item) => ({
      source: "Disagreement",
      topic: item.topic,
      positions: item.expert_positions,
    })),
  ];

  const onSegment = (segmentId: string) => {
    const resolved = findEvidenceBySegmentId(session.result, segmentId);
    if (resolved) openEvidence(resolved);
  };

  return (
    <div className="page">
      <AnalysisHeader
        kicker="Cross-expert analysis"
        title="Insights"
        subtitle="Themes, disagreements, expert positions, and validation from the returned analysis."
      />
      <nav className="section-nav" aria-label="Insight sections">
        <a href="#common-themes">Common Themes</a>
        <a href="#disagreements">Disagreements</a>
        <a href="#expert-positions">Expert Positions</a>
        <a href="#expert-comparison">Expert Comparison</a>
        <a href="#validation">Validation</a>
        <a href="#ask">Ask across interviews</a>
      </nav>
      <ValidationPanel validation={validation} />
      <ThemeList themes={crossAnalysis.common_themes} onSegment={onSegment} />
      <DisagreementList disagreements={crossAnalysis.disagreements} onSegment={onSegment} />
      <ExpertPositions groups={groups} onSegment={onSegment} />
      <ExpertComparison
        markets={marketsInOrder(session.result)}
        differences={crossAnalysis.differences}
        disagreements={crossAnalysis.disagreements}
      />
      <AskAcrossInterviews />
    </div>
  );
}
