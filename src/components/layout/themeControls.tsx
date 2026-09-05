import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../theme";
import { useLanguage } from "../../i18n";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const dark = theme === "dark";
  const Icon = dark ? Sun : Moon;
  const label = dark ? t.common.light : t.common.dark;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-fg transition-colors hover:border-brand-500/40 hover:text-brand-600 dark:hover:text-brand-400"
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      {!compact && <span>{label}</span>}
    </button>
  );
}

export function ThemeSelect() {
  const { preference, setPreference } = useTheme();
  const { t } = useLanguage();
  const labels = {
    light: t.settings.themeLight,
    dark: t.settings.themeDark,
    system: t.settings.themeSystem,
  } as const;
  return (
    <div
      className="flex gap-1 rounded-lg border border-border bg-surface p-1"
      role="group"
      aria-label={t.common.theme}
    >
      {(["light", "dark", "system"] as const).map((pref) => (
        <button
          key={pref}
          type="button"
          onClick={() => setPreference(pref)}
          aria-pressed={preference === pref}
          className={
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
            (preference === pref
              ? "bg-brand-600 text-white"
              : "text-fg-muted hover:bg-surface-2 hover:text-fg")
          }
        >
          {labels[pref]}
        </button>
      ))}
    </div>
  );
}

export function LanguageSelect() {
  const { lang, setLanguage } = useLanguage();
  const { t } = useLanguage();
  return (
    <div>
      <label htmlFor="language-select" className="sr-only">
        {t.common.language}
      </label>
      <select
        id="language-select"
        value={lang}
        onChange={(e) => setLanguage(e.target.value as "en" | "ar")}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-fg transition-colors hover:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      >
        <option value="en">{t.common.english}</option>
        <option value="ar">{t.common.arabic}</option>
      </select>
    </div>
  );
}

export function LanguageSwitcher() {
  const { lang, setLanguage } = useLanguage();
  const { t } = useLanguage();
  return (
    <div
      className="inline-flex overflow-hidden rounded-lg border border-border"
      role="group"
      aria-label={t.common.language}
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={lang === "en"}
        className={
          "px-3 py-2 text-sm font-semibold transition-colors " +
          (lang === "en"
            ? "bg-brand-600 text-white"
            : "bg-surface text-fg-muted hover:text-fg")
        }
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("ar")}
        aria-pressed={lang === "ar"}
        className={
          "px-3 py-2 text-sm font-semibold transition-colors " +
          (lang === "ar"
            ? "bg-brand-600 text-white"
            : "bg-surface text-fg-muted hover:text-fg")
        }
      >
        العربية
      </button>
    </div>
  );
}
