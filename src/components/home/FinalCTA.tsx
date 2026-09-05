import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { useLanguage } from "../../i18n";
import { useAuth } from "../../hooks/useAuth";

export function FinalCTA() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="hero-aurora absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold leading-tight text-fg sm:text-4xl">
          <span className="text-gradient">{t.finalCta.title}</span>
        </h2>
        <p className="mt-4 text-fg-muted">{t.brand.tagline}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={() => navigate(isAuthenticated ? "/create" : "/register")}>
            {t.hero.createStory}
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/explore")}>
            {t.hero.exploreStories}
          </Button>
        </div>
      </div>
    </section>
  );
}