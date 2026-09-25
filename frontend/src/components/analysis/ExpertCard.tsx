import { FileText, Check, Trash2 } from "lucide-react";
import type { TranscriptCatalogItem } from "../../data/catalog";
import { initials } from "../../lib/metrics";
import { Badge } from "../ui/Badge";

interface ExpertCardProps {
  transcript: TranscriptCatalogItem;
  selected: boolean;
  analyzed: boolean;
  uploaded?: boolean;
  answerCount?: number;
  evidenceCount?: number;
  onToggle: (transcriptId: string) => void;
  onRemove?: (transcriptId: string) => void;
}

export function ExpertCard({
  transcript,
  selected,
  analyzed,
  uploaded = false,
  answerCount,
  evidenceCount,
  onToggle,
  onRemove,
}: ExpertCardProps) {
  return (
    <div className={`expert-card-shell ${selected ? "is-selected" : ""}`}>
      <label className="expert-card-label" htmlFor={`chk-${transcript.transcriptId}`}>
        <div className="expert-card-select">
          <input
            id={`chk-${transcript.transcriptId}`}
            type="checkbox"
            className="sr-only-input"
            checked={selected}
            onChange={() => onToggle(transcript.transcriptId)}
            aria-label={`Select ${transcript.expert}`}
          />
          <span className={`custom-checkbox ${selected ? "is-checked" : ""}`} aria-hidden="true">
            {selected ? <Check size={13} strokeWidth={2.5} /> : null}
          </span>
        </div>

        <div className="avatar-wrap">
          <span className="avatar avatar-md" aria-hidden="true">
            {initials(transcript.expert)}
          </span>
        </div>

        <div className="expert-card-main">
          <div className="expert-title-line">
            <h3 className="expert-name">{transcript.expert}</h3>
            <span className="expert-market-tag">{transcript.market}</span>
          </div>

          <p className="expert-role">{transcript.role}</p>

          <div className="expert-card-file">
            <FileText size={13} className="file-icon" />
            <span className="filename">{transcript.filename}</span>
          </div>

          {analyzed && answerCount !== undefined ? (
            <div className="expert-stats-line">
              <span className="stat-item">
                <strong>{answerCount}</strong> questions analyzed
              </span>
              {evidenceCount !== undefined ? (
                <>
                  <span className="stat-separator">•</span>
                  <span className="stat-item">
                    <strong>{evidenceCount}</strong> evidence quotes
                  </span>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="expert-card-status">
          {analyzed ? (
            <Badge tone="info" dot>Analyzed</Badge>
          ) : uploaded ? (
            <Badge tone="ready" dot>Uploaded</Badge>
          ) : (
            <Badge tone="ready" dot>Ready</Badge>
          )}
        </div>
      </label>

      {onRemove ? (
        <button
          type="button"
          className="card-remove-btn"
          title={`Remove ${transcript.expert}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(transcript.transcriptId);
          }}
          aria-label={`Remove transcript for ${transcript.expert}`}
        >
          <Trash2 size={14} />
          <span>Remove</span>
        </button>
      ) : null}
    </div>
  );
}
