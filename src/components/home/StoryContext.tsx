import { Landmark } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { cn } from "../../lib/cn";
import { useLanguage } from "../../i18n";

export function StoryContext() {
  const { t, dir } = useLanguage();

  const rows = [
    { label: t.storyContext.eraLabel, value: t.storyContext.eraValue },
    { label: t.storyContext.yearLabel, value: t.storyContext.yearValue },
    {
      label: t.storyContext.locationLabel,
      value: t.storyContext.locationValue,
    },
    {
      label: t.storyContext.civilizationLabel,
      value: t.storyContext.civilizationValue,
    },
    { label: t.storyContext.themeLabel, value: t.storyContext.themeValue },
  ];

  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="hero-aurora absolute inset-0" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionHeading
            title={t.storyContext.title}
            subtitle={t.storyContext.subtitle}
            align="start"
          />
          <div className="mt-6 flex items-start gap-3 rounded-[1.4rem] border border-[#d9b59d] bg-white/60 p-4 text-sm leading-relaxed text-fg-muted shadow-[0_16px_32px_rgba(73,50,35,0.04)] dark:border-border dark:bg-white/5">
            <Landmark
              className="mt-0.5 size-5 shrink-0 text-brand-700"
              aria-hidden
            />
            <p>{t.storyContext.storyPrimary}</p>
          </div>
        </div>

        <div
          className="rounded-[2rem] border border-border bg-[linear-gradient(135deg,#fffaf4,#f0e2d1)] p-5 shadow-[0_30px_80px_rgba(61,45,35,0.08)] dark:bg-[linear-gradient(135deg,#241e1a,#1d1814)]"
          dir={dir}
        >
          <div className="mb-5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-fg">
              <Landmark className="size-4 text-brand-700" aria-hidden />
              {t.storyContext.title}
            </div>
            <span className="rounded-full border border-[#d9b59d] bg-[#f6ead9] px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-brand-700 dark:border-border dark:bg-[#2b241f]">
              dossier
            </span>
          </div>

          <dl className="overflow-hidden rounded-[1.3rem] border border-border bg-white/60 dark:bg-white/5">
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={cn(
                  "grid grid-cols-2 items-center gap-4 border-b border-border last:border-b-0",
                  i % 2 === 0
                    ? "bg-[rgba(242,232,220,0.65)] dark:bg-[rgba(255,255,255,0.04)]"
                    : "bg-white/35 dark:bg-white/[0.03]",
                )}
              >
                <dt className="px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-fg-faint">
                  {row.label}
                </dt>
                <dd className="px-4 py-3 text-sm font-semibold text-fg">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
