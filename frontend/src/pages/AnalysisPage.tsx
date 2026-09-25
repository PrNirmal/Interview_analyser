import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  FileText,
  Users,
  ShieldCheck,
  LayoutGrid,
  Columns,
} from "lucide-react";
import { AnalysisHeader } from "../components/analysis/AnalysisHeader";
import { ExpertAnalysis } from "../components/analysis/ExpertAnalysis";
import { MetricsRow } from "../components/analysis/MetricsRow";
import { ValidationPanel } from "../components/analysis/ValidationPanel";
import { ResearchWorkspace } from "../components/analysis/ResearchWorkspace";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAnalysis } from "../context/AnalysisContext";
import { deriveMetrics, plural } from "../lib/metrics";

export function AnalysisPage() {
  const {
    session,
    status,
    run,
    guideFilename,
    guideTitle,
    guideQuestionCount,
    transcripts,
    selectedIds,
    openEvidence,
  } = useAnalysis();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<"workspace" | "experts">("workspace");

  const running = status === "running";
  const selectedTranscripts = transcripts.filter((t) =>
    selectedIds.has(t.transcriptId)
  );

  useEffect(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    // If navigating to an expert anchor, switch to expert view mode
    if (id.startsWith("Transcript") || id.startsWith("expert")) {
      setViewMode("experts");
    }
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    }, 100);
  }, [location.hash, session]);

  if (!session) {
    return (
      <div className="page analysis-prep-page">
        <div className="analysis-empty-lead">
          <div className="lead-icon-bubble">
            <Sparkles size={28} className="sparkle-lead" />
          </div>
          <h1 className="analysis-empty-title">Analyze interviews</h1>
          <p className="analysis-empty-subtitle">
            Turn expert conversations into evidence-backed findings and cross-market intelligence.
          </p>

          <div className="analysis-empty-actions">
            <Badge tone="info" size="md">
              {plural(selectedTranscripts.length, "interview")} selected
            </Badge>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => void run()}
              disabled={running || selectedTranscripts.length === 0}
            >
              {running ? "Running analysis..." : "Run analysis"}
            </Button>
          </div>
        </div>

        {/* PREPARATION OVERVIEW CARDS */}
        <div className="prep-grid">
          <article className="prep-card">
            <div className="prep-card-head">
              <div className="prep-card-icon">
                <FileText size={18} />
              </div>
              <div>
                <span className="prep-card-label">INTERVIEW GUIDE</span>
                <h3>{guideTitle}</h3>
              </div>
            </div>
            <div className="prep-card-body">
              <p className="prep-meta">
                <span className="mono">{guideFilename}</span> ·{" "}
                <strong>{guideQuestionCount}</strong> questions
              </p>
              <div className="prep-status-row">
                <Badge tone="ready" dot>Ready</Badge>
              </div>
            </div>
          </article>

          <article className="prep-card">
            <div className="prep-card-head">
              <div className="prep-card-icon">
                <Users size={18} />
              </div>
              <div>
                <span className="prep-card-label">EXPERT INTERVIEWS</span>
                <h3>{plural(selectedTranscripts.length, "expert")} ready</h3>
              </div>
            </div>
            <div className="prep-card-body">
              <ul className="prep-expert-list">
                {selectedTranscripts.slice(0, 3).map((item) => (
                  <li key={item.transcriptId}>
                    <strong>{item.expert}</strong>
                    <span className="quiet"> · {item.market}</span>
                  </li>
                ))}
                {selectedTranscripts.length > 3 ? (
                  <li className="quiet">
                    +{selectedTranscripts.length - 3} more interviews
                  </li>
                ) : null}
              </ul>
              <div className="prep-status-row">
                <Badge tone="ready" dot>Selected for analysis</Badge>
              </div>
            </div>
          </article>

          <article className="prep-card highlight-card">
            <div className="prep-card-head">
              <div className="prep-card-icon highlight">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="prep-card-label">RESEARCH CAPABILITIES</span>
                <h3>Ready to analyze</h3>
              </div>
            </div>
            <div className="prep-card-body">
              <ul className="prep-capabilities-list">
                <li><CheckCircle2 size={13} className="text-ready" /> Answers to interview questions</li>
                <li><CheckCircle2 size={13} className="text-ready" /> Common themes & positions</li>
                <li><CheckCircle2 size={13} className="text-ready" /> Agreements & market differences</li>
                <li><CheckCircle2 size={13} className="text-ready" /> Supporting quotes & timestamps</li>
              </ul>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full mt-2"
                onClick={() => void run()}
                disabled={running || selectedTranscripts.length === 0}
              >
                {running ? "Running..." : "Run Analysis"}
              </Button>
            </div>
          </article>
        </div>
      </div>
    );
  }

  const metrics = deriveMetrics(session.result);

  return (
    <div className="page analysis-active-page">
      <div className="analysis-page-header-row">
        <AnalysisHeader
          kicker="Analysis overview"
          title="Analysis complete"
          subtitle={`${plural(metrics.experts, "expert")} · ${plural(metrics.answers, "answer")} · ${plural(metrics.evidence, "evidence item")}`}
        />

        {/* View Switcher: 3-Panel Workspace vs Expert Breakdown */}
        <div className="view-mode-toggle" role="tablist" aria-label="Analysis view mode">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "workspace"}
            className={`toggle-tab ${viewMode === "workspace" ? "is-active" : ""}`}
            onClick={() => setViewMode("workspace")}
          >
            <Columns size={15} />
            <span>3-Panel Workspace</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "experts"}
            className={`toggle-tab ${viewMode === "experts" ? "is-active" : ""}`}
            onClick={() => setViewMode("experts")}
          >
            <LayoutGrid size={15} />
            <span>Expert Breakdown</span>
          </button>
        </div>
      </div>

      <MetricsRow metrics={metrics} />

      <ValidationPanel validation={session.result.validation} />

      {viewMode === "workspace" ? (
        <ResearchWorkspace
          result={session.result}
          onViewEvidence={openEvidence}
        />
      ) : (
        <ExpertAnalysis />
      )}
    </div>
  );
}
