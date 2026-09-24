import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Overview", end: true, icon: OverviewIcon },
  { to: "/interviews", label: "Interviews", end: false, icon: InterviewsIcon },
  { to: "/analysis", label: "Analysis", end: false, icon: AnalysisIcon },
  { to: "/insights", label: "Insights", end: false, icon: InsightsIcon },
  { to: "/history", label: "History", end: false, icon: HistoryIcon },
] as const;

export function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Primary">
      <ul>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function OverviewIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1" />
    </svg>
  );
}

function InterviewsIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="6" cy="5" r="2" />
      <path d="M2.5 12.5c.6-2 2-3 3.5-3s2.9 1 3.5 3" />
      <circle cx="11.2" cy="5.4" r="1.5" />
      <path d="M10.2 9.6c1.4.2 2.4 1.1 3.1 2.9" />
    </svg>
  );
}

function AnalysisIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 2.5h7l3 3V13.5H3z" />
      <path d="M10 2.5V5.5h3" />
      <path d="M5.5 8.5h5M5.5 11h3.5" />
    </svg>
  );
}

function InsightsIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="4" cy="8" r="1.4" />
      <circle cx="12" cy="4" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <path d="M5.3 7.3 10.6 4.7M5.4 8.8l5.2 2.5" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="5.2" />
      <path d="M8 5v3.2l2.2 1.4" />
    </svg>
  );
}
