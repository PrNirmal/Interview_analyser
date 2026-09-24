import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AnalysisHeader } from "../components/analysis/AnalysisHeader";
import { ExpertAnalysis } from "../components/analysis/ExpertAnalysis";
import { MetricsRow } from "../components/analysis/MetricsRow";
import { ValidationPanel } from "../components/analysis/ValidationPanel";
import { EmptyState } from "../components/ui/EmptyState";
import { useAnalysis } from "../context/AnalysisContext";
import { deriveMetrics, plural } from "../lib/metrics";

export function AnalysisPage() {
  const { session } = useAnalysis();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, [location.hash, session]);

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

  const metrics = deriveMetrics(session.result);

  return (
    <div className="page">
      <AnalysisHeader
        kicker="Analysis overview"
        title="Analysis complete"
        subtitle={`${plural(metrics.experts, "expert")} · ${plural(metrics.answers, "answer")} · ${plural(metrics.evidence, "evidence item")}`}
      />
      <MetricsRow metrics={metrics} />
      <ValidationPanel validation={session.result.validation} />
      <ExpertAnalysis />
    </div>
  );
}
