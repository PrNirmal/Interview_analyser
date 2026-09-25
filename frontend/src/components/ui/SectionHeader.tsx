import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  kicker?: string;
  actions?: ReactNode;
  id?: string;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  kicker,
  actions,
  id,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`section-header ${className}`.trim()}>
      <div>
        {kicker ? <span className="kicker">{kicker}</span> : null}
        <h2 id={id} className="section-title">
          {title}
        </h2>
        {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="section-actions">{actions}</div> : null}
    </div>
  );
}
