import { useLocation } from "react-router-dom";
import { usePreferences } from "../../context/PreferencesContext";

const BREADCRUMB_MAP: Record<string, string> = {
  "/": "Overview",
  "/interviews": "Expert Interviews",
  "/analysis": "Research Analysis",
  "/insights": "Cross-Interview Insights",
  "/history": "Analysis History",
  "/settings": "Settings",
};

export function TopBar() {
  const location = useLocation();
  const { preferences } = usePreferences();
  const currentPage = BREADCRUMB_MAP[location.pathname] ?? "Workspace";
  const initials = preferences.initials || "RA";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <nav aria-label="Breadcrumb" className="breadcrumbs">
          <span className="breadcrumb-root">Interview Analyser</span>
          <span className="breadcrumb-separator" aria-hidden="true">/</span>
          <span className="breadcrumb-current">{currentPage}</span>
        </nav>
      </div>

      <div className="topbar-right">
        <div className="user-profile" title={preferences.workspaceName}>
          <div className="user-avatar" aria-hidden="true">
            <span>{initials}</span>
          </div>
          <div className="user-meta">
            <span className="user-name">{preferences.displayName}</span>
            <span className="user-role">{preferences.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
