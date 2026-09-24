import type { ExpertPosition } from "../../types/analysis";
import { EmptyState } from "../ui/EmptyState";
import { SegmentLinks } from "./SegmentLinks";

export interface PositionGroup {
  source: string;
  topic: string;
  positions: ExpertPosition[];
}

interface ExpertPositionsProps {
  groups: PositionGroup[];
  onSegment: (segmentId: string) => void;
}

export function ExpertPositions({ groups, onSegment }: ExpertPositionsProps) {
  const hasPositions = groups.some((group) => group.positions.length > 0);

  return (
    <section className="section" id="expert-positions" aria-labelledby="positions-heading">
      <div className="section-heading">
        <h2 id="positions-heading">Expert Positions</h2>
      </div>
      {!hasPositions ? (
        <EmptyState
          title="No expert positions"
          description="No expert positions were returned in the cross-expert analysis."
        />
      ) : (
        <div className="stack">
          {groups.map((group) =>
            group.positions.length === 0 ? null : (
              <article key={`${group.source}-${group.topic}`} className="insight-card">
                <p className="meta-label">{group.source}</p>
                <h3>{group.topic}</h3>
                <div className="position-grid">
                  {group.positions.map((position) => (
                    <div
                      key={`${group.source}-${group.topic}-${position.expert}-${position.market}`}
                      className="position-cell"
                    >
                      <p className="market">{position.market}</p>
                      <p className="quiet">{position.expert}</p>
                      <p className="meta-label">Position</p>
                      <p>{position.position}</p>
                      <p className="meta-label">Evidence</p>
                      <SegmentLinks ids={position.evidence_segment_ids} onSegment={onSegment} />
                    </div>
                  ))}
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </section>
  );
}
