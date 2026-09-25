import { AlertTriangle } from "lucide-react";
import type { Disagreement } from "../../types/analysis";
import { EmptyState } from "../ui/EmptyState";
import { SegmentLinks } from "./SegmentLinks";

interface DisagreementListProps {
  disagreements: Disagreement[];
  onSegment: (segmentId: string) => void;
  label?: string;
}

export function DisagreementList({
  disagreements,
  onSegment,
  label = "DIVERGENT VIEWPOINTS",
}: DisagreementListProps) {
  return (
    <section className="section" id="disagreements" aria-labelledby="disagreements-heading">
      <div className="section-heading">
        <div>
          <span className="kicker">Market Divergence</span>
          <h2 id="disagreements-heading">Disagreements</h2>
          <p className="section-subtitle">
            Contrasting perspectives, conflicting priorities, or contradictory findings identified across experts.
          </p>
        </div>
      </div>

      {disagreements.length === 0 ? (
        <EmptyState
          title="No disagreements"
          description="No disagreements were identified in the returned analysis."
        />
      ) : (
        <div className="disagreements-stack">
          {disagreements.map((item) => (
            <article key={item.topic} className="disagreement-card">
              <div className="disagreement-card-header">
                <div className="disagreement-badge">
                  <AlertTriangle size={13} className="text-warning" />
                  <span>{label}</span>
                </div>
                <h3 className="disagreement-topic">{item.topic}</h3>
                <p className="disagreement-desc">{item.description}</p>
              </div>

              <div className="position-grid">
                {item.expert_positions.map((position) => (
                  <div
                    key={`${item.topic}-${position.expert}-${position.market}`}
                    className="position-cell"
                  >
                    <div className="position-cell-top">
                      <span className="market-badge">{position.market}</span>
                      <span className="expert-name-sub">{position.expert}</span>
                    </div>
                    <p className="position-text">"{position.position}"</p>
                    <div className="position-cell-foot">
                      <SegmentLinks
                        ids={position.evidence_segment_ids}
                        onSegment={onSegment}
                      />
                    </div>
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
