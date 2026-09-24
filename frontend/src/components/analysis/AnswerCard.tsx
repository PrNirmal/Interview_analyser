import type { EvidenceReference, InterviewQuestionAnswer } from "../../types/analysis";
import { evidenceLabel } from "../../lib/metrics";
import type { ResolvedEvidence } from "../../lib/evidence";
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

  return (
    <article className="answer">
      <button
        type="button"
        className="answer-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span>
          <span className="meta-label">{answer.question_id}</span>
          <span className="question-text">{answer.question}</span>
        </span>
        <span className="answer-meta">
          <span>{answer.confidence}</span>
          <span>{evidenceLabel(answer.evidence.length)}</span>
        </span>
      </button>
      {open ? (
        <div id={panelId} className="answer-body">
          <h3 className="meta-label">Answer</h3>
          <p className="answer-text">{answer.answer}</p>
          <div className="answer-facts">
            <div>
              <h3 className="meta-label">Confidence</h3>
              <p className={`confidence confidence-${confidenceClass(answer.confidence)}`}>
                {answer.confidence}
              </p>
            </div>
            <div>
              <h3 className="meta-label">Evidence</h3>
              <p>{evidenceLabel(answer.evidence.length)}</p>
            </div>
          </div>
          {answer.evidence.length === 0 ? (
            <p className="inline-empty">No supporting evidence was returned for this answer.</p>
          ) : (
            <EvidencePreview
              preview={preview}
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
  onView,
}: {
  preview: EvidenceReference | undefined;
  onView: () => void;
}) {
  if (!preview) return null;
  return (
    <div className="evidence-preview">
      <blockquote>{preview.quote}</blockquote>
      <Button type="button" variant="secondary" onClick={onView}>
        View evidence
      </Button>
    </div>
  );
}

function confidenceClass(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === "high" || normalized === "medium" || normalized === "low") return normalized;
  return "other";
}
