import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Users,
  FileQuestion,
  Layers,
  Quote,
  ArrowRight,
  FileText,
} from "lucide-react";
import { useAnalysis } from "../../context/AnalysisContext";
import { plural } from "../../lib/metrics";
import { isUploadedTranscript } from "../../lib/workspace";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { MetricCard } from "../ui/MetricCard";
import { ExpertCard } from "./ExpertCard";
import { ProgressState } from "./ProgressState";
import { TranscriptUpload } from "./TranscriptUpload";

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Interview Guide",
    desc: "Define questions and structured research topics",
    icon: FileText,
  },
  {
    step: "02",
    title: "Expert Interviews",
    desc: "Multi-market transcripts and key opinion leaders",
    icon: Users,
  },
  {
    step: "03",
    title: "AI Analysis",
    desc: "Evidence-backed synthesis and consensus mapping",
    icon: Sparkles,
  },
  {
    step: "04",
    title: "Evidence & Insights",
    desc: "Audit exact quotes, timestamps, and differences",
    icon: Layers,
  },
];

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
    addQuestion,
    removeQuestion,
    removeTranscript,
    run,
  } = useAnalysis();
  const [draftQuestion, setDraftQuestion] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const running = status === "running";
  const selectedCount = selectedIds.size;
  const analyzedIds = new Set(
    session?.transcripts.map((item) => item.transcriptId) ?? []
  );

  function onAddQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addQuestion(draftQuestion);
    setDraftQuestion("");
  }

  const scrollToInterviews = () => {
    document.getElementById("interviews-heading")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="page workspace-page">
      {/* HERO HEADER */}
      <div className="workspace-hero">
        <div className="workspace-hero-top">
          <div className="workspace-hero-text">
            <span className="kicker">Interview Intelligence</span>
            <h1 className="workspace-title">Analyze Interviews</h1>
            <p className="lede">
              Analyze expert interviews against your interview guide and uncover cross-market insights.
            </p>
          </div>

          <div className="workspace-hero-actions">
            <div className="selection-badge-wrap">
              <span className="selection-count">
                {selectedCount === 0
                  ? "No interviews selected"
                  : `${plural(selectedCount, "interview")} selected`}
              </span>
            </div>
            <div className="hero-buttons-row">
              <Button
                type="button"
                variant="secondary"
                onClick={scrollToInterviews}
                disabled={running}
              >
                Add Interview
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => void run()}
                disabled={running || selectedCount === 0 || guideQuestionCount === 0}
              >
                {running ? "Running analysis" : "Run Analysis"}
              </Button>
            </div>
          </div>
        </div>

        {/* COMPACT METRIC CARDS STRIP */}
        <div className="summary-metrics-strip" aria-label="Workspace metrics summary">
          <MetricCard
            label="INTERVIEWS"
            value={String(transcripts.length).padStart(2, "0")}
            subtext={`${selectedCount} selected for run`}
            icon={<Users size={16} />}
          />
          <MetricCard
            label="QUESTIONS"
            value={String(guideQuestionCount).padStart(2, "0")}
            subtext="Research guide questions"
            icon={<FileQuestion size={16} />}
          />
          <MetricCard
            label="INSIGHTS"
            value={session ? String(session.result.cross_analysis.common_themes.length + session.result.cross_analysis.differences.length).padStart(2, "0") : "12"}
            subtext="Cross-expert themes"
            icon={<Layers size={16} />}
          />
          <MetricCard
            label="EVIDENCE"
            value={session ? String(session.result.experts.reduce((acc, e) => acc + e.answers.reduce((a, ans) => a + ans.evidence.length, 0), 0)).padStart(2, "0") : "24"}
            subtext="Verified quote citations"
            icon={<Quote size={16} />}
          />
        </div>
      </div>

      {running ? (
        <ProgressState label={progressLabel || "Preparing interviews..."} />
      ) : null}

      {/* ANALYSIS WORKFLOW CARD */}
      <section className="section workflow-section" aria-labelledby="workflow-heading">
        <div className="workflow-card">
          <div className="workflow-card-head">
            <span className="meta-label">RESEARCH PIPELINE</span>
            <h2 id="workflow-heading" className="workflow-title">
              Analysis workflow
            </h2>
          </div>

          <div className="workflow-steps-track">
            {WORKFLOW_STEPS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="workflow-step-item">
                  <div className="step-num-badge">
                    <span>{s.step}</span>
                  </div>
                  <div className="step-main">
                    <div className="step-header">
                      <Icon size={15} className="step-icon" />
                      <h4>{s.title}</h4>
                    </div>
                    <p className="step-desc">{s.desc}</p>
                  </div>
                  {idx < WORKFLOW_STEPS.length - 1 ? (
                    <div className="step-connector" aria-hidden="true">
                      <ArrowRight size={14} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* RECENT ACTIVITY SECTION (if session exists) */}
      {session ? (
        <section className="section recent-activity-section" aria-labelledby="activity-heading">
          <div className="section-heading">
            <h2 id="activity-heading">Recent activity</h2>
            <Link to="/analysis" className="section-action-link">
              <span>View full analysis</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="activity-list">
            {session.transcripts.map((item) => (
              <div key={item.transcriptId} className="activity-row">
                <div className="activity-main">
                  <h4>{item.expert}</h4>
                  <p className="quiet">
                    {item.role || "Expert"} · {item.market}
                  </p>
                </div>
                <div className="activity-meta">
                  <Badge tone="ready">Analysis completed</Badge>
                  <span className="quiet">
                    {guideQuestionCount} questions · {plural(session.result.experts.find((e) => e.transcript_id === item.transcriptId)?.answers.reduce((acc, a) => acc + a.evidence.length, 0) ?? 4, "evidence point")}
                  </span>
                  <Link
                    to={`/analysis#${item.transcriptId}`}
                    className="button button-secondary button-sm"
                  >
                    View analysis
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* INTERVIEW GUIDE SECTION */}
      <section className="section" aria-labelledby="guide-heading">
        <div className="section-heading">
          <h2 id="guide-heading">Interview Guide</h2>
          <span className="section-count-tag">
            {guideQuestionCount} {guideQuestionCount === 1 ? "question" : "questions"}
          </span>
        </div>

        <article className="guide-card">
          <div className="guide-card-header">
            <div>
              <p className="filename">{guideFilename}</p>
              <h3>{guideTitle}</h3>
              <p className="quiet">
                {guideQuestionCount} {guideQuestionCount === 1 ? "question" : "questions"}
              </p>
            </div>
            <Badge tone="ready">Ready</Badge>
          </div>

          {guideQuestionCount === 0 ? (
            <p className="inline-empty guide-empty">
              Add at least one question before running analysis.
            </p>
          ) : (
            <ol className="guide-questions">
              {guideQuestions.map((question, index) => (
                <li key={`${index}-${question}`} className="guide-question-item">
                  <div className="question-item-text">
                    <span className="question-item-index">{String(index + 1).padStart(2, "0")}</span>
                    <span>{question}</span>
                  </div>
                  <button
                    type="button"
                    className="question-remove"
                    onClick={() => removeQuestion(index)}
                    disabled={running}
                    title="Remove question"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ol>
          )}

          <form className="question-composer" onSubmit={onAddQuestion}>
            <label className="field question-field" htmlFor="custom-question-input">
              <span className="sr-only">New question</span>
              <input
                id="custom-question-input"
                className="field-input"
                value={draftQuestion}
                onChange={(event) => setDraftQuestion(event.target.value)}
                placeholder="Add a custom question to the interview guide..."
                disabled={running}
              />
            </label>
            <Button
              type="submit"
              variant="secondary"
              disabled={running || draftQuestion.trim() === ""}
            >
              Add question
            </Button>
          </form>
        </article>
      </section>

      {/* EXPERT INTERVIEWS SECTION */}
      <section className="section" id="interviews-section" aria-labelledby="interviews-heading">
        <div className="section-heading">
          <div>
            <h2 id="interviews-heading">Expert Interviews</h2>
            <p className="section-subtitle">
              Select expert transcripts to analyze against the interview guide.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowUpload(!showUpload)}
          >
            {showUpload ? "Hide upload form" : "+ Upload new transcript"}
          </Button>
        </div>

        {showUpload ? (
          <TranscriptUpload
            className="mb-4"
            onSuccess={() => setShowUpload(false)}
          />
        ) : null}

        {transcripts.length === 0 ? (
          <p className="inline-empty" role="status">
            No expert interviews have been added yet.
          </p>
        ) : null}

        <div className="expert-grid">
          {transcripts.map((transcript) => {
            const uploaded = isUploadedTranscript(transcript);
            const analyzedExpert = session?.result.experts.find(
              (e) => e.transcript_id === transcript.transcriptId
            );

            return (
              <ExpertCard
                key={transcript.transcriptId}
                transcript={transcript}
                selected={selectedIds.has(transcript.transcriptId)}
                analyzed={analyzedIds.has(transcript.transcriptId)}
                uploaded={uploaded}
                answerCount={analyzedExpert?.answers.length}
                evidenceCount={analyzedExpert?.answers.reduce(
                  (acc, a) => acc + a.evidence.length,
                  0
                )}
                onToggle={toggleTranscript}
                onRemove={uploaded ? removeTranscript : undefined}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
