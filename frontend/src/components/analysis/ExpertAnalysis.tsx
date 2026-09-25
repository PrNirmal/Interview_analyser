import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAnalysis } from "../../context/AnalysisContext";
import type { ResolvedEvidence } from "../../lib/evidence";
import { initials } from "../../lib/metrics";
import type { InterviewAnalysis } from "../../types/analysis";
import { AnswerCard } from "./AnswerCard";

export function ExpertAnalysis() {
  const { session, openEvidence } = useAnalysis();
  const experts = session?.result.experts ?? [];
  const firstId = experts[0]?.transcript_id ?? null;
  const [openExpert, setOpenExpert] = useState<string | null>(firstId);

  useEffect(() => {
    setOpenExpert((current) => current ?? firstId);
  }, [firstId]);

  if (!session) return null;

  return (
    <section className="section expert-analysis-section" aria-labelledby="experts-heading">
      <div className="section-heading">
        <div>
          <span className="kicker">Individual Transcripts</span>
          <h2 id="experts-heading">Experts</h2>
          <p className="section-subtitle">
            Question-by-question responses extracted for each consulted specialist.
          </p>
        </div>
      </div>
      <div className="expert-panels-stack">
        {experts.map((expert) => (
          <ExpertPanel
            key={expert.transcript_id}
            expert={expert}
            open={openExpert === expert.transcript_id}
            onToggle={() =>
              setOpenExpert((current) =>
                current === expert.transcript_id ? null : expert.transcript_id,
              )
            }
            onViewEvidence={openEvidence}
          />
        ))}
      </div>
    </section>
  );
}

function ExpertPanel({
  expert,
  open,
  onToggle,
  onViewEvidence,
}: {
  expert: InterviewAnalysis;
  open: boolean;
  onToggle: () => void;
  onViewEvidence: (evidence: ResolvedEvidence) => void;
}) {
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    expert.answers.forEach((answer, index) => {
      initial[questionKey(answer.question_id, index)] = true;
    });
    return initial;
  });
  const panelId = `expert-${expert.transcript_id}`;

  return (
    <article className={`expert-panel-card ${open ? "is-expanded" : ""}`} id={expert.transcript_id}>
      <button
        type="button"
        className="expert-panel-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <div className="expert-panel-toggle-left">
          <span className="avatar avatar-md" aria-hidden="true">
            {initials(expert.expert)}
          </span>
          <div className="expert-info-block">
            <span className="expert-name-title">{expert.expert}</span>
            <span className="expert-role-sub">
              {expert.role} · <span className="market-highlight">{expert.market}</span>
            </span>
          </div>
        </div>

        <div className="expert-panel-toggle-right">
          <span className="badge badge-info">
            {expert.answers.length} {expert.answers.length === 1 ? "answer" : "answers"}
          </span>
          <span className="toggle-arrow" aria-hidden="true">
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </div>
      </button>

      {open ? (
        <div id={panelId} className="expert-panel-body">
          <div className="answers-accordion-list">
            {expert.answers.map((answer, index) => {
              const key = questionKey(answer.question_id, index);
              return (
                <AnswerCard
                  key={key}
                  expert={expert.expert}
                  role={expert.role}
                  market={expert.market}
                  answer={answer}
                  open={openQuestions[key] ?? false}
                  onToggle={() =>
                    setOpenQuestions((current) => ({
                      ...current,
                      [key]: !current[key],
                    }))
                  }
                  onViewEvidence={onViewEvidence}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function questionKey(questionId: string, index: number): string {
  return `${questionId}-${index}`;
}
