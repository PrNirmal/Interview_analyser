import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
}

export function EmptyState({ title, description, actionHref, actionLabel, children }: EmptyStateProps) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{description}</p>
      {actionHref && actionLabel ? (
        <Link className="button button-primary" to={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
      {children}
    </div>
  );
}
