export function buildResponsiveSrcSet(src?: string | null) {
  if (!src) return undefined;

  try {
    const url = new URL(src);
    const hasFormatParam = url.searchParams.has("format");
    const hasImageExtension = /\.(webp|jpg|jpeg|png|gif|avif|bmp)$/i.test(
      url.pathname,
    );

    if (hasFormatParam || hasImageExtension) {
      return `${src} 1x, ${src} 2x`;
    }

    const withFormat = `${src}${url.search ? "&" : "?"}format=webp`;
    return `${withFormat} 1x, ${withFormat} 2x`;
  } catch {
    const hasFormatParam = src.includes("format=");
    const hasImageExtension = /\.(webp|jpg|jpeg|png|gif|avif|bmp)$/i.test(src);

    if (hasFormatParam || hasImageExtension) {
      return `${src} 1x, ${src} 2x`;
    }

    const withFormat = `${src}${src.includes("?") ? "&" : "?"}format=webp`;
    return `${withFormat} 1x, ${withFormat} 2x`;
  }
}
