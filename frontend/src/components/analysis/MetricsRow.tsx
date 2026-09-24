import type { AnalysisMetrics } from "../../lib/metrics";

interface MetricsRowProps {
  metrics: AnalysisMetrics;
}

const items: Array<{ key: keyof AnalysisMetrics; label: string; format?: (metrics: AnalysisMetrics) => string }> = [
  { key: "experts", label: "Experts analyzed" },
  { key: "questions", label: "Questions analyzed" },
  { key: "evidence", label: "Evidence segments" },
  { key: "themes", label: "Themes identified" },
  { key: "differences", label: "Differences identified" },
  { key: "disagreements", label: "Disagreements identified" },
  {
    key: "validationValid",
    label: "Validation",
    format: (metrics) => (metrics.validationValid ? "Valid" : "Invalid"),
  },
];

export function MetricsRow({ metrics }: MetricsRowProps) {
  return (
    <section className="metrics" aria-label="Analysis metrics">
      {items.map((item) => (
        <article
          key={item.key}
          className={`metric${
            item.key === "validationValid"
              ? metrics.validationValid
                ? " is-valid"
                : " is-invalid"
              : ""
          }`}
        >
          <p className="metric-value">{item.format ? item.format(metrics) : metrics[item.key]}</p>
          <p className="metric-label">{item.label}</p>
        </article>
      ))}
    </section>
  );
}
