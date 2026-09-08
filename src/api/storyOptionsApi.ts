import { api } from "./axios";
import type { StoryOption } from "./types";

export const storyOptionsApi = {
  getGenres: (includeInactive = false) =>
    api
      .get<StoryOption[]>("/story-options/genres", {
        params: includeInactive ? { includeInactive: "true" } : undefined,
      })
      .then((r) => r.data),
  getEras: (includeInactive = false) =>
    api
      .get<StoryOption[]>("/story-options/eras", {
        params: includeInactive ? { includeInactive: "true" } : undefined,
      })
      .then((r) => r.data),
  getCivilizations: (includeInactive = false) =>
    api
      .get<StoryOption[]>("/story-options/civilizations", {
        params: includeInactive ? { includeInactive: "true" } : undefined,
      })
      .then((r) => r.data),

  createGenre: (payload: CreateStoryOptionInput) =>
    api.post<StoryOption>("/story-options/genres", payload).then((r) => r.data),
  createEra: (payload: CreateStoryOptionInput) =>
    api.post<StoryOption>("/story-options/eras", payload).then((r) => r.data),
  createCivilization: (payload: CreateStoryOptionInput) =>
    api
      .post<StoryOption>("/story-options/civilizations", payload)
      .then((r) => r.data),

  updateGenre: (id: string, payload: UpdateStoryOptionInput) =>
    api
      .patch<StoryOption>(`/story-options/genres/${id}`, payload)
      .then((r) => r.data),
  updateEra: (id: string, payload: UpdateStoryOptionInput) =>
    api
      .patch<StoryOption>(`/story-options/eras/${id}`, payload)
      .then((r) => r.data),
  updateCivilization: (id: string, payload: UpdateStoryOptionInput) =>
    api
      .patch<StoryOption>(`/story-options/civilizations/${id}`, payload)
      .then((r) => r.data),

  deactivateGenre: (id: string) =>
    api
      .delete<StoryOption>(`/story-options/genres/${id}`)
      .then((r) => r.data),
  deactivateEra: (id: string) =>
    api
      .delete<StoryOption>(`/story-options/eras/${id}`)
      .then((r) => r.data),
  deactivateCivilization: (id: string) =>
    api
      .delete<StoryOption>(`/story-options/civilizations/${id}`)
      .then((r) => r.data),
};

export interface CreateStoryOptionInput {
  name: string;
  description?: string;
  legacyValue?: string;
}

export interface UpdateStoryOptionInput {
  name?: string;
  description?: string;
  isActive?: boolean;
}