import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button-${variant} button-${size} ${icon ? "has-icon" : ""} ${className}`.trim()}
      {...props}
    >
      {icon ? <span className="btn-icon">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}
