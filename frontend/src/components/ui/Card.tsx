import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "muted" | "highlight" | "dashed";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
}

export function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`card card-${variant} card-pad-${padding} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
