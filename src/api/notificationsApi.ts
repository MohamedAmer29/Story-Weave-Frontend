import { api } from "./axios";
import type { NotificationItem, PaginationMeta } from "./types";

export interface NotificationsResponse {
  data: NotificationItem[];
  unreadCount: number;
  meta: PaginationMeta & { hasNextPage: boolean; hasPreviousPage: boolean };
}

export const notificationsApi = {
  list: (params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) =>
    api.get<NotificationsResponse>("/notifications", { params }).then((r) => r.data),

  unreadCount: () =>
    api.get<{ unreadCount: number }>("/notifications/unread-count").then((r) => r.data.unreadCount),

  markAsRead: (id: string) =>
    api.patch<NotificationItem>(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () =>
    api.patch<{ updated: number }>("/notifications/read-all").then((r) => r.data),

  remove: (id: string) => api.delete(`/notifications/${id}`),
};