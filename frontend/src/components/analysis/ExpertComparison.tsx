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
        <h2 id="comparison-heading">Expert Comparison</h2>
      </div>
      {rows.length === 0 || markets.length === 0 ? (
        <EmptyState
          title="Nothing to compare"
          description="No differences or disagreements were identified in the returned analysis."
        />
      ) : (
        <div className="table-scroll">
          <table className="compare-table">
            <caption className="sr-only">Expert positions by market</caption>
            <thead>
              <tr>
                <th scope="col">Topic</th>
                {markets.map((market) => (
                  <th key={market} scope="col">
                    {market}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.kind}-${row.topic}`}>
                  <th scope="row">
                    <span className="meta-label">{row.kind}</span>
                    <span className="topic-name">{row.topic}</span>
                    <span className="quiet">{row.description}</span>
                  </th>
                  {markets.map((market) => {
                    const matches = row.positions.filter((position) => position.market === market);
                    return (
                      <td key={`${row.kind}-${row.topic}-${market}`}>
                        {matches.length === 0 ? (
                          <span className="quiet">No position returned</span>
                        ) : (
                          matches.map((position, index) => (
                            <p key={`${position.expert}-${index}`}>{position.position}</p>
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
      )}
    </section>
  );
}
