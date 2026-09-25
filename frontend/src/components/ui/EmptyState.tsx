import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "./Button";

export interface EmptyStateProps {
  title: string;
  description: string;
  subtext?: string;
  icon?: ReactNode;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  subtext,
  icon,
  actionHref,
  actionLabel,
  onAction,
  children,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      {icon ? <div className="empty-state-icon">{icon}</div> : null}
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-desc">{description}</p>
      {subtext ? <p className="empty-state-subtext">{subtext}</p> : null}
      {actionHref && actionLabel ? (
        <Link className="button button-primary" to={actionHref}>
          {actionLabel}
        </Link>
      ) : onAction && actionLabel ? (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
      {children}
    </div>
  );
}
