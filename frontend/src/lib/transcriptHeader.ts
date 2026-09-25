export interface TranscriptHeader {
  expert: string;
  role: string;
  market: string;
}

const EXPERT_LINE = /^Expert\s+\d+\s*[–—-]\s*(.+)$/i;
const ROLE_LINE = /^Role:\s*(.+)$/i;
const MARKET_LINE = /^Market:\s*(.+)$/i;

export function parseTranscriptHeader(text: string): Partial<TranscriptHeader> {
  const header: Partial<TranscriptHeader> = {};
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12);

  for (const line of lines) {
    const expert = EXPERT_LINE.exec(line);
    if (expert?.[1]) header.expert = expert[1].trim();
    const role = ROLE_LINE.exec(line);
    if (role?.[1]) header.role = role[1].trim();
    const market = MARKET_LINE.exec(line);
    if (market?.[1]) header.market = market[1].trim();
  }

  return header;
}
