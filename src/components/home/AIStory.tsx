import { FileText, Sparkles, MapPin } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "../../i18n";

export function AIStory() {
  const { t } = useLanguage();

  return (
    <section className="bg-[rgba(255,250,244,0.55)] py-20 sm:py-24 dark:bg-[rgba(36,30,26,0.55)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t.aiStory.title} subtitle={t.aiStory.subtitle} />

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-border bg-[linear-gradient(135deg,#fffaf4,#f0e2d1)] p-5 shadow-[0_24px_64px_rgba(55,39,27,0.06)] dark:bg-[linear-gradient(135deg,#241e1a,#1d1814)]">
            <div className="mb-4 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-fg-faint">
              <FileText className="size-4 text-brand-700" aria-hidden />
              {t.aiStory.original}
            </div>
            <div className="rounded-[1.4rem] border border-border bg-white/70 p-4 text-base leading-relaxed text-fg-muted dark:bg-white/5">
              “The temple doors groaned open beneath the evening sky. Beneath
              the lantern glow, Amun’s ember flickered in the wind, and the
              desert listened.”
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-[linear-gradient(150deg,#f6efe6,#e7efe4)] p-5 shadow-[0_24px_64px_rgba(55,39,27,0.06)] dark:bg-[linear-gradient(150deg,#211e17,#16211e)]">
            <div className="grid gap-4 sm:grid-cols-[0.75fr_1.25fr]">
              <div className="rounded-[1.4rem] border border-[#d9b59d] bg-[linear-gradient(135deg,#d7a269,#c57a4f_36%,#214b4d_120%)] p-4 text-white">
                <div className="flex items-center justify-between text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/80">
                  <span>Scene</span>
                  <Sparkles className="size-3.5" aria-hidden />
                </div>
                <div className="mt-8 flex items-end justify-between gap-2">
                  <div>
                    <p className="font-display text-3xl leading-none">Amun</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/70">
                      Temple lights
                    </p>
                  </div>
                  <div className="font-display text-5xl leading-none text-white/85">
                    ✦
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-[1.4rem] border border-border bg-white/70 p-4 text-sm leading-relaxed text-fg-muted dark:bg-white/5">
                <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-fg-faint">
                  <MapPin className="size-3.5 text-brand-700" aria-hidden />
                  {t.aiStory.scene}
                </div>
                <p>
                  The AI keeps the story’s language and emotion first, then
                  builds the visual world around it.
                </p>
                <div className="rounded-2xl border border-[#d9b59d] bg-[#f8f0e4] p-3 font-display text-xl italic text-brand-700 dark:border-border dark:bg-[#2b241f]">
                  “A single ember, a temple of memory, a world brought to life.”
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm leading-relaxed text-fg-faint">
          {t.aiStory.note}
        </p>
      </div>
    </section>
  );
}
