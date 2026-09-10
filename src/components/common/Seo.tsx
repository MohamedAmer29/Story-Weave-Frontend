import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../../i18n";
import { DEFAULT_OG_IMAGE } from "../../config/env";
import {
  absoluteUrl,
  buildCanonicalUrl,
  INDEXABLE_ROBOTS,
  NOINDEX_ROBOTS,
  OG_LOCALE_BY_LANG,
  serializeJsonLd,
  truncate,
} from "../../lib/seo";

export interface SeoProps {
  /** Document/OG/Twitter title. Pages always specify their own. */
  title: string;
  /** Meta description (auto-truncated). Omit for private content. */
  description?: string | null;
  /**
   * Canonical route path (e.g. "/explore" or "/stories/:id"). Defaults to the
   * current pathname (query-insensitive) so every page gets a canonical link.
   */
  canonical?: string;
  /** Search keywords, rendered only when a page provides them. */
  keywords?: string[];
  /** Robots directive. Defaults to index,follow for indexable pages. */
  robots?: string;
  /** Convenience flag: applies "noindex, nofollow" and omits private extras. */
  noIndex?: boolean;
  ogType?: string;
  /** Absolute URL or path; resolves against the configured site URL. */
  ogImage?: string | null;
  ogImageAlt?: string | null;
  twitterCard?: "summary" | "summary_large_image";
  /** Author used only when it is safe to expose publicly. */
  authorName?: string;
  /** ISO date for article:published_time (public stories only). */
  publishedTime?: string;
  /** ISO date for article:modified_time (public stories only). */
  modifiedTime?: string;
  /** Structured data (schema.org JSON-LD). Serialized safely. */
  jsonLd?: object | object[];
  /** Additional Helmet children (rarely needed). */
  children?: ReactNode;
}

export function Seo({
  title,
  description,
  canonical,
  keywords,
  robots,
  noIndex,
  ogType = "website",
  ogImage,
  ogImageAlt,
  twitterCard = "summary_large_image",
  authorName,
  publishedTime,
  modifiedTime,
  jsonLd,
  children,
}: SeoProps) {
  const { t, lang } = useLanguage();
  const location = useLocation();

  const resolvedCanonical = buildCanonicalUrl(canonical ?? location.pathname);
  const metaRobots = noIndex ? NOINDEX_ROBOTS : (robots ?? INDEXABLE_ROBOTS);
  const metaDescription = truncate(description, 200);
  const imageUrl = ogImage
    ? absoluteUrl(ogImage)
    : absoluteUrl(DEFAULT_OG_IMAGE);
  const ogLocale = OG_LOCALE_BY_LANG[lang] ?? "en_US";

  return (
    <Helmet>
      <title>{title}</title>
      {metaDescription && (
        <meta name="description" content={metaDescription} />
      )}
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      <link rel="canonical" href={resolvedCanonical} />
      <meta name="robots" content={metaRobots} />

      <meta property="og:site_name" content={t.brand.name} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      {metaDescription && (
        <meta property="og:description" content={metaDescription} />
      )}
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:locale" content={ogLocale} />
      <meta
        property="og:locale:alternate"
        content={lang === "ar" ? "en_US" : "ar_AR"}
      />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {imageUrl && ogImageAlt && (
        <meta property="og:image:alt" content={ogImageAlt} />
      )}

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      {metaDescription && (
        <meta name="twitter:description" content={metaDescription} />
      )}
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}

      {authorName && <meta name="author" content={authorName} />}
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {!noIndex && (
        <>
          <link rel="alternate" hrefLang="en" href={resolvedCanonical} />
          <link rel="alternate" hrefLang="ar" href={resolvedCanonical} />
          <link rel="alternate" hrefLang="x-default" href={resolvedCanonical} />
        </>
      )}

      {jsonLd && (
        <script type="application/ld+json">{serializeJsonLd(jsonLd)}</script>
      )}

      {children}
    </Helmet>
  );
}