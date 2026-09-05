import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ThemeContext,
  STORAGE_KEY,
  type Theme,
  type ThemeContextValue,
  type ThemePreference,
} from "./theme-context";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function loadInitialPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark" || saved === "system") return saved;
  return "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(loadInitialPreference);
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const theme: Theme = preference === "system" ? systemTheme : preference;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const setPreference = useCallback((pref: ThemePreference) => {
    window.localStorage.setItem(STORAGE_KEY, pref);
    setPreferenceState(pref);
  }, []);

  const toggleTheme = useCallback(() => {
    setPreference(theme === "dark" ? "light" : "dark");
  }, [theme, setPreference]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, preference, setPreference, toggleTheme }),
    [theme, preference, setPreference, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}