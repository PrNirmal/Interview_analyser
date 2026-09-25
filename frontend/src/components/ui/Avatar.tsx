import { initials } from "../../lib/metrics";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const letters = initials(name);
  return (
    <span
      className={`avatar avatar-${size} ${className}`.trim()}
      aria-hidden="true"
      title={name}
    >
      {letters}
    </span>
  );
}
