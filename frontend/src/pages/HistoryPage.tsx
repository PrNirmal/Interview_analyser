import { Link } from "react-router-dom";
import { Clock, FileText, Users, ArrowUpRight, History } from "lucide-react";
import { AnalysisHeader } from "../components/analysis/AnalysisHeader";
import { EmptyState } from "../components/ui/EmptyState";
import { Badge } from "../components/ui/Badge";
import { useAnalysis } from "../context/AnalysisContext";
import { deriveMetrics, plural } from "../lib/metrics";

export function HistoryPage() {
  const { session } = useAnalysis();
  const metrics = session ? deriveMetrics(session.result) : null;

  return (
    <div className="page history-page">
      <AnalysisHeader
        kicker="History"
        title="This session"
        subtitle="The API does not store past runs. The latest analysis in this browser session is kept here until the tab closes."
      />

      {!session ? (
        <EmptyState
          title="No analysis runs yet"
          description="Run an analysis to see expert insights."
          subtext="Analyses completed in this browser session will be tracked here with their timestamps, source guides, and validation results."
          icon={<History size={36} />}
          actionHref="/"
          actionLabel="Analyze interviews"
        />
      ) : (
        <div className="history-timeline">
          <div className="timeline-date-label">
            <Clock size={14} />
            <span>Today's Session</span>
          </div>

          <article className="history-card">
            <div className="history-card-header">
              <div>
                <span className="meta-label">Current session</span>
                <h2 className="history-card-title">Full interview analysis</h2>
                <p className="quiet history-time">
                  Completed {formatCompleted(session.completedAt)}
                </p>
              </div>
              <Badge tone="ready" dot>
                {session.result.validation.valid ? "Validation valid" : "Validation invalid"}
              </Badge>
            </div>

            <dl className="history-facts">
              <div className="fact-item">
                <dt>
                  <FileText size={14} className="inline-icon" />
                  <span>Guide</span>
                </dt>
                <dd className="mono">{session.guidePath}</dd>
              </div>
              <div className="fact-item">
                <dt>
                  <Users size={14} className="inline-icon" />
                  <span>Experts</span>
                </dt>
                <dd>
                  {session.transcripts
                    .map((item) => `${item.expert} (${item.market})`)
                    .join(", ")}
                </dd>
              </div>
              <div className="fact-item">
                <dt>
                  <span>Result</span>
                </dt>
                <dd>
                  {metrics
                    ? `${plural(metrics.experts, "expert")} · ${plural(
                        metrics.evidence,
                        "evidence segment"
                      )} · ${
                        session.result.validation.valid
                          ? "Validation valid"
                          : "Validation invalid"
                      }`
                    : null}
                </dd>
              </div>
            </dl>

            <div className="history-links">
              <Link className="button button-primary" to="/analysis">
                <span>View analysis</span>
                <ArrowUpRight size={15} />
              </Link>
              <Link className="button button-secondary" to="/insights">
                <span>View insights</span>
              </Link>
            </div>
          </article>
        </div>
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
