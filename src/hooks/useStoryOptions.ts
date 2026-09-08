import { useQuery } from "@tanstack/react-query";
import { storyOptionsApi } from "../api/storyOptionsApi";
import type { StoryOption } from "../api/types";
import { useAuth } from "./useAuth";
import {
  legacyPlaceholders,
  toCatalogOption,
  type CatalogOption,
} from "../lib/storyCatalog";

export const STORY_OPTIONS_KEYS = {
  genres: ["story-options", "genres"] as const,
  eras: ["story-options", "eras"] as const,
  civilizations: ["story-options", "civilizations"] as const,
};

function useEnabled() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/** Active story genres for form dropdowns. */
export function useStoryGenres() {
  const enabled = useEnabled();
  return useQuery({
    queryKey: STORY_OPTIONS_KEYS.genres,
    queryFn: () => storyOptionsApi.getGenres(false),
    enabled,
    refetchOnMount: "always",
  });
}

/** Active story eras for form dropdowns. */
export function useStoryEras() {
  const enabled = useEnabled();
  return useQuery({
    queryKey: STORY_OPTIONS_KEYS.eras,
    queryFn: () => storyOptionsApi.getEras(false),
    enabled,
    refetchOnMount: "always",
  });
}

/** Active story civilizations for form dropdowns. */
export function useStoryCivilizations() {
  const enabled = useEnabled();
  return useQuery({
    queryKey: STORY_OPTIONS_KEYS.civilizations,
    queryFn: () => storyOptionsApi.getCivilizations(false),
    enabled,
    refetchOnMount: "always",
  });
}

function toOptions(items?: StoryOption[]) {
  return (items ?? []).map((item) => ({
    id: item.id,
    value: item.id,
    label: item.name,
  }));
}

/** Convenience option lists (id-value) for the three catalogs. */
export function useStoryGenreOptions() {
  const { data, ...rest } = useStoryGenres();
  return { options: toOptions(data), data, ...rest };
}

export function useStoryEraOptions() {
  const { data, ...rest } = useStoryEras();
  return { options: toOptions(data), data, ...rest };
}

export function useStoryCivilizationOptions() {
  const { data, ...rest } = useStoryCivilizations();
  return { options: toOptions(data), data, ...rest };
}

/** Catalog options with a legacy fallback list for the "catalog unavailable" case. */
export function useCatalogs(
  queries: {
    genres: { data?: StoryOption[]; isLoading: boolean; isError: boolean };
    eras: { data?: StoryOption[]; isLoading: boolean; isError: boolean };
    civilizations: {
      data?: StoryOption[];
      isLoading: boolean;
      isError: boolean;
    };
  },
  legacy: { genres: string[]; eras: string[] },
): {
  genres: CatalogOption[];
  eras: CatalogOption[];
  civilizations: CatalogOption[];
  genresFallback: boolean;
  erasFallback: boolean;
  civilizationsFallback: boolean;
  loading: boolean;
} {
  const genresFallback = queries.genres.isError;
  const erasFallback = queries.eras.isError;
  const civilizationsFallback = queries.civilizations.isError;

  return {
    genres: genresFallback
      ? legacyPlaceholders(legacy.genres, [])
      : (queries.genres.data ?? []).map(toCatalogOption),
    eras: erasFallback
      ? legacyPlaceholders(legacy.eras, [])
      : (queries.eras.data ?? []).map(toCatalogOption),
    civilizations: civilizationsFallback
      ? legacyPlaceholders([], [])
      : (queries.civilizations.data ?? []).map(toCatalogOption),
    genresFallback,
    erasFallback,
    civilizationsFallback,
    loading:
      queries.genres.isLoading ||
      queries.eras.isLoading ||
      queries.civilizations.isLoading,
  };
}
