export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function reduceMotion(fallback: boolean): boolean {
  return prefersReducedMotion() ? true : fallback;
}