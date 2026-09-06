import { PenLine, Globe2, Wand2, BookOpenCheck } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal, RevealStagger } from "../motion/Reveal";
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
    <section id="how-it-works" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={t.nav.howItWorks}
            title={t.howItWorks.title}
            subtitle={t.howItWorks.subtitle}
          />
        </Reveal>
        <div className="relative mt-16">
          <div
            className="pointer-events-none absolute top-[2.4rem] end-8 start-8 hidden h-px bg-linear-to-r from-transparent via-brand-400/40 to-transparent lg:block"
            aria-hidden
          />
          <RevealStagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <article
                key={step.number}
                className="group relative rounded-[1.75rem] border border-border bg-surface/90 p-6 shadow-[0_18px_48px_rgba(49,34,23,0.05)] transition-transform duration-300 hover:-translate-y-1.5"
                dir={dir}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <step.icon className="size-5" aria-hidden />
                  </span>
                  <span
                    className="font-display text-4xl font-semibold leading-none text-brand-300/80"
                    aria-hidden
                  >
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-fg">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">{step.desc}</p>
                {i < steps.length - 1 && (
                  <span
                    className="absolute top-8 hidden -end-3 text-brand-400/70 lg:block"
                    aria-hidden
                  >
                    {dir === "rtl" ? "←" : "→"}
                  </span>
                )}
              </article>
            ))}
          </RevealStagger>
        </div>
      </div>
    </section>
  );
}
