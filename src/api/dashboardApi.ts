import { api } from "./axios";
import type { AiUsage, DashboardData, PaginationMeta, StoryLibraryItem, UserStats } from "./types";

export const dashboardApi = {
  get: () => api.get<{ success: boolean; data: DashboardData }>("/dashboard").then((r) => r.data.data),
};

export interface AiUsageResponse {
  success: boolean;
  data: AiUsage;
}

export const aiApi = {
  usage: () => api.get<AiUsageResponse>("/ai/usage").then((r) => r.data.data),
  usageStatus: () =>
    api.get<{ allowed: boolean; used: number; limit: number; remaining: number }>("/ai/usage/status").then((r) => r.data),
  testImage: (prompt: string) =>
    api.post<{ success: boolean; message: string; size: number }>("/ai/test-image", { prompt }).then((r) => r.data),
};

export type { UserStats, StoryLibraryItem, PaginationMeta };