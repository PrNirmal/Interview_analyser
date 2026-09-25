interface StatusProps {
  state: "ready" | "unavailable" | "running" | "unknown";
  label?: string;
  className?: string;
}

export function Status({ state, label, className = "" }: StatusProps) {
  const defaultLabels = {
    ready: "API connected",
    unavailable: "API offline",
    running: "Analysis running",
    unknown: "Checking status",
  };

  const text = label ?? defaultLabels[state];

  return (
    <div className={`status-indicator status-${state} ${className}`.trim()}>
      <span className="status-dot" aria-hidden="true" />
      <span className="status-label">{text}</span>
    </div>
  );
}
