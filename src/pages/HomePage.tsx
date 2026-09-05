import { Helmet } from "react-helmet-async";
import { Hero } from "../components/home/Hero";
import { ValueStrip } from "../components/home/ValueStrip";
import { HowItWorks } from "../components/home/HowItWorks";
import { Features } from "../components/home/Features";
import { StoryContext } from "../components/home/StoryContext";
import { AIStory } from "../components/home/AIStory";
import { ExploreStories } from "../components/home/ExploreStories";
import { FinalCTA } from "../components/home/FinalCTA";
import { useLanguage } from "../i18n";

export function HomePage() {
  const { t, lang } = useLanguage();
  const metaDescription = lang === "ar" ? t.hero.subtitle : "Turn your stories into worlds.";

  return (
    <>
      <Helmet>
        <title>{t.brand.name}</title>
        <meta name="description" content={metaDescription} />
      </Helmet>
      <Hero />
      <ValueStrip />
      <HowItWorks />
      <Features />
      <StoryContext />
      <AIStory />
      <ExploreStories />
      <FinalCTA />
    </>
  );
}