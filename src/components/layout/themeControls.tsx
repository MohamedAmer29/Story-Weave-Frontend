import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Globe, Moon, Sun } from "lucide-react";
import { useTheme } from "../../theme";
import { useLanguage } from "../../i18n";
import { cn } from "../../lib/cn";

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
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      close();
    };
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && listRef.current?.contains(event.target)) {
        return;
      }
      close();
    };
    const onResize = () => close();
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const list = listRef.current;
    if (!trigger || !list) return;
    const rect = trigger.getBoundingClientRect();
    const listHeight = list.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const flip = spaceBelow < listHeight + 16 && rect.top > spaceBelow;
    const available = flip ? rect.top : spaceBelow;
    Object.assign(list.style, {
      position: "fixed",
      top: `${flip ? Math.max(8, rect.top - listHeight - 6) : rect.bottom + 6}px`,
      right: `${window.innerWidth - rect.right}px`,
      minWidth: `${rect.width}px`,
      maxHeight: `${Math.max(64, Math.min(320, available - 12))}px`,
      zIndex: "100",
    });
  }, [open]);

  const languages = [
    { code: "en" as const, label: t.common.english },
    { code: "ar" as const, label: t.common.arabic },
  ];

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        aria-label={t.common.language}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-fg transition-colors hover:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      >
        <Globe className="size-4 shrink-0" aria-hidden />
        <span>
          {languages.find((l) => l.code === lang)?.label ?? t.common.language}
        </span>
        <ChevronDown className="size-3.5 text-fg-muted" aria-hidden />
      </button>
      {open &&
        createPortal(
          <div
            ref={listRef}
            role="listbox"
            aria-label={t.common.language}
            className="overflow-hidden rounded-lg border border-border bg-elevated p-1 shadow-xl"
          >
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                role="option"
                aria-selected={lang === language.code}
                onClick={() => {
                  setLanguage(language.code);
                  close();
                }}
                className={cn(
                  "block w-full rounded-md px-3 py-2 text-start text-sm transition-colors",
                  lang === language.code
                    ? "bg-brand-600 text-white"
                    : "text-fg hover:bg-surface-2"
                )}
              >
                {language.label}
              </button>
            ))}
          </div>,
          document.body
        )}
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
