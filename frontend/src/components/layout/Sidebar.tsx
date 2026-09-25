import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Lightbulb,
  History,
  Settings,
} from "lucide-react";
import { useAnalysis } from "../../context/AnalysisContext";

const navItems = [
  { to: "/", label: "Overview", end: true, icon: LayoutDashboard },
  { to: "/interviews", label: "Interviews", end: false, icon: Users },
  { to: "/analysis", label: "Analysis", end: false, icon: Sparkles },
  { to: "/insights", label: "Insights", end: false, icon: Lightbulb },
  { to: "/history", label: "History", end: false, icon: History },
] as const;

export function Sidebar() {
  const { health, status } = useAnalysis();
  const running = status === "running";

  let statusLabel = "Checking API...";
  let statusState: "unknown" | "ready" | "unavailable" | "running" = "unknown";

  if (running) {
    statusLabel = "Analysis Running";
    statusState = "running";
  } else if (health === "ready") {
    statusLabel = "API Ready";
    statusState = "ready";
  } else if (health === "unavailable") {
    statusLabel = "API Unavailable";
    statusState = "unavailable";
  }

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar-brand">
        <div className="brand-logo" aria-hidden="true">
          <span>IA</span>
        </div>
        <div className="brand-info">
          <span className="brand-name">Interview Analyser</span>
          <span className="brand-tag">Research Intelligence</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-nav-heading">Workspace</p>
        <ul className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `nav-link${isActive ? " is-active" : ""}`
                  }
                >
                  <Icon className="nav-icon" size={17} strokeWidth={2} />
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-utility">
          <NavLink
            to="/settings"
            className={({ isActive }) => `utility-link${isActive ? " is-active" : ""}`}
          >
            <Settings size={16} strokeWidth={1.8} />
            <span>Settings</span>
          </NavLink>
        </div>

        <div className="sidebar-status-wrap">
          <div
            className="system-status subtle-status"
            data-state={statusState}
            title={`System status: ${statusLabel}`}
          >
            <span className="status-dot" aria-hidden="true" />
            <span className="status-text">{statusLabel}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
