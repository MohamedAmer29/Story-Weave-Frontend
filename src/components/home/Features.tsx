import {
  Palette,
  Globe,
  FileUp,
  Languages,
  Lock,
  Share2,
  BookOpen,
  Activity,
} from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal, RevealStagger } from "../motion/Reveal";
import { cn } from "../../lib/cn";
import { useLanguage } from "../../i18n";

export function Features() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Palette,
      title: t.features.aiIllustrationTitle,
      desc: t.features.aiIllustrationDesc,
      excerpt:
        "The desert scorches gold, and the gods lean close to the firelight.",
      tone: "amber",
    },
    {
      icon: Globe,
      title: t.features.contextTitle,
      desc: t.features.contextDesc,
      excerpt: "Alexandria, 250 BCE — the murals breathe with living detail.",
      tone: "teal",
    },
    {
      icon: FileUp,
      title: t.features.pdfTitle,
      desc: t.features.pdfDesc,
      tone: "sand",
    },
    {
      icon: Languages,
      title: t.features.arabicTitle,
      desc: t.features.arabicDesc,
      tone: "rose",
    },
    {
      icon: Lock,
      title: t.features.visibilityTitle,
      desc: t.features.visibilityDesc,
      tone: "stone",
    },
    {
      icon: Share2,
      title: t.features.sharingTitle,
      desc: t.features.sharingDesc,
      tone: "forest",
    },
    {
      icon: BookOpen,
      title: t.features.readerTitle,
      desc: t.features.readerDesc,
      tone: "stone",
    },
    {
      icon: Activity,
      title: t.features.generationTitle,
      desc: t.features.generationDesc,
      tone: "amber",
    },
  ];

  const lead = features.slice(0, 2);
  const support = features.slice(2);

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-surface-2/60 py-20 sm:py-28 dark:bg-surface/40"
    >
      <div
        className="hero-aurora pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={t.nav.features}
            title={t.features.title}
            subtitle={t.features.subtitle}
          />
        </Reveal>

        <RevealStagger className="mt-14 grid gap-5 lg:grid-cols-2">
          {lead.map((feat) => (
            <article
              key={feat.title}
              className={cn(
                "overflow-hidden rounded-[2rem] border border-border p-5 shadow-[0_24px_64px_rgba(52,38,28,0.07)]",
                feat.tone === "amber"
                  ? "bg-[linear-gradient(135deg,#fffaf3,#f2e6d4)] dark:bg-[linear-gradient(135deg,#2a221e,#1b1715)]"
                  : "bg-[linear-gradient(135deg,#f9f1e7,#e5efe9)] dark:bg-[linear-gradient(135deg,#1f1b18,#16211e)]",
              )}
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div
                  className={cn(
                    "h-40 w-full overflow-hidden rounded-[1.4rem] md:w-44",
                    feat.tone === "amber"
                      ? "bg-[linear-gradient(135deg,#f2d8ad,#c97e58_42%,#224c4a_140%)]"
                      : "bg-[linear-gradient(135deg,#c9ddd4,#3d6d68_50%,#1d3534_140%)]",
                  )}
                >
                  <div className="flex h-full items-end justify-between p-4 text-[#fffdf6]">
                    <div>
                      <div className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-white/70">
                        Tale
                      </div>
                      <div className="mt-2 font-display text-2xl leading-none">
                        {feat.tone === "amber" ? "Amun" : "Nile"}
                      </div>
                    </div>
                    <div className="font-display text-5xl leading-none text-white/80">
                      ✦
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-brand-500/12 text-brand-700">
                      <feat.icon className="size-5" aria-hidden />
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-fg">{feat.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                    {feat.desc}
                  </p>
                  <p className="mt-4 border-s-2 border-brand-500/40 ps-3 font-display text-lg italic leading-relaxed text-brand-700">
                    “{feat.excerpt}”
                  </p>
                </div>
              </div>
            </article>
          ))}
        </RevealStagger>

        <RevealStagger className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {support.map((feat) => (
            <article
              key={feat.title}
              className="rounded-[1.6rem] border border-border bg-surface/90 p-5 shadow-[0_12px_32px_rgba(52,38,28,0.04)] transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-700">
                <feat.icon className="size-4" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold text-fg">{feat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {feat.desc}
              </p>
            </article>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
