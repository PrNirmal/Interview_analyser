import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FileText, Trash2, ArrowUpRight } from "lucide-react";
import { TranscriptUpload } from "../components/analysis/TranscriptUpload";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAnalysis } from "../context/AnalysisContext";
import { initials } from "../lib/metrics";
import { isUploadedTranscript } from "../lib/workspace";

export function InterviewsPage() {
  const { transcripts, session, removeTranscript } = useAnalysis();
  const [showUpload, setShowUpload] = useState(false);

  const analyzed = new Map(
    session?.result.experts.map((expert) => [expert.transcript_id, expert]) ?? []
  );

  return (
    <div className="page interviews-page">
      <div className="interviews-header-row">
        <div>
          <span className="kicker">Interviews</span>
          <h1 className="page-main-title">Expert interviews</h1>
          <p className="lede">
            Manage the expert transcripts used in your analysis.
          </p>
        </div>

        <Button
          type="button"
          variant={showUpload ? "secondary" : "primary"}
          icon={<Plus size={16} />}
          onClick={() => setShowUpload(!showUpload)}
        >
          {showUpload ? "Close form" : "Add interview"}
        </Button>
      </div>

      {showUpload ? (
        <div className="interviews-upload-container">
          <TranscriptUpload onSuccess={() => setShowUpload(false)} />
        </div>
      ) : null}

      <div className="interview-research-list" aria-label="Expert transcripts list">
        {transcripts.map((transcript) => {
          const result = analyzed.get(transcript.transcriptId);
          const evidenceCount = result?.answers.reduce(
            (acc, a) => acc + a.evidence.length,
            0
          );

          return (
            <article key={transcript.transcriptId} className="interview-research-row">
              <div className="row-left">
                <span className="avatar avatar-md" aria-hidden="true">
                  {initials(transcript.expert)}
                </span>
                <div className="row-expert-details">
                  <div className="row-title-line">
                    <h2 className="expert-name-heading">{transcript.expert}</h2>
                    {result ? (
                      <Badge tone="info" dot>Analyzed</Badge>
                    ) : isUploadedTranscript(transcript) ? (
                      <Badge tone="ready" dot>Uploaded</Badge>
                    ) : (
                      <Badge tone="ready" dot>Ready</Badge>
                    )}
                  </div>
                  <p className="row-role-market">
                    {transcript.role} · <span className="market-text">{transcript.market}</span>
                  </p>
                  <p className="row-filename">
                    <FileText size={13} className="inline-file-icon" />
                    <span className="filename">{transcript.filename}</span>
                  </p>
                </div>
              </div>

              <div className="row-right">
                {result ? (
                  <div className="row-stats">
                    <span className="stat-bullet">
                      <strong>{result.answers.length}</strong> questions
                    </span>
                    <span className="stat-dot-sep">•</span>
                    <span className="stat-bullet">
                      <strong>{session?.result.cross_analysis.common_themes.length ?? 0}</strong> insights
                    </span>
                    <span className="stat-dot-sep">•</span>
                    <span className="stat-bullet">
                      <strong>{evidenceCount ?? 0}</strong> quotes
                    </span>
                  </div>
                ) : (
                  <div className="row-stats quiet">
                    <span>Ready for intelligence extraction</span>
                  </div>
                )}

                <div className="row-actions">
                  {result ? (
                    <Link
                      to={`/analysis#${transcript.transcriptId}`}
                      className="open-analysis-btn"
                    >
                      <span>Open</span>
                      <ArrowUpRight size={15} />
                    </Link>
                  ) : null}

                  {isUploadedTranscript(transcript) ? (
                    <button
                      type="button"
                      className="question-remove"
                      onClick={() => removeTranscript(transcript.transcriptId)}
                      title={`Remove ${transcript.expert}`}
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
