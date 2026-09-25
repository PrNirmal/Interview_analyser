import { ChevronDown, ChevronUp, Quote } from "lucide-react";
import type { EvidenceReference, InterviewQuestionAnswer } from "../../types/analysis";
import { evidenceLabel } from "../../lib/metrics";
import type { ResolvedEvidence } from "../../lib/evidence";
import { answerIsUsable, displayQuote } from "../../lib/preferences";
import { usePreferences } from "../../context/PreferencesContext";
import { Button } from "../ui/Button";

interface AnswerCardProps {
  expert: string;
  role: string;
  market: string;
  answer: InterviewQuestionAnswer;
  open: boolean;
  onToggle: () => void;
  onViewEvidence: (evidence: ResolvedEvidence) => void;
}

export function AnswerCard({
  expert,
  role,
  market,
  answer,
  open,
  onToggle,
  onViewEvidence,
}: AnswerCardProps) {
  const preview = answer.evidence[0];
  const panelId = `answer-${answer.question_id}`;
  const { preferences } = usePreferences();
  const usable = answerIsUsable(answer.confidence, preferences.minimumConfidence);

  return (
    <article className={`answer-card-item ${open ? "is-open" : ""} ${usable ? "" : "is-below-minimum"}`}>
      <button
        type="button"
        className="answer-card-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <div className="answer-toggle-main">
          <span className="q-tag-chip">{answer.question_id}</span>
          <span className="q-title-text">{answer.question}</span>
        </div>
        <div className="answer-toggle-meta">
          <span className={`confidence-badge confidence-${confidenceClass(answer.confidence)}`}>
            {answer.confidence}
          </span>
          {usable ? null : <span className="below-minimum-note">Below minimum</span>}
          <span className="evidence-badge-quiet">{evidenceLabel(answer.evidence.length)}</span>
          <span className="toggle-chevron" aria-hidden="true">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </button>

      {open ? (
        <div id={panelId} className="answer-card-body">
          <div className="answer-section-block">
            <h3 className="meta-label">Synthesized response</h3>
            <p className="answer-text">{answer.answer}</p>
          </div>

          <div className="answer-facts-grid">
            <div className="fact-box">
              <span className="meta-label">Confidence score</span>
              <p className={`confidence-pill confidence-${confidenceClass(answer.confidence)}`}>
                {answer.confidence}
              </p>
            </div>
            <div className="fact-box">
              <span className="meta-label">Supporting evidence</span>
              <p className="fact-bold">{evidenceLabel(answer.evidence.length)}</p>
            </div>
          </div>

          {answer.evidence.length === 0 ? (
            <p className="inline-empty">No supporting evidence was returned for this answer.</p>
          ) : (
            <EvidencePreview
              preview={preview}
              showTimestamp={preferences.showTimestamps}
              quoteLength={preferences.quoteLength}
              onView={() =>
                onViewEvidence({
                  expert,
                  role,
                  market,
                  questionId: answer.question_id,
                  question: answer.question,
                  items: answer.evidence,
                  index: 0,
                })
              }
            />
          )}
        </div>
      ) : null}
    </article>
  );
}

function EvidencePreview({
  preview,
  showTimestamp,
  quoteLength,
  onView,
}: {
  preview: EvidenceReference | undefined;
  showTimestamp: boolean;
  quoteLength: "short" | "medium" | "full";
  onView: () => void;
}) {
  if (!preview) return null;
  return (
    <div className="evidence-preview-callout">
      <div className="preview-quote-head">
        <Quote size={14} className="preview-quote-icon" />
        <span className="meta-label">Exact supporting quote</span>
        {showTimestamp ? <span className="timestamp-pill">{preview.timestamp}</span> : null}
      </div>
      <blockquote className="preview-quote-body">"{displayQuote(preview.quote, quoteLength)}"</blockquote>
      <div className="preview-quote-actions">
        <Button type="button" variant="secondary" size="sm" onClick={onView}>
          View evidence
        </Button>
      </div>
    </div>
  );
}

function confidenceClass(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === "high" || normalized === "medium" || normalized === "low") return normalized;
  return "other";
}
