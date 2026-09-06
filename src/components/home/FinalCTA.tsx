import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Magnetic, Reveal } from "../motion/Reveal";
import { useLanguage } from "../../i18n";
import { useAuth } from "../../hooks/useAuth";

export function FinalCTA() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="hero-aurora absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-[2.2rem] border border-border bg-surface/80 px-6 py-14 text-center shadow-[0_30px_80px_rgba(55,38,24,0.08)] sm:px-12">
            <h2 className="font-display text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-fg sm:text-5xl">
              <span className="text-gradient">{t.finalCta.title}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-fg-muted">{t.brand.tagline}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Magnetic>
                <Button
                  size="lg"
                  className="rounded-full"
                  onClick={() => navigate(isAuthenticated ? "/create" : "/register")}
                >
                  {t.hero.createStory}
                </Button>
              </Magnetic>
              <Magnetic>
                <Button size="lg" variant="outline" className="rounded-full" onClick={() => navigate("/explore")}>
                  {t.hero.exploreStories}
                </Button>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
