import { api } from "./axios";
import type {
  ApiResponse,
  PaginatedResponse,
  StoryLibraryItem,
  UserProfile,
  UserStats,
} from "./types";

export type Wrapped<T> = ApiResponse<T>;

export type Paginated<T> = PaginatedResponse<T>;

export interface LibraryQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "latest" | "oldest" | "updated";
  status?: string;
  visibility?: string;
  sourceType?: string;
}

export const usersApi = {
  me: () => api.get<Wrapped<UserProfile>>("/users/me").then((r) => r.data),

  updateProfile: (payload: { firstName?: string; lastName?: string; avatarUrl?: string }) =>
    api.patch<Wrapped<UserProfile>>("/users/me", payload).then((r) => r.data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<Wrapped<{ avatarUrl: string; avatarPublicId: string }>>("/users/me/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  myStats: () => api.get<Wrapped<UserStats>>("/users/me/stats").then((r) => r.data),

  myStories: (query: LibraryQuery = {}) =>
    api.get<Paginated<StoryLibraryItem>>("/users/me/stories", { params: query }).then((r) => r.data),

  sharedStories: (query: LibraryQuery = {}) =>
    api
      .get<Paginated<StoryLibraryItem>>("/users/me/shared-stories", { params: query })
      .then((r) => r.data),

  getPublicProfile: (userId: string) =>
    api.get<Wrapped<UserProfile>>(`/users/${userId}/public-profile`).then((r) => r.data),

  getPublicStories: (userId: string, query: LibraryQuery = {}) =>
    api
      .get<Paginated<StoryLibraryItem>>(`/users/${userId}/public-stories`, { params: query })
      .then((r) => r.data),
};