import { AskAcrossInterviews } from "../components/analysis/AskAcrossInterviews";
import { AnalysisHeader } from "../components/analysis/AnalysisHeader";
import { DisagreementList } from "../components/analysis/DisagreementList";
import { ExpertComparison } from "../components/analysis/ExpertComparison";
import { ExpertPositions, type PositionGroup } from "../components/analysis/ExpertPositions";
import { ThemeList } from "../components/analysis/ThemeList";
import { ValidationPanel } from "../components/analysis/ValidationPanel";
import { EmptyState } from "../components/ui/EmptyState";
import { useAnalysis } from "../context/AnalysisContext";
import { usePreferences } from "../context/PreferencesContext";
import { findEvidenceBySegmentId, marketsInOrder } from "../lib/evidence";
import { Layers } from "lucide-react";
import { Link } from "react-router-dom";

export function InsightsPage() {
  const { session, openEvidence } = useAnalysis();
  const { preferences } = usePreferences();

  if (!session) {
    return (
      <div className="page">
        <EmptyState
          title="No analysis yet"
          description="Run an analysis to see expert insights."
          subtext="Upload transcripts and run analysis against your interview guide to surface cross-market consensus, differences, and strategic insights."
          icon={<Layers size={36} />}
          actionHref="/"
          actionLabel="Go to overview"
        />
      </div>
    );
  }

  const { cross_analysis: crossAnalysis, validation } = session.result;
  const disagreements =
    preferences.disagreementMode === "contradictions"
      ? crossAnalysis.disagreements.filter((item) => item.expert_positions.length >= 2)
      : crossAnalysis.disagreements;
  const held = preferences.requireValidation && !validation.valid;
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
    ...disagreements.map((item) => ({
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
    <div className="page insights-page">
      <AnalysisHeader
        kicker="Cross-expert analysis"
        title="Insights"
        subtitle="Themes, disagreements, expert positions, and validation from the returned analysis."
      />

      <nav className="section-nav" aria-label="Insight sections">
        {held ? null : (
          <>
            <a href="#common-themes">Common Themes</a>
            <a href="#disagreements">Disagreements</a>
            <a href="#expert-positions">Expert Positions</a>
            <a href="#expert-comparison">Expert Comparison</a>
          </>
        )}
        <a href="#validation">Validation</a>
        <a href="#ask">Ask across interviews</a>
      </nav>

      <ValidationPanel validation={validation} />
      {held ? (
        <section className="settings-hold" aria-labelledby="insights-held-heading">
          <h2 id="insights-held-heading">Insights are held</h2>
          <p>
            This run did not pass evidence validation. Themes, disagreements, and the comparison stay
            hidden until validation passes.
          </p>
          <Link className="button button-secondary" to="/settings">
            Review settings
          </Link>
        </section>
      ) : (
        <>
          <ThemeList themes={crossAnalysis.common_themes} onSegment={onSegment} />
          <DisagreementList
            disagreements={disagreements}
            onSegment={onSegment}
            label={
              preferences.disagreementMode === "contradictions" ? "CONTRADICTION" : "DIVERGENT VIEWPOINTS"
            }
          />
          <ExpertPositions groups={groups} onSegment={onSegment} />
          <ExpertComparison
            markets={marketsInOrder(session.result)}
            differences={crossAnalysis.differences}
            disagreements={disagreements}
          />
        </>
      )}
      <AskAcrossInterviews />
    </div>
  );
}
