import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../api/notificationsApi";
import { useAuth } from "./useAuth";

const UNREAD_KEY = ["notifications", "unread-count"] as const;

export function useUnreadCount() {
  const { isAuthenticated, user } = useAuth();
  return useQuery({
    queryKey: [...UNREAD_KEY, user?.id],
    queryFn: notificationsApi.unreadCount,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
}

export function useNotifications(params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", params, user?.id],
    queryFn: () => notificationsApi.list(params),
    enabled: isAuthenticated,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  return { ...query, invalidate };
}