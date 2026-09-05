import { createContext } from "react";
import type { Translation } from "./en";

export type Language = "en" | "ar";

export interface I18nContextValue {
  lang: Language;
  dir: "ltr" | "rtl";
  t: Translation;
  setLanguage: (lang: Language) => void;
  changeLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const STORAGE_KEY = "language";

export const I18nContext = createContext<I18nContextValue | null>(null);