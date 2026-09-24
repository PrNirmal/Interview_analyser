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

function installFetch(analysis: () => Promise<Response> | Response) {
  const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
    async (input) => {
    const url = String(input);
    if (url.endsWith("/health")) {
      return jsonResponse({ status: "ok", service: "interview-analyzer" });
    }
    if (url.endsWith("/api/v1/analysis/full")) {
      return analysis();
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
});
