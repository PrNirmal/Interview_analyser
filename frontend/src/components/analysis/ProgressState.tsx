interface ProgressStateProps {
  label: string;
}

export function ProgressState({ label }: ProgressStateProps) {
  return (
    <div className="progress" role="status" aria-live="polite">
      <div className="progress-track" aria-hidden="true">
        <div className="progress-bar" />
      </div>
      <p>{label}</p>
    </div>
  );
}
