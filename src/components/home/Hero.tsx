import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Compass } from "lucide-react";
import { Button } from "../ui/Button";
import { Eyebrow } from "./SectionHeading";
import { useLanguage } from "../../i18n";
import { useAuth } from "../../hooks/useAuth";

const Hero3DLazy = lazy(() => import("../three/Hero3D"));

export function Hero() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const syncViewport = () => setIsCompact(window.innerWidth < 640);
    syncViewport();

    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const goCreate = () => navigate(isAuthenticated ? "/create" : "/register");

  return (
    <section className="relative h-[calc(100vh-4rem)] h-[calc(100svh-4rem)] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(168,95,62,0.12),_transparent_30%),linear-gradient(180deg,rgba(245,235,221,0.96),rgba(239,225,207,0.92))] dark:bg-[radial-gradient(circle_at_top,_rgba(168,95,62,0.2),_transparent_28%),linear-gradient(180deg,rgba(24,20,17,0.98),rgba(36,30,26,0.97))]">
      <div className="hero-aurora absolute inset-0" aria-hidden />
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-4 px-4 py-3 sm:gap-10 sm:px-6 sm:py-10 lg:grid-cols-[11fr_9fr] lg:px-8 lg:py-18">
        <div className="mx-auto max-w-xl text-center sm:mx-0 sm:text-start">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Eyebrow>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5" aria-hidden />
                {t.hero.badge}
              </span>
            </Eyebrow>
          </motion.div>

          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="mt-4 font-display text-[2.1rem] font-semibold leading-[0.95] tracking-[-0.045em] text-fg sm:mt-5 sm:text-5xl sm:leading-[0.92] lg:text-[5.25rem]"
          >
            <span className="block">Turn your stories into</span>
            <span className="mt-1 block">
              <span className="relative inline-block px-2 py-1 text-brand-700 sm:px-3">
                <span
                  className="absolute -left-3 top-1/2 h-px w-3 -translate-y-1/2 bg-border-strong sm:-left-8 sm:w-7"
                  aria-hidden
                />
                <span className="font-display italic tracking-[-0.04em]">
                  worlds.
                </span>
                <span
                  className="absolute -right-3 top-1/2 h-px w-3 -translate-y-1/2 bg-border-strong sm:-right-8 sm:w-7"
                  aria-hidden
                />
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mx-auto mt-4 max-w-lg text-[0.96rem] leading-relaxed text-fg-muted sm:mx-0 sm:mt-6 sm:text-base lg:text-lg"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mt-6 flex w-full flex-col justify-center gap-3 sm:mt-8 sm:flex-row sm:justify-start"
          >
            <Button
              size="lg"
              fullWidth
              className="sm:w-auto"
              onClick={goCreate}
            >
              {t.hero.createStory}
            </Button>
            <Button
              size="lg"
              fullWidth
              variant="outline"
              className="sm:w-auto"
              onClick={() => navigate("/explore")}
            >
              <Compass className="size-5" aria-hidden />
              {t.hero.exploreStories}
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.14 }}
          className="relative mt-1 h-[15rem] sm:mt-0 sm:h-[24rem] lg:h-[32rem]"
          key={isCompact ? "mobile" : "desktop"}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <div
              className="size-48 rounded-full bg-brand-500/12 blur-3xl"
              aria-hidden
            />
          </div>
          <div
            className="relative h-full w-full overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,250,244,0.2),rgba(243,234,219,0.1))] dark:bg-[linear-gradient(135deg,rgba(36,30,26,0.55),rgba(26,20,16,0.35))]"
            dir="ltr"
          >
            <div className="absolute inset-x-6 top-5 flex flex-col items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-fg-faint/80 sm:inset-x-8 sm:top-6 sm:flex-row sm:justify-between sm:text-[0.62rem] sm:tracking-[0.25em]">
              <span>StoryForge</span>
              <span>Ancient Egypt</span>
            </div>
            <div className="relative h-full w-full overflow-hidden rounded-[1.8rem] bg-[radial-gradient(circle_at_70%_20%,rgba(199,155,75,0.12),transparent_27%),linear-gradient(135deg,#faefe1,#f1e2cf)] dark:bg-[radial-gradient(circle_at_70%_20%,rgba(199,155,75,0.1),transparent_27%),linear-gradient(135deg,#241e1a,#1d1814)]">
              <div
                className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#f6e7d0] to-transparent dark:from-[#26201b]"
                aria-hidden
              />
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
        </motion.div>
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
