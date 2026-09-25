import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AlertCircle } from "lucide-react";
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
  "/settings": "Settings",
};

export function AppShell() {
  const { error, status } = useAnalysis();
  const location = useLocation();
  const message = error && status === "error" ? userFacingError(error) : null;

  useEffect(() => {
    const page = PAGE_TITLES[location.pathname] ?? "Interview Analyser";
    document.title = `${page} · Interview Analyser`;
  }, [location.pathname]);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <main id="main" className="content">
          {message ? (
            <div className="error-banner" role="alert">
              <div className="error-banner-icon">
                <AlertCircle size={20} />
              </div>
              <div className="error-banner-body">
                <h2>{message.title}</h2>
                <p>{message.description}</p>
                {import.meta.env.DEV ? (
                  <details>
                    <summary>Technical details</summary>
                    <p className="mono">
                      {error?.code} · HTTP {error?.status}
                    </p>
                    <p>{error?.message}</p>
                  </details>
                ) : null}
              </div>
            </div>
          ) : null}
          <Outlet />
        </main>
      </div>
      <EvidenceViewer />
    </div>
  );
}
