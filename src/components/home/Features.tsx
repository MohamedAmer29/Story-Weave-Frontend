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
      className="relative bg-[rgba(255,250,244,0.55)] py-20 sm:py-24 dark:bg-[#171412]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t.features.title}
          subtitle={t.features.subtitle}
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-6">
            {lead.map((feat) => (
              <article
                key={feat.title}
                className={cn(
                  "overflow-hidden rounded-[2rem] border border-border bg-[#fffaf5]/80 p-5 shadow-[0_24px_64px_rgba(52,38,28,0.08)] dark:border-border dark:bg-[#1c1816]/95",
                  feat.tone === "amber"
                    ? "bg-[linear-gradient(135deg,#fffaf3,#f2e6d4)] dark:bg-[linear-gradient(135deg,#2a221e,#1b1715)]"
                    : "bg-[linear-gradient(135deg,#f9f1e7,#e5efe9)] dark:bg-[linear-gradient(135deg,#1f1b18,#16211e)]",
                )}
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  <div className="h-40 w-full overflow-hidden rounded-[1.4rem] border border-border bg-[linear-gradient(135deg,#f2d8ad,#c97e58_42%,#224c4a_140%)] md:w-52">
                    <div className="flex h-full items-end justify-between p-4 text-[#fffdf6]">
                      <div>
                        <div className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-white/70">
                          Tale
                        </div>
                        <div className="mt-2 font-display text-2xl leading-none">
                          Amun
                        </div>
                      </div>
                      <div className="font-display text-5xl leading-none text-white/80">
                        ✦
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#efe0cf] text-brand-700 dark:bg-white/10">
                        <feat.icon className="size-5" aria-hidden />
                      </span>
                      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-fg-faint">
                        Illustrated detail
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-fg">{feat.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                      {feat.desc}
                    </p>
                    <p className="mt-4 border-l border-brand-500/40 pl-3 font-display text-lg italic leading-relaxed text-brand-700">
                      “{feat.excerpt}”
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {support.map((feat) => (
              <article
                key={feat.title}
                className="rounded-[1.6rem] border border-border bg-[#fffaf5]/80 p-4 shadow-[0_12px_32px_rgba(52,38,28,0.04)] dark:border-border dark:bg-[#1d1a18]/95"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#efe0cf] text-brand-700 dark:bg-white/10">
                    <feat.icon className="size-4" aria-hidden />
                  </span>
                  <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-fg-faint">
                    Story detail
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-fg">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  {feat.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
