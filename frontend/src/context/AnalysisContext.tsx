import { createContext, useContext, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysisController, type AnalysisController } from "../hooks/useAnalysis";

const AnalysisContext = createContext<AnalysisController | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const value = useAnalysisController({
    onComplete: () => navigate("/analysis"),
  });

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysis(): AnalysisController {
  const value = useContext(AnalysisContext);
  if (!value) {
    throw new Error("useAnalysis must be used within AnalysisProvider");
  }
  return value;
}
