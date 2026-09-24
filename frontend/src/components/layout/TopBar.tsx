import { useAnalysis } from "../../context/AnalysisContext";

export function TopBar() {
  const { health, status } = useAnalysis();
  const running = status === "running";

  let label = "Checking API";
  let state: "unknown" | "ready" | "unavailable" | "running" = "unknown";
  if (running) {
    label = "Analysis Running";
    state = "running";
  } else if (health === "ready") {
    label = "API Ready";
    state = "ready";
  } else if (health === "unavailable") {
    label = "API Unavailable";
    state = "unavailable";
  }

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          IA
        </span>
        <span>Interview Analyzer</span>
      </div>
      <p className="system-status" data-state={state}>
        <span className="status-dot" aria-hidden="true" />
        <span>{label}</span>
      </p>
    </header>
  );
}
