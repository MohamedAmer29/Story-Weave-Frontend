import { FileText, Sparkles, MapPin } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "../motion/Reveal";
import { useLanguage } from "../../i18n";

export function AIStory() {
  const { t } = useLanguage();

  return (
    <section className="bg-surface-2/55 py-20 sm:py-28 dark:bg-surface/35">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading title={t.aiStory.title} subtitle={t.aiStory.subtitle} />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <div className="h-full rounded-[2rem] border border-border bg-surface/90 p-6 shadow-[0_24px_64px_rgba(55,39,27,0.06)]">
              <div className="mb-4 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-fg-faint">
                <FileText className="size-4 text-brand-700" aria-hidden />
                {t.aiStory.original}
              </div>
              <div className="rounded-[1.4rem] border border-border bg-elevated/70 p-5 font-display text-lg leading-relaxed text-fg-muted italic">
                “The temple doors groaned open beneath the evening sky. Beneath
                the lantern glow, Amun’s ember flickered in the wind, and the
                desert listened.”
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-[2rem] border border-border bg-[linear-gradient(150deg,var(--color-surface),color-mix(in_srgb,var(--color-sky-100)_55%,var(--color-surface)))] p-6 shadow-[0_24px_64px_rgba(55,39,27,0.06)]">
              <div className="grid gap-4 sm:grid-cols-[0.75fr_1.25fr]">
                <div className="rounded-[1.4rem] bg-[linear-gradient(135deg,#d7a269,#c57a4f_36%,#214b4d_120%)] p-5 text-white">
                  <div className="flex items-center justify-between text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/80">
                    <span>Scene</span>
                    <Sparkles className="size-3.5" aria-hidden />
                  </div>
                  <div className="mt-10 flex items-end justify-between gap-2">
                    <div>
                      <p className="font-display text-3xl leading-none">Amun</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/70">
                        Temple lights
                      </p>
                    </div>
                    <div className="font-display text-5xl leading-none text-white/85">✦</div>
                  </div>
                </div>

                <div className="space-y-4 rounded-[1.4rem] border border-border bg-elevated/70 p-5 text-sm leading-relaxed text-fg-muted">
                  <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-fg-faint">
                    <MapPin className="size-3.5 text-brand-700" aria-hidden />
                    {t.aiStory.scene}
                  </div>
                  <p>
                    The AI keeps the story’s language and emotion first, then
                    builds the visual world around it.
                  </p>
                  <div className="rounded-2xl border border-border bg-brand-500/8 p-3 font-display text-xl italic text-brand-700">
                    “A single ember, a temple of memory, a world brought to life.”
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm leading-relaxed text-fg-faint">
          {t.aiStory.note}
        </p>
      </div>
    </section>
  );
}
