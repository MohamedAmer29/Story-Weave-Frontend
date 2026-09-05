const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl) {
  throw new Error(
    "Missing required environment variable VITE_API_URL. " +
      "Add it to your .env file, for example: VITE_API_URL=http://localhost:3000/api"
  );
}

/** Backend API base URL (from VITE_API_URL). Never hardcode it elsewhere. */
export const API_URL: string = rawApiUrl;

/** Default number of items per page across list endpoints. */
export const DEFAULT_PAGE_SIZE = 12;

export const env = {
  API_URL,
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
} as const;