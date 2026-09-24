import { Link } from "react-router-dom";
import { AnalysisHeader } from "../components/analysis/AnalysisHeader";
import { EmptyState } from "../components/ui/EmptyState";
import { useAnalysis } from "../context/AnalysisContext";
import { deriveMetrics, plural } from "../lib/metrics";

export function HistoryPage() {
  const { session } = useAnalysis();
  const metrics = session ? deriveMetrics(session.result) : null;

  return (
    <div className="page">
      <AnalysisHeader
        kicker="History"
        title="This session"
        subtitle="The API does not store past runs. The latest analysis in this browser session is kept here until the tab closes."
      />
      {!session ? (
        <EmptyState
          title="No analysis runs yet"
          description="Run an analysis to see expert insights."
          actionHref="/"
          actionLabel="Analyze interviews"
        />
      ) : (
        <article className="history-card">
          <p className="meta-label">Current session</p>
          <h2>Full interview analysis</h2>
          <p className="quiet">Completed {formatCompleted(session.completedAt)}</p>
          <dl className="history-facts">
            <div>
              <dt>Guide</dt>
              <dd className="mono">{session.guidePath}</dd>
            </div>
            <div>
              <dt>Experts</dt>
              <dd>{session.transcripts.map((item) => `${item.expert} (${item.market})`).join(", ")}</dd>
            </div>
            <div>
              <dt>Result</dt>
              <dd>
                {metrics
                  ? `${plural(metrics.experts, "expert")} · ${plural(metrics.evidence, "evidence segment")} · ${
                      session.result.validation.valid ? "Validation valid" : "Validation invalid"
                    }`
                  : null}
              </dd>
            </div>
          </dl>
          <div className="history-links">
            <Link className="button button-primary" to="/analysis">
              View analysis
            </Link>
            <Link className="button button-secondary" to="/insights">
              View insights
            </Link>
          </div>
        </article>
      )}
    </div>
  );
}

function formatCompleted(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
