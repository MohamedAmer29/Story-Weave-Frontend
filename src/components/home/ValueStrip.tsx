import { BookMarked, FileUp, History, Languages, Lock } from "lucide-react";
import { useLanguage } from "../../i18n";

export function ValueStrip() {
  const { t } = useLanguage();

  const items = [
    { icon: BookMarked, label: t.value.aiIllustration },
    { icon: FileUp, label: t.value.pdfSupport },
    { icon: History, label: t.value.historical },
    { icon: Languages, label: t.value.languages },
    { icon: Lock, label: t.value.visibility },
  ];

  return (
    <section
      className="border-y border-border/80 bg-[rgba(255,250,244,0.7)] backdrop-blur-sm dark:border-border dark:bg-[#171412]"
      aria-label={t.value.title}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-sm font-medium text-fg-muted sm:gap-x-8 dark:text-[#dcc7b2]">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2.5 rounded-full border border-border bg-white/55 px-3 py-2 shadow-[0_8px_24px_rgba(61,46,35,0.04)] dark:border-border dark:bg-[#221d1a]/90"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-[#efe0cf] text-brand-700 dark:bg-white/8 dark:text-brand-300">
                <item.icon className="size-4" aria-hidden />
              </span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
