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
        <div>
          <span className="kicker">Detailed Stances</span>
          <h2 id="positions-heading">Expert Positions</h2>
          <p className="section-subtitle">
            Individual viewpoints, policy statements, and clinical stances extracted by topic.
          </p>
        </div>
      </div>

      {!hasPositions ? (
        <EmptyState
          title="No expert positions"
          description="No expert positions were returned in the cross-expert analysis."
        />
      ) : (
        <div className="positions-stack">
          {groups.map((group) =>
            group.positions.length === 0 ? null : (
              <article key={`${group.source}-${group.topic}`} className="position-group-card">
                <div className="position-group-header">
                  <span className="source-tag">{group.source}</span>
                  <h3 className="group-topic-title">{group.topic}</h3>
                </div>

                <div className="position-grid">
                  {group.positions.map((position) => (
                    <div
                      key={`${group.source}-${group.topic}-${position.expert}-${position.market}`}
                      className="position-cell"
                    >
                      <div className="position-cell-top">
                        <span className="market-badge">{position.market}</span>
                        <span className="expert-name-sub">{position.expert}</span>
                      </div>

                      <div className="position-quote-block">
                        <p className="position-text">"{position.position}"</p>
                      </div>

                      <div className="position-cell-foot">
                        <span className="evidence-ref-label">Evidence references</span>
                        <SegmentLinks ids={position.evidence_segment_ids} onSegment={onSegment} />
                      </div>
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
