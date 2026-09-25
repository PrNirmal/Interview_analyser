import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface ProgressStateProps {
  label: string;
}

const STAGES = [
  { key: "transcripts", title: "Preparing transcripts & interviews" },
  { key: "guide", title: "Analyzing responses against guide" },
  { key: "evidence", title: "Extracting evidence & timestamps" },
  { key: "insights", title: "Generating cross-interview insights" },
] as const;

export function ProgressState({ label }: ProgressStateProps) {
  // Determine approximate active stage based on label
  let activeIndex = 0;
  const lower = label.toLowerCase();
  if (lower.includes("analyzing") || lower.includes("expert")) {
    activeIndex = 1;
  } else if (lower.includes("evidence")) {
    activeIndex = 2;
  } else if (lower.includes("comparing") || lower.includes("validating") || lower.includes("insight")) {
    activeIndex = 3;
  }

  return (
    <div className="analysis-progress-card" role="status" aria-live="polite">
      <div className="progress-header">
        <div className="progress-title-row">
          <Loader2 className="progress-spinner-icon animate-spin" size={18} />
          <div className="progress-headline">
            <h3>Running Intelligence Analysis</h3>
            <p className="progress-current-label">{label}</p>
          </div>
        </div>
      </div>

      <div className="progress-stages-grid">
        {STAGES.map((stage, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          return (
            <div
              key={stage.key}
              className={`progress-step ${
                isDone ? "is-done" : isCurrent ? "is-current" : "is-pending"
              }`}
            >
              <div className="step-indicator">
                {isDone ? (
                  <CheckCircle2 size={16} className="step-icon done" />
                ) : isCurrent ? (
                  <span className="step-dot current" />
                ) : (
                  <Circle size={14} className="step-icon pending" />
                )}
              </div>
              <div className="step-content">
                <span className="step-number">0{idx + 1}</span>
                <span className="step-title">{stage.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="progress-linear-track" aria-hidden="true">
        <div
          className="progress-linear-fill"
          style={{ width: `${((activeIndex + 1) / STAGES.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
