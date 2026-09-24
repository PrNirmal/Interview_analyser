import { useAnalysis } from "../../context/AnalysisContext";
import { plural } from "../../lib/metrics";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { ExpertCard } from "./ExpertCard";
import { ProgressState } from "./ProgressState";

export function AnalysisWorkspace() {
  const {
    guideFilename,
    guideTitle,
    guideQuestionCount,
    guideQuestions,
    transcripts,
    selectedIds,
    status,
    progressLabel,
    session,
    toggleTranscript,
    run,
  } = useAnalysis();

  const running = status === "running";
  const selectedCount = selectedIds.size;
  const analyzedIds = new Set(session?.transcripts.map((item) => item.transcriptId) ?? []);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-split">
          <div>
            <h1>Analyze Interviews</h1>
          </div>
          <div className="header-actions">
            <p className="selection-count">
              {selectedCount === 0
                ? "No interviews selected"
                : `${plural(selectedCount, "interview")} selected`}
            </p>
            <Button type="button" onClick={() => void run()} disabled={running || selectedCount === 0}>
              {running ? "Running analysis" : "Run Analysis"}
            </Button>
          </div>
        </div>
        <p className="lede">
          Analyze expert interviews against your interview guide and uncover cross-market insights.
        </p>
      </div>

      {running ? <ProgressState label={progressLabel || "Preparing interviews..."} /> : null}

      <section className="section" aria-labelledby="guide-heading">
        <div className="section-heading">
          <h2 id="guide-heading">Interview Guide</h2>
        </div>
        <article className="guide-card">
          <div>
            <p className="filename">{guideFilename}</p>
            <h3>{guideTitle}</h3>
            <p className="quiet">
              {guideQuestionCount} {guideQuestionCount === 1 ? "question" : "questions"}
            </p>
          </div>
          <Badge tone="ready">Ready</Badge>
          <ol className="guide-questions">
            {guideQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </article>
      </section>

      <section className="section" aria-labelledby="interviews-heading">
        <div className="section-heading">
          <h2 id="interviews-heading">Expert Interviews</h2>
        </div>
        {selectedCount === 0 ? (
          <p className="inline-empty" role="status">
            No expert interviews have been added yet.
          </p>
        ) : null}
        <div className="expert-grid">
          {transcripts.map((transcript) => (
            <ExpertCard
              key={transcript.transcriptId}
              transcript={transcript}
              selected={selectedIds.has(transcript.transcriptId)}
              analyzed={analyzedIds.has(transcript.transcriptId)}
              onToggle={toggleTranscript}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
