/**
 * Case-study files the API already accepts.
 *
 * Metadata is taken from backend/data, not from an analysis response.
 * The API has no catalog endpoint, so the workspace offers only these
 * known paths. Users cannot submit arbitrary file paths.
 */

export interface GuideCatalogItem {
  id: string;
  filename: string;
  filePath: string;
  title: string;
  questionCount: number;
  questions: readonly string[];
}

export interface TranscriptCatalogItem {
  transcriptId: string;
  expert: string;
  role: string;
  market: string;
  filePath: string;
  filename: string;
}

export const interviewGuide: GuideCatalogItem = {
  id: "interview-guide",
  filename: "Interview_Guide.txt",
  filePath: "data/Interview_Guide.txt",
  title: "European Robotic Surgery Market",
  questionCount: 6,
  questions: [
    "How would you describe current adoption of robotic surgery in your market?",
    "What are the main barriers to adoption?",
    "How important are hospital budgets and ROI in purchasing decisions?",
    "How important are surgeon training and clinical outcomes?",
    "What adoption trend do you expect over the next 3–5 years?",
    "What is the typical hospital decision-making timeline for purchasing a new robotic system?",
  ],
};

export const transcriptCatalog: readonly TranscriptCatalogItem[] = [
  {
    transcriptId: "Transcript_1_France",
    expert: "Dr. Jean Martin",
    role: "Head of Urology",
    market: "France",
    filePath: "data/Transcript_1_France.txt",
    filename: "Transcript_1_France.txt",
  },
  {
    transcriptId: "Transcript_2_Germany",
    expert: "Anna Keller",
    role: "Former Hospital Procurement Director",
    market: "Germany",
    filePath: "data/Transcript_2_Germany.txt",
    filename: "Transcript_2_Germany.txt",
  },
  {
    transcriptId: "Transcript_3_UK",
    expert: "Dr. Emily Carter",
    role: "Consultant Urologist",
    market: "United Kingdom",
    filePath: "data/Transcript_3_UK.txt",
    filename: "Transcript_3_UK.txt",
  },
];
