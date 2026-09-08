import type { StoryOption } from "../api/types";

export interface CatalogOption {
  value: string;
  label: string;
  legacyValue: string | null;
}

export interface CatalogEntry {
  id: string;
  legacyValue: string | null;
  name: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True only for real catalog ids (UUIDs), never legacy placeholder values. */
export function isCatalogId(value: string | null | undefined): boolean {
  return Boolean(value && UUID_PATTERN.test(value));
}

export function toCatalogOption(item: StoryOption): CatalogOption {
  return {
    value: item.id,
    label: item.name,
    legacyValue: item.legacyValue ?? null,
  };
}

export function humanize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Converts a raw `value` (catalog id or legacy placeholder) to a display name. */
export function catalogValueLabel(
  value: string,
  loadedOptions: CatalogOption[],
): string {
  if (!value) {
    return "";
  }
  const byValue = loadedOptions.find((o) => o.value === value);
  if (byValue) {
    return byValue.label;
  }
  const byLegacy = loadedOptions.find((o) => o.legacyValue === value);
  if (byLegacy) {
    return byLegacy.label;
  }
  return humanize(value);
}

/** Catalog entry matched from a raw form `value`. */
export function resolveCatalogEntry(
  value: string,
  loadedOptions: CatalogOption[],
  legacyOptions?: CatalogOption[],
): CatalogEntry | null {
  if (!value) {
    return null;
  }
  const pool = [...(legacyOptions ?? []), ...loadedOptions];
  const byValue = pool.find((o) => o.value === value);
  if (byValue) {
    return { id: value, legacyValue: byValue.legacyValue, name: byValue.label };
  }
  const byLegacy = pool.find((o) => o.legacyValue === value);
  if (byLegacy) {
    return {
      id: byLegacy.value,
      legacyValue: byLegacy.legacyValue,
      name: byLegacy.label,
    };
  }
  return null;
}

/** Legacy enum placeholder entries used while the catalog is unavailable. */
export function legacyPlaceholders(
  values: string[],
  existing: CatalogOption[],
): CatalogOption[] {
  return values.map((value) => {
    const match = existing.find((o) => o.legacyValue === value);
    return {
      value,
      label: match ? match.label : humanize(value),
      legacyValue: value,
    };
  });
}

/** Loaded catalog options. Falls back to legacy placeholders on error. */
export function loadCatalogOptions(
  data: StoryOption[] | undefined,
  isLoading: boolean,
  legacyValues: string[],
): { options: CatalogOption[]; isFallback: boolean } {
  if (data && data.length > 0 && !isLoading) {
    return { options: data.map(toCatalogOption), isFallback: false };
  }
  return { options: legacyPlaceholders(legacyValues, []), isFallback: true };
}