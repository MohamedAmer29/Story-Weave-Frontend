import { api } from "./axios";
import type {
  AdminDashboardData,
  AdminStory,
  AdminUser,
  AiUsage,
  PaginationMeta,
  QueueStats,
  SystemHealth,
  UserRole,
} from "./types";

export interface AdminQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  status?: string;
  visibility?: string;
  sourceType?: string;
  userId?: string;
}

export const adminApi = {
  dashboard: () =>
    api.get<{ success: boolean; data: AdminDashboardData }>("/admin/dashboard").then((r) => r.data.data),

  listUsers: (query: AdminQuery = {}) =>
    api
      .get<{ success: boolean; data: AdminUser[]; meta: PaginationMeta }>("/admin/users", { params: query })
      .then((r) => r.data),

  updateUserRole: (id: string, role: UserRole) =>
    api
      .patch<{ success: boolean; data: { id: string; email: string; role: UserRole } }>(
        `/admin/users/${id}/role`,
        { role }
      )
      .then((r) => r.data),

  setUserActive: (id: string, isActive: boolean) =>
    api
      .patch<{ success: boolean; data: { id: string; email: string; isActive: boolean } }>(
        `/admin/users/${id}/active`,
        { isActive }
      )
      .then((r) => r.data),

  listStories: (query: AdminQuery = {}) =>
    api
      .get<{ success: boolean; data: AdminStory[]; meta: PaginationMeta }>("/admin/stories", {
        params: query,
      })
      .then((r) => r.data),

  failedStories: (query: AdminQuery = {}) =>
    api
      .get<{ success: boolean; data: AdminStory[]; meta: PaginationMeta }>("/admin/stories/failed", {
        params: query,
      })
      .then((r) => r.data),

  getStory: (id: string) =>
    api.get<{ success: boolean; data: Record<string, unknown> }>(`/admin/stories/${id}`).then((r) => r.data),

  deleteStory: (id: string) =>
    api.delete<{ success: boolean; message: string; storyId: string }>(`/admin/stories/${id}`).then((r) => r.data),

  retry: (id: string, scope: "page" | "cover" = "page") =>
    api
      .post<{ success: boolean; message: string; storyId: string }>(
        `/admin/stories/${id}/retry?scope=${scope}`
      )
      .then((r) => r.data),

  queueStats: () =>
    api.get<{ success: boolean; data: QueueStats }>("/admin/system/queue").then((r) => r.data.data),

  health: () =>
    api.get<{ success: boolean; data: SystemHealth }>("/admin/system/health").then((r) => r.data.data),

  aiUsage: () =>
    api.get<{ success: boolean; data: AiUsage }>("/admin/system/ai-usage").then((r) => r.data.data),

  resetAiUsage: () =>
    api.post<{ success: boolean; message: string }>("/admin/system/ai-usage/reset").then((r) => r.data),
};