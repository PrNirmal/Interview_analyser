interface AnalysisHeaderProps {
  title: string;
  subtitle: string;
  kicker?: string;
}

export function AnalysisHeader({ title, subtitle, kicker }: AnalysisHeaderProps) {
  return (
    <header className="page-header">
      <div>
        {kicker ? <p className="kicker">{kicker}</p> : null}
        <h1>{title}</h1>
        <p className="lede">{subtitle}</p>
      </div>
    </header>
  );
}
