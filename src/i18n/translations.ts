import { STORAGE_KEY, type Language } from "./context";
import { en, type Translation } from "./en";
import { ar } from "./ar";

const dictionaries: Record<Language, Translation> = { en, ar };

let currentLanguage: Language = (() => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
})();

/**
 * Resolves the active translations outside the React tree (e.g. Axios
 * interceptors). Reads the stored language directly so it stays in sync with
 * the provider.
 */
export function getActiveTranslation(): Translation {
  return dictionaries[currentLanguage];
}

/** Kept in sync by {@link I18nProvider} so interceptor messages match the UI language. */
export function setActiveLanguage(lang: Language) {
  currentLanguage = lang;
}