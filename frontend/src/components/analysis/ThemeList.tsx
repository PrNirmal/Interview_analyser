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
        <h2 id="themes-heading">Common Themes</h2>
      </div>
      {themes.length === 0 ? (
        <EmptyState
          title="No common themes"
          description="No common themes were identified in the returned analysis."
        />
      ) : (
        <div className="stack">
          {themes.map((theme) => (
            <article key={theme.theme} className="insight-card">
              <p className="meta-label">Common Theme</p>
              <h3>{theme.theme}</h3>
              <p>{theme.description}</p>
              <div>
                <p className="meta-label">Supported by</p>
                {theme.experts.length === 0 ? (
                  <p className="quiet">No supporting experts were returned.</p>
                ) : (
                  <ul className="support-list">
                    {theme.experts.map((expert) => (
                      <li key={`${theme.theme}-${expert.expert}-${expert.market}`}>
                        <strong>{expert.market}</strong>
                        <span>{expert.expert}</span>
                        <p>{expert.position}</p>
                        <SegmentLinks ids={expert.evidence_segment_ids} onSegment={onSegment} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
