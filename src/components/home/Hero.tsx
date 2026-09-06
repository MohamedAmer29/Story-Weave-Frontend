import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { Sparkles, Compass, ArrowUpRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Eyebrow } from "./SectionHeading";
import { Magnetic } from "../motion/Reveal";
import { useLanguage } from "../../i18n";
import { useAuth } from "../../hooks/useAuth";
import { gsap, prefersReducedMotion, revealEase } from "../../lib/gsap";

const Hero3DLazy = lazy(() => import("../three/Hero3D"));

export function Hero() {
  const { t, dir } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCompact, setIsCompact] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncViewport = () => setIsCompact(window.innerWidth < 640);
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const intro = rootRef.current?.querySelectorAll("[data-hero-intro]");
      if (intro?.length) {
        gsap.fromTo(
          intro,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: revealEase },
        );
      }
      if (visualRef.current) {
        gsap.fromTo(
          visualRef.current,
          { y: 40, scale: 0.96, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 1.1, delay: 0.16, ease: revealEase },
        );
        gsap.to(visualRef.current, {
          y: 10,
          duration: 4.5,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      }
    },
    { scope: rootRef, dependencies: [dir] },
  );

  const goCreate = () => navigate(isAuthenticated ? "/create" : "/register");
  const reducedMotion = prefersReducedMotion();
  const title = t.hero.title.replace(/\.$/, "");
  const lastSpace = title.lastIndexOf(" ");
  const titleLead = lastSpace > 0 ? title.slice(0, lastSpace) : title;
  const titleAccent = lastSpace > 0 ? title.slice(lastSpace + 1) : "";

  return (
    <section
      ref={rootRef}
      className="relative isolate min-h-[calc(100svh-4.5rem)] overflow-hidden"
    >
      <div className="hero-aurora absolute inset-0" aria-hidden />
      <div className="page-grain pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-7xl items-center gap-8 px-4 py-10 sm:gap-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
        <div className="mx-auto max-w-xl text-center sm:mx-0 sm:text-start">
          <div data-hero-intro>
            <Eyebrow>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5" aria-hidden />
                {t.hero.badge}
              </span>
            </Eyebrow>
          </div>

          <h1
            data-hero-intro
            className="mt-5 font-display text-[2.35rem] font-semibold leading-[0.94] text-display-tight text-fg sm:mt-6 sm:text-5xl sm:leading-[0.9] lg:text-[5rem]"
          >
            <span className="block">{titleLead}</span>
            {titleAccent ? (
              <span className="mt-1 block">
                <span className="relative inline-block px-2 py-1 text-brand-700 sm:px-3">
                  <span
                    className="absolute -start-3 top-1/2 h-px w-3 -translate-y-1/2 bg-border-strong sm:-start-8 sm:w-7"
                    aria-hidden
                  />
                  <span className="font-display italic tracking-[-0.04em]">
                    {titleAccent}.
                  </span>
                  <span
                    className="absolute -end-3 top-1/2 h-px w-3 -translate-y-1/2 bg-border-strong sm:-end-8 sm:w-7"
                    aria-hidden
                  />
                </span>
              </span>
            ) : (
              "."
            )}
          </h1>

          <p
            data-hero-intro
            className="mx-auto mt-5 max-w-lg text-[0.98rem] text-copy-rhythm text-fg-muted sm:mx-0 sm:mt-6 sm:text-lg"
          >
            {t.hero.subtitle}
          </p>

          <div
            data-hero-intro
            className="mt-7 flex w-full flex-col justify-center gap-3 sm:mt-9 sm:flex-row sm:justify-start"
          >
            <Magnetic className="w-full sm:w-auto">
              <Button size="lg" fullWidth className="rounded-full sm:w-auto" onClick={goCreate}>
                {t.hero.createStory}
                <ArrowUpRight className="size-4" aria-hidden />
              </Button>
            </Magnetic>
            <Magnetic className="w-full sm:w-auto">
              <Button
                size="lg"
                fullWidth
                variant="outline"
                className="rounded-full sm:w-auto"
                onClick={() => navigate("/explore")}
              >
                <Compass className="size-5" aria-hidden />
                {t.hero.exploreStories}
              </Button>
            </Magnetic>
          </div>
        </div>

        <div
          ref={visualRef}
          className="relative h-[16.5rem] sm:h-[26rem] lg:h-[34rem]"
          key={isCompact ? "mobile" : "desktop"}
        >
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <div className="size-56 rounded-full bg-brand-500/16 blur-3xl" />
          </div>
          <div
            className="relative h-full w-full overflow-hidden rounded-[2.2rem] border border-white/40 shadow-[0_30px_80px_rgba(61,40,24,0.14)] ring-1 ring-black/5 dark:border-white/8 dark:ring-white/5"
            dir="ltr"
          >
            <div className="absolute inset-x-6 top-5 z-10 flex flex-col items-center gap-1.5 text-[0.6rem] font-semibold uppercase text-label-rhythm text-fg-faint/80 sm:inset-x-8 sm:top-6 sm:flex-row sm:justify-between sm:text-[0.62rem] sm:tracking-[0.25em]">
              <span>StoryForge</span>
              <span>Ancient Egypt</span>
            </div>
            <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_70%_20%,rgba(199,155,75,0.12),transparent_27%),linear-gradient(135deg,#faefe1,#f1e2cf)] dark:bg-[radial-gradient(circle_at_70%_20%,rgba(199,155,75,0.1),transparent_27%),linear-gradient(135deg,#241e1a,#1d1814)]">
              <div className="relative h-full w-full" dir="ltr">
                {reducedMotion ? (
                  <StaticBookPreview />
                ) : (
                  <Suspense fallback={<StaticBookPreview />}>
                    <Hero3DLazy key={isCompact ? "mobile" : "desktop"} />
                  </Suspense>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StaticBookPreview() {
  return (
    <div className="flex h-full items-center justify-center" aria-hidden>
      <div className="relative">
        <div className="absolute -inset-5 rounded-full bg-[radial-gradient(circle,rgba(168,95,62,0.22),transparent_62%)] blur-2xl" />
        <div className="relative flex size-44 items-center justify-center rounded-[1.75rem] border border-[#d9b59d] bg-[linear-gradient(135deg,#f8f2ea,#e6d4ba)] shadow-[0_20px_40px_rgba(66,47,36,0.12)] dark:border-border dark:bg-[linear-gradient(135deg,#26201c,#1b1612)]">
          <span className="font-display text-7xl text-brand-700">✦</span>
        </div>
      </div>
    </div>
  );
}
