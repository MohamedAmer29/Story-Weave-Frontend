import { api } from "./axios";
import type {
  CreateStoryInput,
  IllustrationStatus,
  PaginationMeta,
  ShareEntry,
  StoryDetails,
  StoryLibraryItem,
  StoryResponse,
  StoryType,
  SourceType,
  StoryVisibility,
  UpdateStoryInput,
  VisualContextOverrides,
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
  storyType?: StoryType;
  sourceType?: SourceType;
}

export interface StoryQuery extends PublicStoryQuery {
  status?: string;
  visibility?: string;
}

export interface StoryTypesResponse {
  types: string[];
}

export interface AppendStoryResponse {
  success: boolean;
  message: string;
  storyId: string;
  pagesCreated: number;
  pagesUpdated: number;
  pagesRegenerationRequired: number;
  generationQueued: boolean;
}

export const storiesApi = {
  getAll: (query: StoryQuery = {}) =>
    api
      .get<PaginatedStories>("/stories", { params: query })
      .then((r) => r.data),

  searchPublic: (query: {
    search: string;
    page?: number;
    limit?: number;
    sort?: "latest" | "oldest" | "updated";
  }) =>
    api
      .get<PaginatedStories>("/stories/public/search", { params: query })
      .then((r) => r.data),

  getTypes: () =>
    api.get<StoryTypesResponse>("/stories/types").then((r) => r.data),
  create: (payload: CreateStoryInput) =>
    api.post<StoryResponse>("/stories", payload).then((r) => r.data),

  update: (id: string, payload: UpdateStoryInput) =>
    api.patch<StoryResponse>(`/stories/${id}`, payload).then((r) => r.data),

  remove: (id: string) => api.delete(`/stories/${id}`),

  get: (id: string) =>
    api.get<StoryDetails>(`/stories/${id}`).then((r) => r.data),

  getPages: (id: string) =>
    api.get<StoryPageResponse[]>(`/stories/${id}/pages`).then((r) => r.data),
  append: (id: string, input: { content?: string; file?: File }) => {
    const form = new FormData();
    if (input.content) form.append("content", input.content);
    if (input.file) form.append("file", input.file);
    return api
      .post<AppendStoryResponse>(`/stories/${id}/append`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  updatePage: (storyId: string, pageId: string, content: string) =>
    api.patch<StoryPageResponse[]>(`/stories/${storyId}/pages/${pageId}`, { content }).then((r) => r.data),
  deletePage: (storyId: string, pageId: string) =>
    api.delete(`/stories/${storyId}/pages/${pageId}`),
  reorderPages: (storyId: string, pageIds: string[]) =>
    api.patch<StoryPageResponse[]>(`/stories/${storyId}/pages/reorder`, { pageIds }).then((r) => r.data),

  myStories: (query: StoryQuery = {}) =>
    api
      .get<
        PaginatedStories & { data: StoryLibraryItem[] }
      >("/stories/my", { params: query })
      .then((r) => r.data),

  sharedStories: (query: StoryQuery = {}) =>
    api
      .get<
        PaginatedStories & { data: StoryLibraryItem[] }
      >("/stories/shared", { params: query })
      .then((r) => r.data),

  publicStories: (query: PublicStoryQuery = {}) =>
    api
      .get<PaginatedStories>("/stories/public", { params: query })
      .then((r) => r.data),

  updateVisibility: (id: string, visibility: StoryVisibility) =>
    api
      .patch<StoryResponse>(`/stories/${id}/visibility`, { visibility })
      .then((r) => r.data),

  share: (id: string, email: string) =>
    api
      .post<{
        success: boolean;
        message: string;
      }>(`/stories/${id}/share`, { email })
      .then((r) => r.data),

  revokeShare: (id: string, targetUserId: string) =>
    api.delete(`/stories/${id}/share/${targetUserId}`),

  shareEntries: (id: string) =>
    api
      .get<{ success: boolean; data: ShareEntry[] }>(`/stories/${id}/shares`)
      .then((r) => r.data),

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
    if (context.customCivilization)
      form.append("customCivilization", context.customCivilization);
    if (context.theme) form.append("theme", context.theme);
    if (context.customTheme) form.append("customTheme", context.customTheme);
    return api
      .post<StoryResponse>("/stories/upload-pdf", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};

export interface StoryPageResponse {
  id: string;
  pageNumber: number;
  content: string;
  imageUrl: string | null;
  imageStatus: string | null;
  generationError: string | null;
  createdAt: string;
  updatedAt: string;
}

export const illustrationApi = {
  generate: (storyId: string, regenerate = false) =>
    api
      .post<{
        success: boolean;
        message: string;
        storyId: string;
        totalPages: number;
        queuedPages: number;
      }>(`/stories/${storyId}/generate-illustrations`, { regenerate })
      .then((r) => r.data),

  illustrateRemaining: (storyId: string) =>
    api
      .post<{
        success: boolean;
        message: string;
        storyId: string;
        totalPages: number;
        alreadyIllustrated: number;
        pagesQueued: number;
        pagesDeferred?: number;
        generationStarted: boolean;
        reason?: string;
      }>(`/stories/${storyId}/illustrate-remaining`)
      .then((r) => r.data),

  regeneratePage: (
    storyId: string,
    pageId: string,
    overrides: VisualContextOverrides = {},
  ) =>
    api
      .post<{
        success: boolean;
        message: string;
        pageId: string;
      }>(`/stories/${storyId}/pages/${pageId}/regenerate`, overrides)
      .then((r) => r.data),

  regenerateCover: (storyId: string, overrides: VisualContextOverrides = {}) =>
    api
      .post<{
        success: boolean;
        message: string;
        storyId: string;
      }>(`/stories/${storyId}/cover/regenerate`, overrides)
      .then((r) => r.data),

  status: (storyId: string) =>
    api
      .get<{
        success: boolean;
        data: IllustrationStatus;
      }>(`/stories/${storyId}/illustrations/status`)
      .then((r) => r.data.data),
};
