import { Landmark } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "../motion/Reveal";
import { cn } from "../../lib/cn";
import { useLanguage } from "../../i18n";

export function StoryContext() {
  const { t, dir } = useLanguage();

  const rows = [
    { label: t.storyContext.eraLabel, value: t.storyContext.eraValue },
    { label: t.storyContext.yearLabel, value: t.storyContext.yearValue },
    { label: t.storyContext.locationLabel, value: t.storyContext.locationValue },
    { label: t.storyContext.civilizationLabel, value: t.storyContext.civilizationValue },
    { label: t.storyContext.themeLabel, value: t.storyContext.themeValue },
  ];

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="hero-aurora absolute inset-0" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <Reveal>
          <SectionHeading
            title={t.storyContext.title}
            subtitle={t.storyContext.subtitle}
            align="start"
          />
          <div className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-border bg-surface/80 p-5 text-sm leading-relaxed text-fg-muted shadow-[0_16px_32px_rgba(73,50,35,0.04)]">
            <Landmark className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden />
            <p>{t.storyContext.storyPrimary}</p>
          </div>
        </Reveal>

        <Reveal delay={0.12} y={48}>
          <div
            className="rounded-[2rem] border border-border bg-surface/90 p-6 shadow-[0_30px_80px_rgba(61,45,35,0.08)]"
            dir={dir}
          >
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-fg">
                <Landmark className="size-4 text-brand-700" aria-hidden />
                {t.storyContext.title}
              </div>
              <span className="rounded-full border border-border bg-brand-500/10 px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-brand-700">
                dossier
              </span>
            </div>

            <dl className="overflow-hidden rounded-[1.3rem] border border-border">
              {rows.map((row, i) => (
                <div
                  key={row.label}
                  className={cn(
                    "grid grid-cols-2 items-center gap-4 border-b border-border last:border-b-0",
                    i % 2 === 0 ? "bg-surface-2/70" : "bg-elevated/40",
                  )}
                >
                  <dt className="px-4 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-fg-faint">
                    {row.label}
                  </dt>
                  <dd className="px-4 py-3.5 text-sm font-semibold text-fg">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-fg-muted">
              Language is used for reading the story, not for deciding the image style, culture, or setting.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
