import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { BookMarked, FileUp, History, Languages, Lock } from "lucide-react";
import { useLanguage } from "../../i18n";
import { gsap, prefersReducedMotion } from "../../lib/gsap";

export function ValueStrip() {
  const { t, dir } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);

  const items = [
    { icon: BookMarked, label: t.value.aiIllustration },
    { icon: FileUp, label: t.value.pdfSupport },
    { icon: History, label: t.value.historical },
    { icon: Languages, label: t.value.languages },
    { icon: Lock, label: t.value.visibility },
  ];
  const loop = [...items, ...items];

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || prefersReducedMotion()) return;
      const tween = gsap.to(track, {
        xPercent: dir === "rtl" ? 50 : -50,
        duration: 28,
        ease: "none",
        repeat: -1,
      });
      const pause = () => tween.pause();
      const play = () => tween.play();
      track.addEventListener("mouseenter", pause);
      track.addEventListener("mouseleave", play);
      return () => {
        track.removeEventListener("mouseenter", pause);
        track.removeEventListener("mouseleave", play);
      };
    },
    { scope: trackRef, dependencies: [t.value.aiIllustration, dir] },
  );

  return (
    <section
      className="relative overflow-hidden border-y border-border/70 bg-surface/70 backdrop-blur-md dark:bg-surface/40"
      aria-label={t.value.title}
    >
      <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-16 bg-gradient-to-r from-canvas to-transparent rtl:bg-gradient-to-l sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 bg-gradient-to-l from-canvas to-transparent rtl:bg-gradient-to-r sm:w-24" />
      <div className="py-5">
        <div ref={trackRef} className="flex w-max gap-3 px-4">
          {loop.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="flex items-center gap-2.5 rounded-full border border-border bg-elevated/80 px-4 py-2 text-sm font-medium text-copy-rhythm text-fg-muted shadow-[0_8px_24px_rgba(61,46,35,0.05)]"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-brand-500/10 text-brand-700">
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
