import { Component, type ErrorInfo, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { AnalysisProvider } from "./context/AnalysisContext";
import { AppShell } from "./components/layout/AppShell";
import { AnalysisPage } from "./pages/AnalysisPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HistoryPage } from "./pages/HistoryPage";
import { InsightsPage } from "./pages/InsightsPage";
import { InterviewsPage } from "./pages/InterviewsPage";

interface BoundaryProps {
  children: ReactNode;
}

interface BoundaryState {
  error: Error | null;
}

class AppErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="fatal">
          <h1>Something went wrong.</h1>
          <p>The analysis view could not be displayed.</p>
          {import.meta.env.DEV ? <p>{this.state.error.message}</p> : null}
        </main>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <AppErrorBoundary>
      <AnalysisProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="interviews" element={<InterviewsPage />} />
            <Route path="analysis" element={<AnalysisPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="history" element={<HistoryPage />} />
          </Route>
        </Routes>
      </AnalysisProvider>
    </AppErrorBoundary>
  );
}
