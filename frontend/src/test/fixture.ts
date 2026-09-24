import type { FullAnalysisResponse } from "../types/analysis";

export const analysisFixture: FullAnalysisResponse = {
  experts: [
    {
      transcript_id: "Transcript_1_France",
      expert: "Dr. Jean Martin",
      role: "Head of Urology",
      market: "France",
      answers: [
        {
          question_id: "Q1",
          question: "How would you describe current adoption of robotic surgery in your market?",
          answer: "Adoption is growing, but it is still concentrated in larger academic hospitals.",
          confidence: "high",
          evidence: [
            {
              segment_id: "segment_023",
              timestamp: "00:14:32",
              quote: "The biggest issue is still capital budget approval.",
              question_id: "Q1",
            },
          ],
        },
        {
          question_id: "Q2",
          question: "What are the main barriers to adoption?",
          answer: "Capital budget approval is the main barrier.",
          confidence: "medium",
          evidence: [],
        },
      ],
    },
    {
      transcript_id: "Transcript_2_Germany",
      expert: "Anna Keller",
      role: "Former Hospital Procurement Director",
      market: "Germany",
      answers: [
        {
          question_id: "Q1",
          question: "How would you describe current adoption of robotic surgery in your market?",
          answer: "Adoption is growing, but it is uneven across hospital sizes.",
          confidence: "high",
          evidence: [
            {
              segment_id: "segment_014",
              timestamp: "00:04:09",
              quote: "I think growth will be gradual.",
              question_id: "Q1",
            },
          ],
        },
      ],
    },
    {
      transcript_id: "Transcript_3_UK",
      expert: "Dr. Emily Carter",
      role: "Consultant Urologist",
      market: "United Kingdom",
      answers: [
        {
          question_id: "Q1",
          question: "How would you describe current adoption of robotic surgery in your market?",
          answer: "Adoption is increasing in larger NHS trusts.",
          confidence: "medium",
          evidence: [
            {
              segment_id: "segment_008",
              timestamp: "00:02:07",
              quote: "Funding is important, but training capacity is just as important.",
              question_id: "Q1",
            },
          ],
        },
      ],
    },
  ],
  cross_analysis: {
    common_themes: [
      {
        theme: "Growing adoption",
        description: "Experts across multiple markets described continued adoption growth.",
        experts: [
          {
            expert: "Dr. Jean Martin",
            market: "France",
            position: "Adoption is steadily increasing in larger centres.",
            evidence_segment_ids: ["segment_023"],
          },
          {
            expert: "Anna Keller",
            market: "Germany",
            position: "Growth is ongoing but uneven.",
            evidence_segment_ids: ["segment_014"],
          },
          {
            expert: "Dr. Emily Carter",
            market: "United Kingdom",
            position: "Adoption is increasing in larger trusts.",
            evidence_segment_ids: ["segment_008"],
          },
        ],
      },
    ],
    differences: [
      {
        topic: "Adoption pace",
        description: "Experts differ on how quickly adoption will grow.",
        expert_positions: [
          {
            expert: "Dr. Jean Martin",
            market: "France",
            position: "Steady rather than explosive growth.",
            evidence_segment_ids: ["segment_023"],
          },
          {
            expert: "Anna Keller",
            market: "Germany",
            position: "Gradual growth, closer to high single digits.",
            evidence_segment_ids: ["segment_014"],
          },
        ],
      },
    ],
    disagreements: [
      {
        topic: "Budget impact",
        description: "Experts disagree on whether budget is the primary barrier.",
        expert_positions: [
          {
            expert: "Dr. Jean Martin",
            market: "France",
            position: "Budget is the primary barrier.",
            evidence_segment_ids: ["segment_023"],
          },
          {
            expert: "Anna Keller",
            market: "Germany",
            position: "Cost is the first barrier, alongside utilisation.",
            evidence_segment_ids: ["segment_014"],
          },
          {
            expert: "Dr. Emily Carter",
            market: "United Kingdom",
            position: "Training capacity is as important as funding.",
            evidence_segment_ids: ["segment_008"],
          },
        ],
      },
    ],
  },
  validation: {
    valid: true,
    message: "Cross-expert analysis passed validation.",
  },
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
