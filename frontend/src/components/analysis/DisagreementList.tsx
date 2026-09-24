import type { Disagreement } from "../../types/analysis";
import { EmptyState } from "../ui/EmptyState";
import { SegmentLinks } from "./SegmentLinks";

interface DisagreementListProps {
  disagreements: Disagreement[];
  onSegment: (segmentId: string) => void;
}

export function DisagreementList({ disagreements, onSegment }: DisagreementListProps) {
  return (
    <section className="section" id="disagreements" aria-labelledby="disagreements-heading">
      <div className="section-heading">
        <h2 id="disagreements-heading">Disagreements</h2>
      </div>
      {disagreements.length === 0 ? (
        <EmptyState
          title="No disagreements"
          description="No disagreements were identified in the returned analysis."
        />
      ) : (
        <div className="stack">
          {disagreements.map((item) => (
            <article key={item.topic} className="insight-card">
              <h3>{item.topic}</h3>
              <p>{item.description}</p>
              <div className="position-grid">
                {item.expert_positions.map((position) => (
                  <div key={`${item.topic}-${position.expert}-${position.market}`} className="position-cell">
                    <p className="market">{position.market}</p>
                    <p className="quiet">{position.expert}</p>
                    <p>{position.position}</p>
                    <SegmentLinks ids={position.evidence_segment_ids} onSegment={onSegment} />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
