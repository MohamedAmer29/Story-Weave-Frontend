import { createContext } from "react";

export type Theme = "light" | "dark";
export type ThemePreference = "light" | "dark" | "system";

export interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
}

export const STORAGE_KEY = "theme";

export const ThemeContext = createContext<ThemeContextValue | null>(null);