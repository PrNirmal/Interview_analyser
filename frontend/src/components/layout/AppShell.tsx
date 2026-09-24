import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { userFacingError } from "../../api/errors";
import { useAnalysis } from "../../context/AnalysisContext";
import { EvidenceViewer } from "../analysis/EvidenceViewer";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const PAGE_TITLES: Record<string, string> = {
  "/": "Overview",
  "/interviews": "Interviews",
  "/analysis": "Analysis",
  "/insights": "Insights",
  "/history": "History",
};

export function AppShell() {
  const { error, status } = useAnalysis();
  const location = useLocation();
  const message = error && status === "error" ? userFacingError(error) : null;

  useEffect(() => {
    const page = PAGE_TITLES[location.pathname] ?? "Interview Analyzer";
    document.title = `${page} · Interview Analyzer`;
  }, [location.pathname]);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <TopBar />
      <div className="app-body">
        <Sidebar />
        <main id="main" className="content">
          {message ? (
            <div className="error-banner" role="alert">
              <h2>{message.title}</h2>
              <p>{message.description}</p>
              {import.meta.env.DEV ? (
                <details>
                  <summary>Technical details</summary>
                  <p>
                    {error?.code} · HTTP {error?.status}
                  </p>
                  <p>{error?.message}</p>
                </details>
              ) : null}
            </div>
          ) : null}
          <Outlet />
        </main>
      </div>
      <EvidenceViewer />
    </div>
  );
}
