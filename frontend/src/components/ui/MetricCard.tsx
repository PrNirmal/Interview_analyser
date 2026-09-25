import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  badge?: string;
  icon?: ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subtext,
  badge,
  icon,
  className = "",
}: MetricCardProps) {
  return (
    <article className={`metric-card ${className}`.trim()}>
      <div className="metric-card-header">
        <span className="metric-card-label">{label}</span>
        {icon ? <span className="metric-card-icon">{icon}</span> : null}
      </div>
      <div className="metric-card-body">
        <span className="metric-card-value">{value}</span>
        {badge ? <span className="metric-card-badge">{badge}</span> : null}
      </div>
      {subtext ? <p className="metric-card-subtext">{subtext}</p> : null}
    </article>
  );
}
