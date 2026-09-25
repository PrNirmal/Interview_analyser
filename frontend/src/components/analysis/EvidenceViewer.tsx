import { useEffect, useRef } from "react";
import { X, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useAnalysis } from "../../context/AnalysisContext";
import { usePreferences } from "../../context/PreferencesContext";
import { displayQuote } from "../../lib/preferences";
import { Button } from "../ui/Button";

export function EvidenceViewer() {
  const { evidence, closeEvidence, showEvidenceAt } = useAnalysis();
  const { preferences } = usePreferences();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!evidence) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled"));

    focusable()[0]?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeEvidence();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [closeEvidence, evidence]);

  if (!evidence) return null;

  const current = evidence.items[evidence.index];
  if (!current) return null;

  return (
    <div className="drawer-root" role="presentation">
      <button
        type="button"
        className="drawer-backdrop"
        aria-label="Close evidence"
        onClick={closeEvidence}
      />
      <div
        ref={dialogRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-heading"
      >
        <header className="drawer-header">
          <div className="drawer-header-info">
            <span className="kicker">Verified Transcript Evidence</span>
            <h2 id="evidence-heading" className="drawer-expert-title">{evidence.expert}</h2>
            <p className="drawer-expert-sub quiet">
              {evidence.role} · <span className="market-highlight">{evidence.market}</span>
            </p>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={closeEvidence}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div className="drawer-question-box">
          <span className="drawer-question-label">INTERVIEW QUESTION</span>
          <p className="drawer-question-text">{evidence.question}</p>
        </div>

        {/* EVIDENCE TRACE METADATA STRIP */}
        <div className="drawer-trace-strip" aria-label="Evidence trace">
          <div className="trace-item">
            <span className="trace-label">Answer</span>
            <strong className="trace-val">{evidence.questionId}</strong>
          </div>
          <div className="trace-item">
            <span className="trace-label">Evidence</span>
            <strong className="trace-val">
              {evidence.index + 1} of {evidence.items.length}
            </strong>
          </div>
          <div className="trace-item">
            <span className="trace-label">Segment</span>
            <strong className="trace-val mono">{current.segment_id}</strong>
          </div>
          {preferences.showTimestamps ? (
            <div className="trace-item">
              <span className="trace-label">Timestamp</span>
              <strong className="trace-val mono">{current.timestamp}</strong>
            </div>
          ) : null}
        </div>

        {/* EXACT QUOTE BLOCK */}
        <figure className="drawer-quote-block">
          <div className="quote-badge-row">
            <Quote size={16} className="quote-lead-icon" />
            <figcaption className="meta-label">Exact quote from source transcript</figcaption>
          </div>
          <blockquote className="drawer-quote-text">
            {displayQuote(current.quote, preferences.quoteLength)}
          </blockquote>
        </figure>

        {current.question_id ? (
          <p className="drawer-meta-sub quiet">
            Linked question id: <span className="mono">{current.question_id}</span>
          </p>
        ) : null}

        {evidence.items.length > 1 ? (
          <div className="drawer-nav">
            <Button
              type="button"
              variant="secondary"
              icon={<ChevronLeft size={15} />}
              onClick={() => showEvidenceAt(evidence.index - 1)}
              disabled={evidence.index === 0}
            >
              Previous evidence
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => showEvidenceAt(evidence.index + 1)}
              disabled={evidence.index === 0 ? false : evidence.index === evidence.items.length - 1}
            >
              <span>Next evidence</span>
              <ChevronRight size={15} className="ml-1" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
