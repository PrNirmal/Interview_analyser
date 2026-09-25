import type { ReactNode } from "react";

export interface BadgeProps {
  tone?: "ready" | "neutral" | "warning" | "danger" | "info" | "purple";
  size?: "sm" | "md";
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({
  tone = "neutral",
  size = "md",
  dot = false,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span className={`badge badge-${tone} badge-${size} ${className}`.trim()}>
      {dot ? <span className="badge-dot" aria-hidden="true" /> : null}
      <span>{children}</span>
    </span>
  );
}
