import { api } from "./axios";
import type {
  CreateStoryInput,
  IllustrationStatus,
  PaginationMeta,
  ShareEntry,
  StoryDetails,
  StoryLibraryItem,
  StoryResponse,
  StoryVisibility,
  UpdateStoryInput,
} from "./types";

export interface PaginatedStories {
  success?: boolean;
  data: StoryLibraryItem[] | StoryResponse[];
  meta: PaginationMeta;
}

export interface PublicStoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "latest" | "oldest" | "updated";
}

export interface StoryQuery extends PublicStoryQuery {
  status?: string;
  sourceType?: string;
  visibility?: string;
}

export interface StoryTypesResponse {
  types: string[];
}

export const storiesApi = {
  getAll: (query: StoryQuery = {}) =>
    api.get<PaginatedStories>("/stories", { params: query }).then((r) => r.data),

  searchPublic: (query: { q: string; page?: number; limit?: number }) =>
    api.get<PaginatedStories>("/stories/public/search", { params: query }).then((r) => r.data),

  getTypes: () =>
    api.get<StoryTypesResponse>("/stories/types").then((r) => r.data),
  create: (payload: CreateStoryInput) =>
    api.post<StoryResponse>("/stories", payload).then((r) => r.data),

  update: (id: string, payload: UpdateStoryInput) =>
    api.patch<StoryResponse>(`/stories/${id}`, payload).then((r) => r.data),

  remove: (id: string) => api.delete(`/stories/${id}`),

  get: (id: string) => api.get<StoryDetails>(`/stories/${id}`).then((r) => r.data),

  myStories: (query: StoryQuery = {}) =>
    api.get<PaginatedStories & { data: StoryLibraryItem[] }>("/stories/my", { params: query }).then((r) => r.data),

  sharedStories: (query: StoryQuery = {}) =>
    api.get<PaginatedStories & { data: StoryLibraryItem[] }>("/stories/shared", { params: query }).then((r) => r.data),

  publicStories: (query: PublicStoryQuery = {}) =>
    api.get<PaginatedStories>("/stories/public", { params: query }).then((r) => r.data),

  updateVisibility: (id: string, visibility: StoryVisibility) =>
    api.patch<StoryResponse>(`/stories/${id}/visibility`, { visibility }).then((r) => r.data),

  share: (id: string, userId: string) =>
    api.post<{ success: boolean; message: string }>(`/stories/${id}/share`, { userId }).then((r) => r.data),

  revokeShare: (id: string, targetUserId: string) =>
    api.delete(`/stories/${id}/share/${targetUserId}`),

  shareEntries: (id: string) =>
    api.get<{ success: boolean; data: ShareEntry[] }>(`/stories/${id}/shares`).then((r) => r.data),

  uploadPdf: (file: File, context: Partial<CreateStoryInput>) => {
    const form = new FormData();
    form.append("file", file);
    form.append("storyType", context.storyType ?? "FANTASY");
    if (context.visualStyle) form.append("visualStyle", context.visualStyle);
    if (context.language) form.append("language", context.language);
    if (context.era) form.append("era", context.era);
    if (context.year) form.append("year", String(context.year));
    if (context.location) form.append("location", context.location);
    if (context.civilization) form.append("civilization", context.civilization);
    if (context.customCivilization) form.append("customCivilization", context.customCivilization);
    if (context.theme) form.append("theme", context.theme);
    if (context.customTheme) form.append("customTheme", context.customTheme);
    return api
      .post<StoryResponse>("/stories/upload-pdf", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};

export const illustrationApi = {
  generate: (storyId: string, regenerate = false) =>
    api
      .post<{ success: boolean; message: string; storyId: string; totalPages: number; queuedPages: number }>(
        `/stories/${storyId}/generate-illustrations`,
        { regenerate }
      )
      .then((r) => r.data),

  regeneratePage: (storyId: string, pageId: string) =>
    api
      .post<{ success: boolean; message: string; pageId: string }>(
        `/stories/${storyId}/pages/${pageId}/regenerate`
      )
      .then((r) => r.data),

  regenerateCover: (storyId: string) =>
    api
      .post<{ success: boolean; message: string; storyId: string }>(
        `/stories/${storyId}/cover/regenerate`
      )
      .then((r) => r.data),

  status: (storyId: string) =>
    api
      .get<{ success: boolean; data: IllustrationStatus }>(`/stories/${storyId}/illustrations/status`)
      .then((r) => r.data.data),
};