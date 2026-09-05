import { PenLine, Globe2, Wand2, BookOpenCheck } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { cn } from "../../lib/cn";
import { useLanguage } from "../../i18n";

export function HowItWorks() {
  const { t, dir } = useLanguage();

  const steps = [
    {
      icon: PenLine,
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
      number: "01",
    },
    {
      icon: Globe2,
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
      number: "02",
    },
    {
      icon: Wand2,
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
      number: "03",
    },
    {
      icon: BookOpenCheck,
      title: t.howItWorks.step4Title,
      desc: t.howItWorks.step4Desc,
      number: "04",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-20 sm:py-24 dark:bg-[#171412]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t.howItWorks.title}
          subtitle={t.howItWorks.subtitle}
        />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={cn(
                "relative rounded-[1.6rem] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(243,234,219,0.75))] p-6 shadow-[0_16px_40px_rgba(49,34,23,0.04)] dark:border-border dark:bg-[linear-gradient(180deg,#27211e,#1d1815)]",
                i === 2 && "lg:-translate-y-2",
                i === 3 && "lg:-translate-y-4",
              )}
              dir={dir}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#efe0cf] text-brand-700 dark:bg-white/8 dark:text-brand-300">
                  <step.icon className="size-5" aria-hidden />
                </span>
                <span
                  className="font-display text-4xl font-semibold leading-none text-[#d7b998] dark:text-[#e7c497]"
                  aria-hidden
                >
                  {step.number}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-fg dark:text-[#f7ebdf]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted dark:text-[#d9c5b4]">
                {step.desc}
              </p>
              {i < steps.length - 1 && (
                <span
                  className="absolute top-1/2 hidden -end-4 -translate-y-1/2 text-2xl text-border-strong lg:block"
                  aria-hidden
                >
                  {dir === "rtl" ? "←" : "→"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
