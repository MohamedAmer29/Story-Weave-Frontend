import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type Translation } from "./en";
import { ar } from "./ar";
import { I18nContext, STORAGE_KEY, type I18nContextValue, type Language } from "./context";

const dictionaries: Record<Language, Translation> = { en, ar };

function detectBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return "en";
  const locales = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const loc of locales) {
    const lower = (loc || "").toLowerCase();
    if (lower.startsWith("ar")) return "ar";
    if (lower.startsWith("en")) return "en";
  }
  return "en";
}

function loadInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "ar") return saved;
  return detectBrowserLanguage();
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(loadInitialLanguage);

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang === "ar" ? "ar" : "en");
    document.documentElement.setAttribute("dir", dir);
  }, [lang, dir]);

  const setLanguage = useCallback((next: Language) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setLang(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLang((prev) => {
      const next: Language = prev === "en" ? "ar" : "en";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      dir,
      t: dictionaries[lang],
      setLanguage,
      changeLanguage: setLanguage,
      toggleLanguage,
    }),
    [lang, dir, setLanguage, toggleLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}