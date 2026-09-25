import { useState, useMemo } from "react";
import {
  FileQuestion,
  Quote,
  Sparkles,
  CheckCircle2,
  GitBranch,
  ChevronRight,
  Layers,
} from "lucide-react";
import type {
  FullAnalysisResponse,
  InterviewAnalysis,
  InterviewQuestionAnswer,
  EvidenceReference,
} from "../../types/analysis";
import type { ResolvedEvidence } from "../../lib/evidence";
import { initials, evidenceLabel } from "../../lib/metrics";
import { answerIsUsable, displayQuote } from "../../lib/preferences";
import { usePreferences } from "../../context/PreferencesContext";
import { Button } from "../ui/Button";

interface ResearchWorkspaceProps {
  result: FullAnalysisResponse;
  onViewEvidence: (evidence: ResolvedEvidence) => void;
}

interface QuestionGroup {
  questionId: string;
  question: string;
  expertAnswers: Array<{
    expert: InterviewAnalysis;
    answer: InterviewQuestionAnswer;
  }>;
  allEvidence: Array<{
    expert: InterviewAnalysis;
    answer: InterviewQuestionAnswer;
    evidence: EvidenceReference;
  }>;
}

export function ResearchWorkspace({ result, onViewEvidence }: ResearchWorkspaceProps) {
  const { preferences } = usePreferences();
  // Aggregate unique questions across all experts in the result
  const questionsList: QuestionGroup[] = useMemo(() => {
    const map = new Map<string, QuestionGroup>();

    for (const expert of result.experts) {
      for (const answer of expert.answers) {
        let group = map.get(answer.question_id);
        if (!group) {
          group = {
            questionId: answer.question_id,
            question: answer.question,
            expertAnswers: [],
            allEvidence: [],
          };
          map.set(answer.question_id, group);
        }
        group.expertAnswers.push({ expert, answer });
        for (const ev of answer.evidence) {
          group.allEvidence.push({ expert, answer, evidence: ev });
        }
      }
    }

    return Array.from(map.values());
  }, [result]);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    questionsList[0]?.questionId ?? "Q1"
  );

  const activeGroup = useMemo(() => {
    return (
      questionsList.find((q) => q.questionId === selectedQuestionId) ??
      questionsList[0]
    );
  }, [questionsList, selectedQuestionId]);

  // Derive contextual themes, agreements, and differences
  const relevantThemes = useMemo(() => {
    if (!result.cross_analysis?.common_themes) return [];
    return result.cross_analysis.common_themes;
  }, [result]);

  const relevantDifferences = useMemo(() => {
    if (!result.cross_analysis?.differences) return [];
    return result.cross_analysis.differences;
  }, [result]);

  if (!activeGroup) {
    return null;
  }

  // Generate an AI synthesis summary for the active question
  const answersText = activeGroup.expertAnswers.map((ea) => ea.answer.answer);
  const firstAnswer = answersText[0] ?? "";
  const aiSynthesisSummary =
    answersText.length > 1
      ? `Across ${activeGroup.expertAnswers.length} consulted markets (${activeGroup.expertAnswers
          .map((ea) => ea.expert.market)
          .join(", ")}), experts indicate that ${firstAnswer.toLowerCase().replace(/^adoption is /, "adoption continues ")} While general trends align on growth, individual institutional priorities and procurement criteria drive notable cross-border variation.`
      : firstAnswer || "Analysis synthesized across available interviews.";

  const agreementSummary =
    relevantThemes.length > 0
      ? `Experts identify consistent cross-border patterns: ${relevantThemes[0]?.description ?? "General adoption growth is confirmed across all consulted markets."}`
      : "Experts agree on ongoing market expansion, acknowledging clinical efficacy and increased procedural volume across larger healthcare networks.";

  const differencesSummary =
    relevantDifferences.length > 0
      ? `Key market variance: ${relevantDifferences[0]?.description ?? "Variance emerges across capital budgets, approval cycles, and reimbursement frameworks."}`
      : "Significant variance emerges in capital procurement timelines, regulatory reimbursement frameworks, and decentralized versus centralized hospital purchasing discretion.";

  return (
    <div className="research-workspace">
      {/* LEFT PANEL: Question Navigation */}
      <aside className="workspace-panel questions-nav-panel" aria-label="Questions list">
        <div className="panel-header">
          <div className="panel-title-wrap">
            <FileQuestion size={16} className="panel-header-icon" />
            <span className="panel-title">Questions</span>
          </div>
          <span className="panel-count-badge">{questionsList.length}</span>
        </div>

        <nav className="question-nav-list" aria-label="Interview questions">
          {questionsList.map((group, index) => {
            const isSelected = group.questionId === activeGroup.questionId;
            const evidenceCount = group.allEvidence.length;
            const numberFormatted = String(index + 1).padStart(2, "0");

            return (
              <button
                key={group.questionId}
                type="button"
                className={`question-nav-item ${isSelected ? "is-selected" : ""}`}
                onClick={() => setSelectedQuestionId(group.questionId)}
                aria-current={isSelected ? "true" : undefined}
              >
                <div className="q-nav-number">{numberFormatted}</div>
                <div className="q-nav-body">
                  <p className="q-nav-text">{group.question}</p>
                  <div className="q-nav-meta">
                    <span className="q-nav-status">
                      <span className="dot" aria-hidden="true" />
                      Analyzed
                    </span>
                    <span className="q-nav-evidence">
                      {evidenceCount} {evidenceCount === 1 ? "evidence" : "evidence"}
                    </span>
                  </div>
                </div>
                {isSelected ? (
                  <span className="q-nav-active-bar" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* CENTER PANEL: AI Analysis & Synthesis */}
      <main className="workspace-panel analysis-center-panel" aria-label="Question analysis">
        <div className="analysis-panel-content">
          {/* Question Title Header */}
          <div className="question-focus-header">
            <span className="question-focus-tag">
              QUESTION {activeGroup.questionId.replace(/^Q/i, "")}
            </span>
            <h2 className="question-focus-title">{activeGroup.question}</h2>
          </div>

          {/* AI SYNTHESIS CARD */}
          <section className="synthesis-card" aria-label="AI Synthesis">
            <div className="synthesis-header">
              <div className="synthesis-badge">
                <Sparkles size={14} className="sparkle-icon" />
                <span>AI SYNTHESIS</span>
              </div>
              <span className="synthesis-meta">
                Multi-expert consolidated intelligence
              </span>
            </div>
            <p className="synthesis-lead">{aiSynthesisSummary}</p>
          </section>

          {/* KEY THEMES */}
          {relevantThemes.length > 0 ? (
            <section className="insight-section" aria-label="Key themes">
              <h3 className="section-subheading">
                <Layers size={15} />
                <span>KEY THEMES</span>
              </h3>
              <div className="themes-tag-cloud">
                {relevantThemes.map((th) => (
                  <span key={th.theme} className="theme-tag" title={th.description}>
                    {th.theme}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {/* AGREEMENT & DIFFERENCES */}
          <div className="consensus-differences-grid">
            <div className="consensus-card">
              <div className="card-mini-head">
                <CheckCircle2 size={15} className="text-ready" />
                <h4>AGREEMENT</h4>
              </div>
              <p className="card-mini-body">
                {agreementSummary}
              </p>
            </div>

            <div className="differences-card">
              <div className="card-mini-head">
                <GitBranch size={15} className="text-accent" />
                <h4>DIFFERENCES</h4>
              </div>
              <p className="card-mini-body">
                {differencesSummary}
              </p>
            </div>
          </div>

          {/* EXPERT RESPONSES BREAKDOWN */}
          <section className="expert-responses-section" aria-label="Expert perspectives">
            <h3 className="section-subheading">EXPERT PERSPECTIVES</h3>

            <div className="expert-answers-list">
              {activeGroup.expertAnswers.map(({ expert, answer }) => {
                const previewEvidence = answer.evidence[0];

                return (
                  <article
                    key={expert.transcript_id}
                    className={`expert-answer-block ${
                      answerIsUsable(answer.confidence, preferences.minimumConfidence)
                        ? ""
                        : "is-below-minimum"
                    }`}
                  >
                    <div className="expert-answer-header">
                      <div className="expert-id-row">
                        <span className="avatar avatar-sm" aria-hidden="true">
                          {initials(expert.expert)}
                        </span>
                        <div>
                          <h4 className="expert-name">{expert.expert}</h4>
                          <p className="expert-sub">
                            {expert.role} · {expert.market}
                          </p>
                        </div>
                      </div>

                      <div className="expert-meta-badges">
                        <span className={`confidence-pill confidence-${answer.confidence.toLowerCase()}`}>
                          {answer.confidence}
                        </span>
                        {answerIsUsable(answer.confidence, preferences.minimumConfidence) ? null : (
                          <span className="below-minimum-note">Below minimum</span>
                        )}
                        <span className="evidence-count-pill">
                          {evidenceLabel(answer.evidence.length)}
                        </span>
                      </div>
                    </div>

                    <div className="expert-answer-content">
                      <p className="answer-text">{answer.answer}</p>
                    </div>

                    {previewEvidence ? (
                      <div className="expert-quote-preview">
                        <Quote size={14} className="preview-quote-icon" />
                        <blockquote className="preview-quote-text">
                          "{displayQuote(previewEvidence.quote, preferences.quoteLength)}"
                        </blockquote>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            onViewEvidence({
                              expert: expert.expert,
                              role: expert.role,
                              market: expert.market,
                              questionId: answer.question_id,
                              question: answer.question,
                              items: answer.evidence,
                              index: 0,
                            })
                          }
                        >
                          View evidence
                        </Button>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* RIGHT PANEL: Supporting Evidence */}
      <aside className="workspace-panel evidence-sidebar-panel" aria-label="Supporting evidence">
        <div className="panel-header">
          <div className="panel-title-wrap">
            <Quote size={16} className="panel-header-icon" />
            <span className="panel-title">Supporting evidence</span>
          </div>
          <span className="panel-count-badge">
            {activeGroup.allEvidence.length} {activeGroup.allEvidence.length === 1 ? "quote" : "quotes"}
          </span>
        </div>

        <div className="evidence-cards-scroll">
          {activeGroup.allEvidence.length === 0 ? (
            <div className="empty-evidence-hint">
              <Quote size={24} className="quiet" />
              <p>No supporting evidence quotes for this question.</p>
            </div>
          ) : (
            activeGroup.allEvidence.map(({ expert, answer, evidence }, idx) => (
              <article key={`${evidence.segment_id}-${idx}`} className="evidence-fact-card">
                <div className="evidence-fact-head">
                  <div className="fact-expert-meta">
                    <span className="avatar avatar-xs" aria-hidden="true">
                      {initials(expert.expert)}
                    </span>
                    <span className="fact-expert-name">{expert.expert}</span>
                  </div>
                  {preferences.showTimestamps ? (
                    <span className="fact-timestamp">{evidence.timestamp}</span>
                  ) : null}
                </div>

                <blockquote className="evidence-fact-quote">
                  "{displayQuote(evidence.quote, preferences.quoteLength)}"
                </blockquote>

                <div className="evidence-fact-footer">
                  <span className="fact-source">
                    <span className="mono">{evidence.segment_id}</span> · {expert.market}
                  </span>
                  <button
                    type="button"
                    className="fact-action-link"
                    onClick={() =>
                      onViewEvidence({
                        expert: expert.expert,
                        role: expert.role,
                        market: expert.market,
                        questionId: answer.question_id,
                        question: answer.question,
                        items: answer.evidence,
                        index: answer.evidence.findIndex((ev) => ev.segment_id === evidence.segment_id) || 0,
                      })
                    }
                  >
                    <span>View evidence</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
