interface SegmentLinksProps {
  ids: string[];
  onSegment: (segmentId: string) => void;
}

export function SegmentLinks({ ids, onSegment }: SegmentLinksProps) {
  if (ids.length === 0) {
    return <p className="quiet">No evidence segment ids were returned.</p>;
  }

  return (
    <ul className="segment-list">
      {ids.map((id) => (
        <li key={id}>
          <button type="button" className="segment-link mono" onClick={() => onSegment(id)}>
            {id}
          </button>
        </li>
      ))}
    </ul>
  );
}
