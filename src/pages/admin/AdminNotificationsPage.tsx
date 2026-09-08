import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BellRing, CheckCheck, Trash2 } from "lucide-react";
import { notificationsApi } from "../../api/notificationsApi";
import type { NotificationItem } from "../../api/types";
import { useNotifications } from "../../hooks/useNotifications";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState, ErrorState } from "../../components/ui/States";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PageLoader } from "../../components/ui/Skeleton";
import { useContentLoading } from "../../layouts/PageLoading";
import { Pagination } from "../../components/ui/Pagination";
import { getErrorMessage } from "../../api/axios";
import { useLanguage } from "../../i18n";
import { cn } from "../../lib/cn";

export function AdminNotificationsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<NotificationItem | null>(null);

  const { data, isLoading, isError, refetch, invalidate } = useNotifications({ page, limit: 10 });

  const invalidateAll = () => {
    invalidate();
    void queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
  };

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      toast.success(t.notifications.allRead);
      invalidateAll();
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: invalidateAll,
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.remove(id),
    onSuccess: () => {
      toast.success(t.notifications.deleted);
      setDeleteTarget(null);
      invalidateAll();
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const openStoryFromNotification = (notif: NotificationItem) => {
    const storyId = notif.data?.storyId;
    if (typeof storyId === "string") {
      void markReadMutation.mutateAsync(notif.id).catch(() => undefined);
      navigate(`/stories/${storyId}`);
    }
  };

  useContentLoading(isLoading);

  if (isLoading) return <div className="mx-auto max-w-3xl px-4 py-16"><PageLoader label={t.common.loading} /></div>;

  return (
    <>
      <Helmet>
        <title>
          {t.nav.notifications} · {t.brand.name}
        </title>
      </Helmet>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">{t.notifications.title}</h1>
            {data?.unreadCount ? (
              <p className="mt-2 text-sm text-fg-muted">
                {data.unreadCount} {t.notifications.unreadCount}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => markAllMutation.mutate()}
              loading={markAllMutation.isPending}
            >
              <CheckCheck className="size-4" aria-hidden />
              {t.notifications.markAllRead}
            </Button>
          </div>
        </div>

        <div className="mt-8">
          {isError ? (
            <ErrorState title={t.common.error} onRetry={() => refetch()} retryLabel={t.common.retry} />
          ) : !data || data.data.length === 0 ? (
            <EmptyState
              icon={<BellRing className="size-6" />}
              title={t.notifications.empty}
              action={
                <Button variant="outline" onClick={() => navigate("/explore")}>
                  {t.nav.explore}
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {data.data.map((notif) => {
                const clickable = typeof notif.data?.storyId === "string";
                return (
                  <li
                    key={notif.id}
                    className={cn(
                      "flex items-start gap-4 rounded-2xl border bg-surface p-4 transition-colors",
                      notif.isRead
                        ? "border-border"
                        : "border-brand-500/30 bg-brand-500/5",
                      clickable && "cursor-pointer hover:border-brand-500/50"
                    )}
                    onClick={clickable ? () => openStoryFromNotification(notif) : undefined}
                    role={clickable ? "button" : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && clickable) openStoryFromNotification(notif);
                    }}
                  >
                    {!notif.isRead && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" aria-label="Unread" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-fg">{notif.title}</h2>
                        <Badge tone="neutral">{notif.type.replace(/_/g, " ").toLowerCase()}</Badge>
                      </div>
                      {notif.message && <p className="mt-1 text-sm text-fg-muted">{notif.message}</p>}
                      <p className="mt-1.5 text-xs text-fg-faint">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!notif.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={t.notifications.markRead}
                          onClick={(e) => {
                            e.stopPropagation();
                            markReadMutation.mutate(notif.id);
                          }}
                        >
                          <CheckCheck className="size-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={t.notifications.delete}
                        className="text-fg-muted hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(notif);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {data && data.data.length > 0 && (
          <Pagination className="mt-8" page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
        )}
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t.notifications.delete}
        message={t.notifications.confirmDeleteMessage}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}