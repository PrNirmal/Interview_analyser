import { useEffect, useRef } from "react";
import { useAnalysis } from "../../context/AnalysisContext";
import { Button } from "../ui/Button";

export function EvidenceViewer() {
  const { evidence, closeEvidence, showEvidenceAt } = useAnalysis();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!evidence) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
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
    <div className="drawer-root">
      <button type="button" className="drawer-backdrop" aria-label="Close evidence" onClick={closeEvidence} />
      <div
        ref={dialogRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-heading"
      >
        <header className="drawer-header">
          <div>
            <p className="kicker">Evidence</p>
            <h2 id="evidence-heading">{evidence.expert}</h2>
            <p className="quiet">
              {evidence.role} · {evidence.market}
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={closeEvidence}>
            Close
          </Button>
        </header>

        <p className="drawer-question">{evidence.question}</p>

        <ol className="trace" aria-label="Evidence trace">
          <li>
            <span>Answer</span>
            <strong>{evidence.questionId}</strong>
          </li>
          <li>
            <span>Evidence</span>
            <strong>
              {evidence.index + 1} of {evidence.items.length}
            </strong>
          </li>
          <li>
            <span>Segment</span>
            <strong className="mono">{current.segment_id}</strong>
          </li>
          <li>
            <span>Timestamp</span>
            <strong className="mono">{current.timestamp}</strong>
          </li>
        </ol>

        <figure className="quote-block">
          <figcaption className="meta-label">Exact quote</figcaption>
          <blockquote>{current.quote}</blockquote>
        </figure>

        {current.question_id ? (
          <p className="quiet">
            Evidence question id <span className="mono">{current.question_id}</span>
          </p>
        ) : null}

        {evidence.items.length > 1 ? (
          <div className="drawer-nav">
            <Button
              type="button"
              variant="secondary"
              onClick={() => showEvidenceAt(evidence.index - 1)}
              disabled={evidence.index === 0}
            >
              Previous evidence
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => showEvidenceAt(evidence.index + 1)}
              disabled={evidence.index === evidence.items.length - 1}
            >
              Next evidence
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
