import { useState, type FormEvent } from "react";
import { Sparkles, AlertCircle } from "lucide-react";
import { askAcrossInterviews } from "../../api/analysis";
import { ApiError, userFacingError } from "../../api/errors";
import { useAnalysis } from "../../context/AnalysisContext";
import { usePreferences } from "../../context/PreferencesContext";
import type { TranscriptCatalogItem } from "../../data/catalog";
import { answerIsUsable, displayQuote } from "../../lib/preferences";
import type { AnalysisSession } from "../../lib/session";
import type { AskAcrossInterviewsResponse, TranscriptRequest } from "../../types/analysis";
import { Button } from "../ui/Button";

function transcriptsForQuestion(
  session: AnalysisSession,
  catalog: readonly TranscriptCatalogItem[],
): TranscriptRequest[] | null {
  const transcripts = session.transcripts.map((item) => {
    const match = catalog.find((entry) => entry.transcriptId === item.transcriptId);
    return {
      transcript_id: item.transcriptId,
      expert: item.expert,
      role: item.role || match?.role || "",
      market: item.market,
      file_path: item.filePath || match?.filePath || "",
    };
  });
  if (transcripts.some((item) => item.role === "" || item.file_path === "")) return null;
  return transcripts;
}

export function AskAcrossInterviews() {
  const { session, transcripts, openEvidence } = useAnalysis();
  const { preferences } = usePreferences();
  const [question, setQuestion] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [result, setResult] = useState<AskAcrossInterviewsResponse | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session || pending) return;
    const requestTranscripts = transcriptsForQuestion(session, transcripts);
    if (!requestTranscripts) {
      setResult(null);
      setNotice("Run the analysis again so this question can use the interview files.");
      return;
    }

    setPending(true);
    setNotice(null);
    setResult(null);
    try {
      const answer = await askAcrossInterviews({
        question,
        transcripts: requestTranscripts,
      });
      setResult(answer);
    } catch (caught) {
      const error =
        caught instanceof ApiError
          ? caught
          : new ApiError(0, "NETWORK_ERROR", "The analysis service could not be reached.");
      if (error.status === 400) {
        setNotice(error.message);
      } else {
        const message = userFacingError(error);
        setNotice(`${message.title} ${message.description}`.trim());
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="section" id="ask" aria-labelledby="ask-heading">
      <div className="section-heading">
        <div>
          <span className="kicker">Natural Language Exploration</span>
          <h2 id="ask-heading">Ask across interviews</h2>
          <p className="section-subtitle">
            Query across all analyzed transcripts to surface targeted answers, synthesized findings, and supporting quotes.
          </p>
        </div>
      </div>

      <div className="ask-card">
        <form className="ask-form" onSubmit={(event) => void onSubmit(event)}>
          <label htmlFor="ask-question" className="sr-only">
            Ask across interviews
          </label>
          <div className="ask-input-wrap">
            <textarea
              id="ask-question"
              name="question"
              rows={3}
              className="ask-textarea"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="e.g. Which market has the longest adoption timeline and what are the main reasons?"
              disabled={!session || pending}
            />
          </div>

          <div className="ask-bar-footer">
            <p className="quiet ask-scope-hint">
              {session
                ? "Answers are synthesized with citations directly from the transcripts in this analysis session."
                : "Run an analysis before asking across interviews."}
            </p>
            <Button
              type="submit"
              variant="primary"
              disabled={!session || pending || question.trim() === ""}
              icon={pending ? undefined : <Sparkles size={14} />}
            >
              {pending ? "Asking..." : "Ask Question"}
            </Button>
          </div>

          {notice ? (
            <div className="ask-notice" role="alert">
              <AlertCircle size={15} />
              <span>{notice}</span>
            </div>
          ) : null}

          {result ? (
            <div className="ask-result-box" role="status">
              <div className="ask-result-header">
                <div className="synthesis-badge">
                  <Sparkles size={13} />
                  <span>SYNTHESIZED ANSWER</span>
                </div>
                <span className="confidence-pill confidence-high">
                  Confidence: {result.confidence}
                </span>
                {answerIsUsable(result.confidence, preferences.minimumConfidence) ? null : (
                  <span className="below-minimum-note">Below minimum</span>
                )}
              </div>

              <h3 className="meta-label">Answer</h3>
              <p className="answer-text result-body-text">{result.answer}</p>

              {result.evidence.length === 0 ? (
                <p className="inline-empty">No supporting quote was returned for this answer.</p>
              ) : (
                <div className="ask-evidence-section">
                  <h4 className="meta-label">Supporting Evidence & Quotes</h4>
                  <div className="ask-evidence-grid">
                    {result.evidence.map((item, index) => {
                      const speaker = item.expert || item.speaker;
                      const label = [speaker, item.market].filter(Boolean).join(" · ");
                      return (
                        <div className="ask-evidence-card" key={`${item.segment_id}-${index}`}>
                          <div className="ask-evidence-meta-row">
                            {label ? <strong className="meta-label">{label}</strong> : null}
                            {preferences.showTimestamps ? (
                              <span className="timestamp-badge">{item.timestamp}</span>
                            ) : null}
                          </div>
                          <blockquote className="ask-evidence-quote">
                            "{displayQuote(item.quote, preferences.quoteLength)}"
                          </blockquote>
                          <div className="ask-evidence-foot">
                            <span className="mono segment-tag">{item.segment_id}</span>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                openEvidence({
                                  expert: item.expert || speaker || "Interview",
                                  role: item.role,
                                  market: item.market,
                                  questionId: "Question",
                                  question: result.question,
                                  items: [item],
                                  index: 0,
                                })
                              }
                            >
                              View evidence
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}
