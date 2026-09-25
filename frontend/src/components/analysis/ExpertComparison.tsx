import type { Difference, Disagreement, ExpertPosition } from "../../types/analysis";
import { EmptyState } from "../ui/EmptyState";

interface ComparisonRow {
  kind: "Difference" | "Disagreement";
  topic: string;
  description: string;
  positions: ExpertPosition[];
}

interface ExpertComparisonProps {
  markets: string[];
  differences: Difference[];
  disagreements: Disagreement[];
}

export function ExpertComparison({ markets, differences, disagreements }: ExpertComparisonProps) {
  const rows: ComparisonRow[] = [
    ...differences.map((item) => ({
      kind: "Difference" as const,
      topic: item.topic,
      description: item.description,
      positions: item.expert_positions,
    })),
    ...disagreements.map((item) => ({
      kind: "Disagreement" as const,
      topic: item.topic,
      description: item.description,
      positions: item.expert_positions,
    })),
  ];

  return (
    <section className="section" id="expert-comparison" aria-labelledby="comparison-heading">
      <div className="section-heading">
        <div>
          <span className="kicker">Comparative Matrix</span>
          <h2 id="comparison-heading">Expert Comparison</h2>
          <p className="section-subtitle">
            Cross-market matrix comparing positions by topic across analyzed geographical regions.
          </p>
        </div>
      </div>

      {rows.length === 0 || markets.length === 0 ? (
        <EmptyState
          title="Nothing to compare"
          description="No differences or disagreements were identified in the returned analysis."
        />
      ) : (
        <div className="table-card">
          <div className="table-scroll">
            <table className="compare-table">
              <caption className="sr-only">Expert positions by market</caption>
              <thead>
                <tr>
                  <th scope="col" className="th-topic">Topic & Focus</th>
                  {markets.map((market) => (
                    <th key={market} scope="col" className="th-market">
                      {market}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.kind}-${row.topic}`}>
                    <th scope="row" className="td-topic-info">
                      <span className={`kind-tag kind-${row.kind.toLowerCase()}`}>
                        {row.kind}
                      </span>
                      <strong className="topic-name">{row.topic}</strong>
                      <span className="topic-desc quiet">{row.description}</span>
                    </th>
                    {markets.map((market) => {
                      const matches = row.positions.filter((position) => position.market === market);
                      return (
                        <td key={`${row.kind}-${row.topic}-${market}`} className="td-market-pos">
                          {matches.length === 0 ? (
                            <span className="no-pos quiet">No position returned</span>
                          ) : (
                            matches.map((position, index) => (
                              <div key={`${position.expert}-${index}`} className="cell-position">
                                <span className="cell-expert quiet">{position.expert}</span>
                                <p className="cell-text">"{position.position}"</p>
                              </div>
                            ))
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
