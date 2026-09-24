import { Link } from "react-router-dom";
import { AnalysisHeader } from "../components/analysis/AnalysisHeader";
import { Badge } from "../components/ui/Badge";
import { useAnalysis } from "../context/AnalysisContext";
import { initials } from "../lib/metrics";

export function InterviewsPage() {
  const { transcripts, session } = useAnalysis();
  const analyzed = new Map(session?.result.experts.map((expert) => [expert.transcript_id, expert]) ?? []);

  return (
    <div className="page">
      <AnalysisHeader
        kicker="Interviews"
        title="Expert interviews"
        subtitle="The case-study transcripts available to the analysis API."
      />
      <div className="interview-list">
        {transcripts.map((transcript) => {
          const result = analyzed.get(transcript.transcriptId);
          return (
            <article key={transcript.transcriptId} className="interview-row">
              <span className="avatar" aria-hidden="true">
                {initials(transcript.expert)}
              </span>
              <div>
                <h2>{transcript.expert}</h2>
                <p className="quiet">
                  {transcript.role} · {transcript.market}
                </p>
                <p className="filename">{transcript.filename}</p>
              </div>
              <div className="interview-row-meta">
                {result ? (
                  <>
                    <Badge tone="info">Analyzed</Badge>
                    <p className="quiet">
                      {result.answers.length} {result.answers.length === 1 ? "answer" : "answers"}
                    </p>
                    <Link to={`/analysis#${transcript.transcriptId}`}>View analysis</Link>
                  </>
                ) : (
                  <Badge tone="ready">Ready</Badge>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
