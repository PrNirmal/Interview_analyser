interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  radius?: string;
}

export function Skeleton({
  className = "",
  width,
  height,
  radius,
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius: radius,
      }}
      aria-hidden="true"
    />
  );
}

export function AnalysisSkeleton() {
  return (
    <div className="skeleton-workspace" aria-busy="true" aria-label="Loading analysis">
      <div className="skeleton-col">
        <Skeleton height="24px" width="120px" />
        <Skeleton height="40px" />
        <Skeleton height="40px" />
        <Skeleton height="40px" />
      </div>
      <div className="skeleton-col main">
        <Skeleton height="32px" width="80%" />
        <Skeleton height="120px" />
        <div style={{ display: "flex", gap: "8px" }}>
          <Skeleton height="28px" width="90px" radius="6px" />
          <Skeleton height="28px" width="90px" radius="6px" />
          <Skeleton height="28px" width="90px" radius="6px" />
        </div>
        <Skeleton height="80px" />
      </div>
      <div className="skeleton-col">
        <Skeleton height="24px" width="140px" />
        <Skeleton height="140px" />
        <Skeleton height="140px" />
      </div>
    </div>
  );
}
