import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  loadPreferences,
  savePreferences,
  type AppPreferences,
} from "../lib/preferences";

interface PreferencesController {
  preferences: AppPreferences;
  updatePreferences: (patch: Partial<AppPreferences>) => void;
}

const PreferencesContext = createContext<PreferencesController | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AppPreferences>(() => loadPreferences());

  const updatePreferences = useCallback((patch: Partial<AppPreferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      savePreferences(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ preferences, updatePreferences }),
    [preferences, updatePreferences],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesController {
  const value = useContext(PreferencesContext);
  if (!value) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return value;
}
