import { api } from "./axios";
import type { PaginatedResponse, StoryLibraryItem } from "./types";

export interface FavouritesQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "latest" | "oldest" | "updated";
}

export const favouritesApi = {
  list: (query: FavouritesQuery = {}) =>
    api
      .get<PaginatedResponse<StoryLibraryItem>>("/stories/favorites", {
        params: query,
      })
      .then((r) => r.data),

  status: (storyId: string) =>
    api
      .get<{ favorited: boolean }>(`/stories/${storyId}/favorite`)
      .then((r) => r.data),

  add: (storyId: string) =>
    api
      .post<{ favorited: boolean }>(`/stories/${storyId}/favorite`)
      .then((r) => r.data),

  remove: (storyId: string) =>
    api
      .delete<{ favorited: boolean }>(`/stories/${storyId}/favorite`)
      .then((r) => r.data),
};