import { Users, FileQuestion, Quote, Layers, GitCompare, AlertTriangle, ShieldCheck } from "lucide-react";
import type { AnalysisMetrics } from "../../lib/metrics";

interface MetricsRowProps {
  metrics: AnalysisMetrics;
}

interface MetricItemDef {
  key: keyof AnalysisMetrics;
  label: string;
  icon: typeof Users;
  format?: (metrics: AnalysisMetrics) => string;
}

const items: MetricItemDef[] = [
  { key: "experts", label: "Experts analyzed", icon: Users },
  { key: "questions", label: "Questions analyzed", icon: FileQuestion },
  { key: "evidence", label: "Evidence segments", icon: Quote },
  { key: "themes", label: "Themes identified", icon: Layers },
  { key: "differences", label: "Differences identified", icon: GitCompare },
  { key: "disagreements", label: "Disagreements identified", icon: AlertTriangle },
  {
    key: "validationValid",
    label: "Validation",
    icon: ShieldCheck,
    format: (metrics) => (metrics.validationValid ? "Valid" : "Invalid"),
  },
];

export function MetricsRow({ metrics }: MetricsRowProps) {
  return (
    <section className="metrics-strip" aria-label="Analysis metrics">
      {items.map((item) => {
        const Icon = item.icon;
        const isValidation = item.key === "validationValid";
        const isValid = metrics.validationValid;
        const value = item.format ? item.format(metrics) : metrics[item.key];

        return (
          <article
            key={item.key}
            className={`metric-pill ${
              isValidation
                ? isValid
                  ? "is-valid"
                  : "is-invalid"
                : ""
            }`}
          >
            <div className="metric-pill-icon">
              <Icon size={16} strokeWidth={2} />
            </div>
            <div className="metric-pill-info">
              <span className="metric-value">{value}</span>
              <span className="metric-label">{item.label}</span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
