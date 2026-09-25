import { Quote } from "lucide-react";
import type { CommonTheme } from "../../types/analysis";
import { EmptyState } from "../ui/EmptyState";
import { SegmentLinks } from "./SegmentLinks";

interface ThemeListProps {
  themes: CommonTheme[];
  onSegment: (segmentId: string) => void;
}

export function ThemeList({ themes, onSegment }: ThemeListProps) {
  return (
    <section className="section" id="common-themes" aria-labelledby="themes-heading">
      <div className="section-heading">
        <div>
          <span className="kicker">Consensus Mapping</span>
          <h2 id="themes-heading">Common Themes</h2>
          <p className="section-subtitle">
            Recurring concepts and strategic patterns observed across multiple expert interviews.
          </p>
        </div>
      </div>

      {themes.length === 0 ? (
        <EmptyState
          title="No common themes"
          description="No common themes were identified in the returned analysis."
        />
      ) : (
        <div className="insights-grid">
          {themes.map((theme) => {
            const expertCount = theme.experts.length;
            const totalSegments = theme.experts.reduce(
              (acc, e) => acc + e.evidence_segment_ids.length,
              0
            );

            return (
              <article key={theme.theme} className="theme-insight-card">
                <div className="theme-card-header">
                  <div className="theme-card-badge-row">
                    <span className="insight-badge">COMMON THEME</span>
                    <span className="theme-expert-count">
                      Mentioned by {expertCount} of {expertCount} experts
                    </span>
                  </div>
                  <h3 className="theme-title">{theme.theme}</h3>
                  <p className="theme-desc">{theme.description}</p>
                </div>

                <div className="theme-experts-section">
                  <span className="meta-label">Supported by</span>
                  {theme.experts.length === 0 ? (
                    <p className="quiet">No supporting experts were returned.</p>
                  ) : (
                    <div className="expert-positions-list">
                      {theme.experts.map((expert) => (
                        <div
                          key={`${theme.theme}-${expert.expert}-${expert.market}`}
                          className="expert-position-item"
                        >
                          <div className="position-expert-header">
                            <span className="position-market">{expert.market}</span>
                            <span className="position-expert-name">{expert.expert}</span>
                          </div>
                          <p className="position-quote-text">"{expert.position}"</p>
                          <div className="position-footer">
                            <SegmentLinks
                              ids={expert.evidence_segment_ids}
                              onSegment={onSegment}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="theme-card-footer">
                  <span className="footer-evidence-count">
                    <Quote size={13} />
                    <span>{totalSegments} evidence {totalSegments === 1 ? "reference" : "references"}</span>
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
