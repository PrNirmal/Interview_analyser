import { useEffect, useState } from "react";
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
    <section className="section" aria-labelledby="experts-heading">
      <div className="section-heading">
        <h2 id="experts-heading">Experts</h2>
      </div>
      <div className="expert-list">
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
      initial[questionKey(answer.question_id, index)] = index === 0;
    });
    return initial;
  });
  const panelId = `expert-${expert.transcript_id}`;

  return (
    <article className="expert-panel" id={expert.transcript_id}>
      <button
        type="button"
        className="expert-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="avatar" aria-hidden="true">
          {initials(expert.expert)}
        </span>
        <span className="expert-toggle-text">
          <span className="expert-name">{expert.expert}</span>
          <span className="expert-role">
            {expert.role} · {expert.market}
          </span>
        </span>
        <span className="quiet">
          {expert.answers.length} {expert.answers.length === 1 ? "answer" : "answers"}
        </span>
      </button>
      {open ? (
        <div id={panelId} className="expert-panel-body">
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
      ) : null}
    </article>
  );
}

function questionKey(questionId: string, index: number): string {
  return `${questionId}-${index}`;
}
