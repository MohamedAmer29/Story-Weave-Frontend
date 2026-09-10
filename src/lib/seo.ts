import { SITE_URL } from "../config/env";
import type { StoryVisibility } from "../api/types";

/** `og:locale` values per supported interface language. */
export const OG_LOCALE_BY_LANG: Record<string, string> = {
  en: "en_US",
  ar: "ar_AR",
};

/** Robots directives used across the app. */
export const INDEXABLE_ROBOTS = "index, follow";
export const NOINDEX_ROBOTS = "noindex, nofollow";

/**
 * Resolves a path (or already-absolute URL) against the configured production
 * site URL. Used for canonical URLs, Open Graph image URLs and JSON-LD URLs so
 * the app never emits `localhost` in production metadata.
 */
export function absoluteUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("//")) return `https:${path}`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/** Builds the absolute canonical URL for a router path (query-string safe). */
export function buildCanonicalUrl(pathname: string): string {
  return absoluteUrl(pathname) ?? SITE_URL;
}

/**
 * Whether a given router path is intended to be indexed by search engines.
 * Everything not explicitly listed (dashboard, admin, editor, auth, etc.) is
 * treated as non-indexable.
 */
export function isIndexablePath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (/^\/explore\/?$/.test(pathname)) return true;
  if (/^\/how-it-works\/?$/.test(pathname)) return true;
  if (/^\/about\/?$/.test(pathname)) return true;
  if (/^\/contact\/?$/.test(pathname)) return true;
  if (/^\/privacy\/?$/.test(pathname)) return true;
  if (/^\/terms\/?$/.test(pathname)) return true;
  if (/^\/stories\/[^/]+$/.test(pathname)) return true;
  if (/^\/author\/[^/]+$/.test(pathname)) return true;
  return false;
}

/**
 * Robots directive based on a story's visibility. Only PUBLIC stories are
 * intended to be indexable; PRIVATE, SHARED and MEMBERS stories must never be
 * exposed through SEO metadata.
 */
export function robotsForVisibility(
  visibility?: StoryVisibility | null,
): string {
  return visibility === "PUBLIC" ? INDEXABLE_ROBOTS : NOINDEX_ROBOTS;
}

/**
 * Normalizes free-form text into a compact, safe meta description
 * (whitespace-collapsed, truncated).
 */
export function truncate(
  text: string | null | undefined,
  max = 200,
): string | undefined {
  if (!text) return undefined;
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Serializes JSON-LD to a script-safe string. Escapes `<`, `>`, and `&` so
 * story/user content cannot break out of the `<script>` tag or inject markup.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}