import { Hero } from "../components/home/Hero";
import { ValueStrip } from "../components/home/ValueStrip";
import { HowItWorks } from "../components/home/HowItWorks";
import { ExploreStories } from "../components/home/ExploreStories";
import { Features } from "../components/home/Features";
import { StoryContext } from "../components/home/StoryContext";
import { AIStory } from "../components/home/AIStory";
import { FinalCTA } from "../components/home/FinalCTA";
import { Seo } from "../components/common/Seo";
import { absoluteUrl } from "../lib/seo";
import { useLanguage } from "../i18n";

export function HomePage() {
  const { t, lang } = useLanguage();

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t.brand.name,
    url: absoluteUrl("/"),
    applicationCategory: "WebApplication",
    operatingSystem: "Web",
    description: t.seo.homeDescription,
    inLanguage: lang,
  };

  return (
    <>
      <Seo
        title={t.seo.homeTitle}
        description={t.seo.homeDescription}
        canonical="/"
        keywords={t.seo.homeKeywords}
        ogType="website"
        jsonLd={homeJsonLd}
      />
      <Hero />
      <ValueStrip />
      <HowItWorks />
      <Features />
      <ExploreStories />
      <StoryContext />
      <AIStory />
      <FinalCTA />
    </>
  );
}
