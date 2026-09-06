import { API_URL } from "../config/env";

export function resolveImageUrl(src?: string | null) {
  if (!src) return null;
  if (/^(https?:|data:|\/\/)/i.test(src)) return src;
  if (src.startsWith("/")) return `${API_URL}${src}`;
  return src;
}

export function withImageCacheBust(
  src?: string | null,
  version?: string | number | null,
) {
  if (!src) return src;

  const stamp = version ?? Date.now();

  try {
    const url = new URL(src);
    url.searchParams.set("v", String(stamp));
    return url.toString();
  } catch {
    const separator = src.includes("?") ? "&" : "?";
    return `${src}${separator}v=${encodeURIComponent(String(stamp))}`;
  }
}

export function buildResponsiveSrcSet(src?: string | null) {
  if (!src) return undefined;
  return `${src} 1x, ${src} 2x`;
}
