import type { TranscriptCatalogItem } from "../../data/catalog";
import { initials } from "../../lib/metrics";
import { Badge } from "../ui/Badge";

interface ExpertCardProps {
  transcript: TranscriptCatalogItem;
  selected: boolean;
  analyzed: boolean;
  onToggle: (transcriptId: string) => void;
}

export function ExpertCard({ transcript, selected, analyzed, onToggle }: ExpertCardProps) {
  return (
    <label className={`expert-card${selected ? " is-selected" : ""}`}>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(transcript.transcriptId)}
      />
      <span className="avatar" aria-hidden="true">
        {initials(transcript.expert)}
      </span>
      <span className="expert-card-body">
        <span className="market">{transcript.market}</span>
        <span className="expert-name">{transcript.expert}</span>
        <span className="expert-role">{transcript.role}</span>
        <span className="filename">{transcript.filename}</span>
        <span className="card-status">
          <span className="meta-label">Status</span>
          {analyzed ? <Badge tone="info">Analyzed</Badge> : <Badge tone="ready">Ready</Badge>}
        </span>
      </span>
    </label>
  );
}
