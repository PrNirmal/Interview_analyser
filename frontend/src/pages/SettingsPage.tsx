import { useEffect, useState } from "react";
import { healthCheck } from "../api/analysis";
import { AnalysisHeader } from "../components/analysis/AnalysisHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAnalysis } from "../context/AnalysisContext";
import { usePreferences } from "../context/PreferencesContext";
import type { HealthResponse } from "../types/analysis";
import type { DisagreementMode, MinimumConfidence, QuoteLength } from "../lib/preferences";

export function SettingsPage() {
  const { preferences, updatePreferences } = usePreferences();
  const { health, clearSession, useBundledGuide, keepCustomGuide, resetWorkspace } = useAnalysis();
  const [runtime, setRuntime] = useState<HealthResponse | null>(null);
  const [runtimeError, setRuntimeError] = useState(false);
  const [confirm, setConfirm] = useState<"session" | "workspace" | null>(null);

  useEffect(() => {
    let active = true;
    healthCheck()
      .then((result) => {
        if (!active) return;
        setRuntime(result);
        setRuntimeError(false);
      })
      .catch(() => {
        if (!active) return;
        setRuntime(null);
        setRuntimeError(true);
      });
    return () => {
      active = false;
    };
  }, [health]);

  const healthLabel =
    health === "ready" ? "API Ready" : health === "unavailable" ? "API Unavailable" : "Checking API...";

  return (
    <div className="page settings-page">
      <AnalysisHeader
        kicker="Workspace"
        title="Settings"
        subtitle="Preferences for this browser. The analysis service keeps model secrets in its own environment."
      />

      <div className="settings-stack">
        <Card className="settings-card">
          <div className="settings-card-head">
            <h2>Profile</h2>
            <p>Shown in the top bar for this workspace.</p>
          </div>
          <div className="settings-fields">
            <label className="form-group">
              <span className="field-label">Display name</span>
              <input
                className="field-input"
                value={preferences.displayName}
                maxLength={80}
                onChange={(event) => updatePreferences({ displayName: event.target.value })}
                onBlur={() => {
                  if (preferences.displayName.trim() === "") {
                    updatePreferences({ displayName: "Research Lead" });
                  }
                }}
              />
            </label>
            <label className="form-group">
              <span className="field-label">Role</span>
              <input
                className="field-input"
                value={preferences.role}
                maxLength={80}
                onChange={(event) => updatePreferences({ role: event.target.value })}
                onBlur={() => {
                  if (preferences.role.trim() === "") {
                    updatePreferences({ role: "Strategic Intelligence" });
                  }
                }}
              />
            </label>
            <label className="form-group">
              <span className="field-label">Initials</span>
              <input
                className="field-input"
                value={preferences.initials}
                maxLength={3}
                onChange={(event) =>
                  updatePreferences({
                    initials: event.target.value.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase(),
                  })
                }
              />
            </label>
            <label className="form-group">
              <span className="field-label">Workspace name</span>
              <input
                className="field-input"
                value={preferences.workspaceName}
                maxLength={80}
                onChange={(event) => updatePreferences({ workspaceName: event.target.value })}
                onBlur={() => {
                  if (preferences.workspaceName.trim() === "") {
                    updatePreferences({ workspaceName: "Research Team Workspace" });
                  }
                }}
              />
            </label>
          </div>
        </Card>

        <Card className="settings-card">
          <div className="settings-card-head">
            <h2>Analysis defaults</h2>
            <p>Applied the next time you run analysis from Overview.</p>
          </div>

          <fieldset className="setting-block">
            <legend>Interview guide</legend>
            <div className="choice-list">
              <Choice
                name="guide-source"
                checked={preferences.guideSource === "bundled"}
                onChange={() => {
                  useBundledGuide();
                }}
                label="Bundled European Robotic Surgery guide"
                hint="Replaces the question list with the case-study guide."
              />
              <Choice
                name="guide-source"
                checked={preferences.guideSource === "custom"}
                onChange={() => keepCustomGuide()}
                label="Custom guide saved in this browser"
                hint="Keeps the questions already stored on this machine."
              />
            </div>
          </fieldset>

          <label className="setting-row">
            <span>
              <span className="setting-label">Passages per question</span>
              <span className="setting-hint">
                How many transcript passages to retrieve for each guide question. Range is 1 to 20.
              </span>
            </span>
            <input
              className="field-input setting-number"
              type="number"
              min={1}
              max={20}
              step={1}
              aria-label="Passages per question"
              value={preferences.retrievalTopK}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (Number.isInteger(next) && next >= 1 && next <= 20) {
                  updatePreferences({ retrievalTopK: next });
                }
              }}
            />
          </label>

          <label className="choice">
            <input
              type="checkbox"
              checked={preferences.requireValidation}
              onChange={(event) => updatePreferences({ requireValidation: event.target.checked })}
            />
            <span>
              <span className="setting-label">Hold Insights until validation passes</span>
              <span className="setting-hint">
                Cross-interview themes stay hidden when a run fails evidence validation.
              </span>
            </span>
          </label>

          <fieldset className="setting-block">
            <legend>Minimum confidence</legend>
            <div className="choice-list">
              <ConfidenceChoice
                value="any"
                current={preferences.minimumConfidence}
                onChange={(minimumConfidence) => updatePreferences({ minimumConfidence })}
                label="Any confidence"
              />
              <ConfidenceChoice
                value="low"
                current={preferences.minimumConfidence}
                onChange={(minimumConfidence) => updatePreferences({ minimumConfidence })}
                label="Low and above"
              />
              <ConfidenceChoice
                value="medium"
                current={preferences.minimumConfidence}
                onChange={(minimumConfidence) => updatePreferences({ minimumConfidence })}
                label="Medium and above"
              />
              <ConfidenceChoice
                value="high"
                current={preferences.minimumConfidence}
                onChange={(minimumConfidence) => updatePreferences({ minimumConfidence })}
                label="High only"
              />
            </div>
            <p className="setting-hint">
              Answers below this level stay visible and are marked as below your minimum.
            </p>
          </fieldset>
        </Card>

        <Card className="settings-card">
          <div className="settings-card-head">
            <h2>Evidence display</h2>
            <p>Changes how quotes and disagreements are read. It does not change the analysis.</p>
          </div>

          <label className="choice">
            <input
              type="checkbox"
              checked={preferences.showTimestamps}
              onChange={(event) => updatePreferences({ showTimestamps: event.target.checked })}
            />
            <span>
              <span className="setting-label">Show timestamps on quotes</span>
            </span>
          </label>

          <fieldset className="setting-block">
            <legend>Quote length</legend>
            <div className="choice-list">
              <QuoteChoice
                value="short"
                current={preferences.quoteLength}
                onChange={(quoteLength) => updatePreferences({ quoteLength })}
                label="Short"
              />
              <QuoteChoice
                value="medium"
                current={preferences.quoteLength}
                onChange={(quoteLength) => updatePreferences({ quoteLength })}
                label="Medium"
              />
              <QuoteChoice
                value="full"
                current={preferences.quoteLength}
                onChange={(quoteLength) => updatePreferences({ quoteLength })}
                label="Full quote"
              />
            </div>
          </fieldset>

          <fieldset className="setting-block">
            <legend>Disagreements</legend>
            <div className="choice-list">
              <DisagreementChoice
                value="all"
                current={preferences.disagreementMode}
                onChange={(disagreementMode) => updatePreferences({ disagreementMode })}
                label="Show every disagreement"
              />
              <DisagreementChoice
                value="contradictions"
                current={preferences.disagreementMode}
                onChange={(disagreementMode) => updatePreferences({ disagreementMode })}
                label="Only when at least two experts take a position"
              />
            </div>
          </fieldset>
        </Card>

        <Card className="settings-card">
          <div className="settings-card-head">
            <h2>Data on this browser</h2>
            <p>History and the interview guide are stored in this browser, not on the analysis service.</p>
          </div>
          <div className="settings-actions">
            {confirm === "session" ? (
              <div className="confirm-row">
                <span>Clear the latest analysis in this tab?</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    clearSession();
                    setConfirm(null);
                  }}
                >
                  Clear session
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirm(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button type="button" variant="secondary" onClick={() => setConfirm("session")}>
                Clear analysis session
              </Button>
            )}

            {confirm === "workspace" ? (
              <div className="confirm-row">
                <span>Reset the guide and remove uploaded transcripts from this browser?</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    resetWorkspace();
                    setConfirm(null);
                  }}
                >
                  Reset workspace
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirm(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button type="button" variant="secondary" onClick={() => setConfirm("workspace")}>
                Reset guide and uploads
              </Button>
            )}
          </div>
          <p className="setting-hint">
            Uploaded transcript files stay on the machine running the API, under data/uploads/. Resetting here
            only removes them from this browser’s workspace list.
          </p>
        </Card>

        <Card className="settings-card">
          <div className="settings-card-head">
            <h2>Connection</h2>
            <p>Read-only. Change the model by editing the API environment, not this page.</p>
          </div>
          <dl className="connection-list">
            <div>
              <dt>API</dt>
              <dd>{healthLabel}</dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd className="mono">
                {runtime?.llm_provider && runtime.llm_model
                  ? `${runtime.llm_provider} · ${runtime.llm_model}`
                  : runtimeError
                    ? "Unavailable"
                    : "Not reported"}
              </dd>
            </div>
            <div>
              <dt>Embeddings</dt>
              <dd className="mono">
                {runtime?.embedding_provider && runtime.embedding_model
                  ? `${runtime.embedding_provider} · ${runtime.embedding_model}`
                  : runtimeError
                    ? "Unavailable"
                    : "Not reported"}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}

function Choice({
  name,
  checked,
  onChange,
  label,
  hint,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="choice">
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      <span>
        <span className="setting-label">{label}</span>
        {hint ? <span className="setting-hint">{hint}</span> : null}
      </span>
    </label>
  );
}

function ConfidenceChoice({
  value,
  current,
  onChange,
  label,
}: {
  value: MinimumConfidence;
  current: MinimumConfidence;
  onChange: (value: MinimumConfidence) => void;
  label: string;
}) {
  return (
    <label className="choice">
      <input
        type="radio"
        name="minimum-confidence"
        checked={current === value}
        onChange={() => onChange(value)}
      />
      <span className="setting-label">{label}</span>
    </label>
  );
}

function QuoteChoice({
  value,
  current,
  onChange,
  label,
}: {
  value: QuoteLength;
  current: QuoteLength;
  onChange: (value: QuoteLength) => void;
  label: string;
}) {
  return (
    <label className="choice">
      <input type="radio" name="quote-length" checked={current === value} onChange={() => onChange(value)} />
      <span className="setting-label">{label}</span>
    </label>
  );
}

function DisagreementChoice({
  value,
  current,
  onChange,
  label,
}: {
  value: DisagreementMode;
  current: DisagreementMode;
  onChange: (value: DisagreementMode) => void;
  label: string;
}) {
  return (
    <label className="choice">
      <input
        type="radio"
        name="disagreement-mode"
        checked={current === value}
        onChange={() => onChange(value)}
      />
      <span className="setting-label">{label}</span>
    </label>
  );
}
