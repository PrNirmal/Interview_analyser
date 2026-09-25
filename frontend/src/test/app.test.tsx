import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { App } from "../App";
import { analysisFixture, jsonResponse } from "./fixture";

function renderApp() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>,
  );
}

function installFetch(
  analysis: (input?: RequestInfo | URL, init?: RequestInit) => Promise<Response> | Response,
) {
  const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
    async (input, init) => {
    const url = String(input);
    if (url.endsWith("/health")) {
      return jsonResponse({ status: "ok", service: "interview-analyzer" });
    }
    if (
      url.endsWith("/api/v1/analysis/full") ||
      url.endsWith("/api/v1/analysis/question") ||
      url.endsWith("/api/v1/corpus/guide") ||
      url.endsWith("/api/v1/corpus/transcripts")
    ) {
      return analysis(input, init);
    }
    return jsonResponse({ error: { code: "NOT_FOUND", message: "Not found" } }, 404);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("Interview Analyzer", () => {
  it("renders the analysis workspace", async () => {
    installFetch(() => jsonResponse(analysisFixture));
    renderApp();

    expect(screen.getByRole("heading", { name: "Analyze Interviews" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Analyze expert interviews against your interview guide and uncover cross-market insights.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Interview_Guide.txt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run Analysis" })).toBeEnabled();
    expect(await screen.findByText("API Ready")).toBeInTheDocument();
  });

  it("renders expert cards", () => {
    installFetch(() => jsonResponse(analysisFixture));
    renderApp();

    expect(screen.getByRole("checkbox", { name: /Dr. Jean Martin/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Anna Keller/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Dr. Emily Carter/ })).toBeChecked();
    expect(screen.getByText("Head of Urology")).toBeInTheDocument();
    expect(screen.getByText("Former Hospital Procurement Director")).toBeInTheDocument();
    expect(screen.getByText("Consultant Urologist")).toBeInTheDocument();
    expect(screen.getAllByText("Ready").length).toBeGreaterThan(0);
  });

  it("calls the analysis API when Run Analysis is clicked", async () => {
    const user = userEvent.setup();
    const fetchMock = installFetch(() => new Promise(() => undefined));
    renderApp();

    await user.click(screen.getByRole("button", { name: "Run Analysis" }));

    await waitFor(() => {
      const analysisCalls = fetchMock.mock.calls.filter((call) =>
        String(call[0]).endsWith("/api/v1/analysis/full"),
      );
      expect(analysisCalls).toHaveLength(1);
    });

    const request = fetchMock.mock.calls.find((call) =>
      String(call[0]).endsWith("/api/v1/analysis/full"),
    );
    const init = request?.[1];
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      guide_path: "data/Interview_Guide.txt",
      transcripts: [
        {
          transcript_id: "Transcript_1_France",
          expert: "Dr. Jean Martin",
          role: "Head of Urology",
          market: "France",
          file_path: "data/Transcript_1_France.txt",
        },
        {
          transcript_id: "Transcript_2_Germany",
          expert: "Anna Keller",
          role: "Former Hospital Procurement Director",
          market: "Germany",
          file_path: "data/Transcript_2_Germany.txt",
        },
        {
          transcript_id: "Transcript_3_UK",
          expert: "Dr. Emily Carter",
          role: "Consultant Urologist",
          market: "United Kingdom",
          file_path: "data/Transcript_3_UK.txt",
        },
      ],
      retrieval_top_k: 5,
    });
  });

  it("shows a loading state while analysis is running", async () => {
    const user = userEvent.setup();
    installFetch(() => new Promise(() => undefined));
    renderApp();

    await user.click(screen.getByRole("button", { name: "Run Analysis" }));

    expect(screen.getByRole("button", { name: "Running analysis" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Preparing interviews...");
    expect(screen.getByText("Analysis Running")).toBeInTheDocument();
  });

  it("renders a successful analysis", async () => {
    const user = userEvent.setup();
    installFetch(() => jsonResponse(analysisFixture));
    renderApp();

    await user.click(screen.getByRole("button", { name: "Run Analysis" }));

    expect(await screen.findByRole("heading", { name: "Analysis complete" })).toBeInTheDocument();
    expect(screen.getByText("3 experts · 4 answers · 3 evidence items")).toBeInTheDocument();
    expect(screen.getByText("Experts analyzed")).toBeInTheDocument();
    expect(screen.getByText("Evidence segments")).toBeInTheDocument();
  });

  it("renders expert answers from the response", async () => {
    const user = userEvent.setup();
    installFetch(() => jsonResponse(analysisFixture));
    renderApp();

    await user.click(screen.getByRole("button", { name: "Run Analysis" }));
    expect(
      await screen.findByText(
        "Adoption is growing, but it is still concentrated in larger academic hospitals.",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("high").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1 supporting segment").length).toBeGreaterThan(0);
  });

  it("opens the evidence drawer with the exact quote, timestamp, and segment id", async () => {
    const user = userEvent.setup();
    installFetch(() => jsonResponse(analysisFixture));
    renderApp();

    await user.click(screen.getByRole("button", { name: "Run Analysis" }));
    await screen.findByRole("heading", { name: "Analysis complete" });
    await user.click(screen.getByRole("button", { name: "View evidence" }));

    const dialog = screen.getByRole("dialog", { name: "Dr. Jean Martin" });
    expect(within(dialog).getByText("The biggest issue is still capital budget approval.")).toBeInTheDocument();
    expect(within(dialog).getByText("00:14:32")).toBeInTheDocument();
    expect(within(dialog).getByText("segment_023")).toBeInTheDocument();
    expect(within(dialog).getByText(/France/)).toBeInTheDocument();
  });

  it("renders cross-expert themes", async () => {
    const user = userEvent.setup();
    installFetch(() => jsonResponse(analysisFixture));
    renderApp();

    await user.click(screen.getByRole("button", { name: "Run Analysis" }));
    await screen.findByRole("heading", { name: "Analysis complete" });
    await user.click(screen.getByRole("link", { name: "Insights" }));

    expect(await screen.findByRole("heading", { name: "Common Themes" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "Growing adoption" }).length).toBeGreaterThan(0);
    expect(
      screen.getByText("Experts across multiple markets described continued adoption growth."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("United Kingdom").length).toBeGreaterThan(0);
  });

  it("renders disagreements", async () => {
    const user = userEvent.setup();
    installFetch(() => jsonResponse(analysisFixture));
    renderApp();

    await user.click(screen.getByRole("button", { name: "Run Analysis" }));
    await screen.findByRole("heading", { name: "Analysis complete" });
    await user.click(screen.getByRole("link", { name: "Insights" }));

    expect(await screen.findByRole("heading", { name: "Disagreements" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "Budget impact" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Budget is the primary barrier.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Training capacity is as important as funding.").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Expert Comparison" })).toBeInTheDocument();
    expect(screen.getByText("Cross-expert analysis passed validation.")).toBeInTheDocument();
  });

  it("renders API errors without a stack trace", async () => {
    const user = userEvent.setup();
    installFetch(() =>
      jsonResponse(
        {
          detail: {
            error: {
              code: "ANALYSIS_FAILED",
              message: "Interview analysis could not be completed.",
            },
          },
        },
        500,
      ),
    );
    renderApp();

    await user.click(screen.getByRole("button", { name: "Run Analysis" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Backend analysis failed");
    expect(alert).toHaveTextContent("The analysis service encountered an internal error.");
    expect(alert).not.toHaveTextContent("Traceback");
  });

  it("renders a validation error when the request is rejected", async () => {
    const user = userEvent.setup();
    installFetch(() =>
      jsonResponse(
        {
          detail: [
            {
              loc: ["body", "transcripts"],
              msg: "List should have at least 1 item after validation, not 0",
              type: "too_short",
            },
          ],
        },
        422,
      ),
    );
    renderApp();

    await user.click(screen.getByRole("button", { name: "Run Analysis" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Request validation failed");
    expect(alert).toHaveTextContent(
      "The analysis request was rejected. Please check the selected interviews.",
    );
  });

  it("adds and removes a custom question", async () => {
    const user = userEvent.setup();
    installFetch(() => jsonResponse(analysisFixture));
    renderApp();

    await user.type(screen.getByRole("textbox", { name: "New question" }), "How does reimbursement affect adoption?");
    await user.click(screen.getByRole("button", { name: "Add question" }));

    expect(screen.getByText("How does reimbursement affect adoption?")).toBeInTheDocument();
    expect(screen.getByText("7 questions")).toBeInTheDocument();
    expect(screen.getByText("Custom guide")).toBeInTheDocument();

    const added = screen.getByText("How does reimbursement affect adoption?").closest("li");
    if (!added) throw new Error("Added question was not listed");
    await user.click(within(added).getByRole("button", { name: "Remove" }));

    expect(screen.queryByText("How does reimbursement affect adoption?")).not.toBeInTheDocument();
    expect(screen.getByText("Interview_Guide.txt")).toBeInTheDocument();
  });

  it("saves a custom guide before analysis when questions change", async () => {
    const user = userEvent.setup();
    const fetchMock = installFetch((input) => {
      const url = String(input);
      if (url.endsWith("/api/v1/corpus/guide")) {
        return jsonResponse({
          filename: "custom_interview_guide.txt",
          file_path: "data/uploads/custom_interview_guide.txt",
          title: "European Robotic Surgery Market",
          question_count: 7,
          questions: ["Custom question"],
        });
      }
      return jsonResponse(analysisFixture);
    });
    renderApp();

    await user.type(screen.getByRole("textbox", { name: "New question" }), "What about service contracts?");
    await user.click(screen.getByRole("button", { name: "Add question" }));
    await user.click(screen.getByRole("button", { name: "Run Analysis" }));

    await waitFor(() => {
      const guideCall = fetchMock.mock.calls.find((call) => String(call[0]).endsWith("/api/v1/corpus/guide"));
      expect(guideCall).toBeTruthy();
    });

    await waitFor(() => {
      const analysisCall = fetchMock.mock.calls.find((call) =>
        String(call[0]).endsWith("/api/v1/analysis/full"),
      );
      const body = JSON.parse(String(analysisCall?.[1]?.body));
      expect(body.guide_path).toBe("data/uploads/custom_interview_guide.txt");
    });
  });

  it("uploads a transcript and selects it", async () => {
    const user = userEvent.setup();
    installFetch((input) => {
      const url = String(input);
      if (url.endsWith("/api/v1/corpus/transcripts")) {
        return jsonResponse({
          transcript_id: "upload_sam_lee",
          expert: "Sam Lee",
          role: "Analyst",
          market: "Spain",
          filename: "spain_notes.txt",
          file_path: "data/uploads/spain_notes.txt",
        });
      }
      return jsonResponse(analysisFixture);
    });
    renderApp();

    const file = new File(
      ["Expert 1 – Sam Lee\nRole: Analyst\nMarket: Spain\n"],
      "spain.txt",
      { type: "text/plain" },
    );
    await user.upload(screen.getByLabelText("Transcript file"), file);

    await waitFor(() => {
      expect(screen.getByLabelText("Expert")).toHaveValue("Sam Lee");
    });
    expect(screen.getByLabelText("Role")).toHaveValue("Analyst");
    expect(screen.getByLabelText("Market")).toHaveValue("Spain");

    await user.click(screen.getByRole("button", { name: "Add transcript" }));

    expect(await screen.findByRole("checkbox", { name: /Sam Lee/ })).toBeChecked();
    expect(screen.getByText("4 interviews selected")).toBeInTheDocument();
  });

  it("answers a question across the analyzed interviews", async () => {
    const user = userEvent.setup();
    const fetchMock = installFetch((input) => {
      const url = String(input);
      if (url.endsWith("/api/v1/analysis/question")) {
        return jsonResponse({
          question: "Who said capital budget approval is the biggest issue?",
          answer: "Dr. Jean Martin said capital budget approval is the biggest issue.",
          confidence: "high",
          evidence: [
            {
              segment_id: "segment_023",
              timestamp: "00:14:32",
              quote: "The biggest issue is still capital budget approval.",
              expert: "Dr. Jean Martin",
              role: "Head of Urology",
              market: "France",
              speaker: "Dr. Jean Martin",
            },
          ],
        });
      }
      return jsonResponse(analysisFixture);
    });
    renderApp();

    await user.click(screen.getByRole("button", { name: "Run Analysis" }));
    await screen.findByRole("heading", { name: "Analysis complete" });
    await user.click(screen.getByRole("link", { name: "Insights" }));
    await user.type(
      screen.getByRole("textbox", { name: "Ask across interviews" }),
      "Who said capital budget approval is the biggest issue?",
    );
    await user.click(screen.getByRole("button", { name: "Ask Question" }));

    expect(
      await screen.findByText("Dr. Jean Martin said capital budget approval is the biggest issue."),
    ).toBeInTheDocument();
    expect(screen.getByText("Dr. Jean Martin · France")).toBeInTheDocument();
    expect(screen.getByText("The biggest issue is still capital budget approval.")).toBeInTheDocument();

    const questionCall = fetchMock.mock.calls.find((call) =>
      String(call[0]).endsWith("/api/v1/analysis/question"),
    );
    expect(questionCall?.[1]?.method).toBe("POST");
    const body = JSON.parse(String(questionCall?.[1]?.body)) as {
      question: string;
      transcripts: Array<{ transcript_id: string }>;
    };
    expect(body.question).toBe("Who said capital budget approval is the biggest issue?");
    expect(body.transcripts.map((item) => item.transcript_id)).toEqual([
      "Transcript_1_France",
      "Transcript_2_Germany",
      "Transcript_3_UK",
    ]);
  });

  it("renders a network error when the API cannot be reached", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith("/health")) {
          return jsonResponse({ status: "ok", service: "interview-analyzer" });
        }
        throw new TypeError("Failed to fetch");
      }),
    );
    renderApp();

    await user.click(screen.getByRole("button", { name: "Run Analysis" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Cannot connect to the analysis server.",
    );
  });

  it("saves the workspace profile from settings", async () => {
    const user = userEvent.setup();
    installFetch(() => jsonResponse(analysisFixture));
    renderApp();

    await user.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("heading", { name: "Settings" })).toBeInTheDocument();

    const name = screen.getByLabelText("Display name");
    await user.clear(name);
    await user.type(name, "Alex Chen");

    expect(screen.getByText("Alex Chen")).toBeInTheDocument();
    expect(screen.getByLabelText("Passages per question")).toHaveValue(5);
  });
});
