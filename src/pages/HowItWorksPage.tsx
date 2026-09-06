import { Helmet } from "react-helmet-async";
import { PenLine, Globe2, Wand2, BookOpenCheck } from "lucide-react";
import { useLanguage } from "../i18n";
import { StoryContext } from "../components/home/StoryContext";
import { AIStory } from "../components/home/AIStory";
import { FinalCTA } from "../components/home/FinalCTA";

export function HowItWorksPage() {
  const { t, dir } = useLanguage();

  const steps = [
    { icon: PenLine, title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc, number: "01" },
    { icon: Globe2, title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc, number: "02" },
    { icon: Wand2, title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc, number: "03" },
    { icon: BookOpenCheck, title: t.howItWorks.step4Title, desc: t.howItWorks.step4Desc, number: "04" },
  ];

  return (
    <>
      <Helmet>
        <title>
          {t.nav.howItWorks} · {t.brand.name}
        </title>
      </Helmet>
      <section className="hero-aurora relative">
        <div className="page-shell">
          <h1 className="font-display text-center text-4xl font-semibold tracking-[-0.04em] text-fg sm:text-6xl">
            {t.howItWorks.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg text-fg-muted">{t.howItWorks.subtitle}</p>

          <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex gap-5 rounded-[1.6rem] border border-border bg-surface/90 p-6 shadow-[0_16px_40px_rgba(49,34,23,0.05)] transition-all hover:-translate-y-1 hover:border-brand-500/40"
                dir={dir}
              >
                <span className="relative shrink-0">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-sky-400 text-white shadow-sm">
                    <step.icon className="size-6" aria-hidden />
                  </span>
                  <span className="absolute -end-2 -top-2 rounded-full border border-border bg-surface px-1.5 py-0.5 text-[11px] font-bold text-brand-600 dark:text-brand-400">
                    {step.number}
                  </span>
                </span>
                <div>
                  <h2 className="text-lg font-bold text-fg">{step.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <StoryContext />
      <AIStory />
      <FinalCTA />
    </>
  );
}