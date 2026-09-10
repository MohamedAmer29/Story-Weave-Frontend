const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl) {
  throw new Error(
    "Missing required environment variable VITE_API_URL. " +
      "Add it to your .env file, for example: VITE_API_URL=http://localhost:3000/api"
  );
}

/** Backend API base URL (from VITE_API_URL). Never hardcode it elsewhere. */
export const API_URL: string = rawApiUrl;

/**
 * Production public origin used for canonical URLs, Open Graph image URLs and
 * JSON-LD. Override with VITE_SITE_URL (e.g. https://storyforge.example).
 * Falls back to the browser origin at runtime so canonical metadata is always
 * valid even locally or when the app is served from a different host.
 */
export const SITE_URL: string = (import.meta.env.VITE_SITE_URL as
  | string
  | undefined)?.trim()
  ? String(import.meta.env.VITE_SITE_URL).trim().replace(/\/+$/, "")
  : typeof window !== "undefined"
    ? window.location.origin
    : "";

/**
 * Default Open Graph / Twitter image used when a page (or public story) has no
 * specific image. Override with VITE_DEFAULT_OG_IMAGE (absolute URL or path).
 */
export const DEFAULT_OG_IMAGE: string = (
  import.meta.env.VITE_DEFAULT_OG_IMAGE as string | undefined
)?.trim()
  ? String(import.meta.env.VITE_DEFAULT_OG_IMAGE).trim()
  : "/og-image.png";

/** Default number of items per page across list endpoints. */
export const DEFAULT_PAGE_SIZE = 12;

export const env = {
  API_URL,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
} as const;