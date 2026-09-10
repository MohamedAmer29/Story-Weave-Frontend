import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Search, Trash2 } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { Input, Select } from "../../components/ui/field";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { Pagination } from "../../components/ui/Pagination";
import { Modal } from "../../components/ui/Modal";
import { getErrorMessage } from "../../api/axios";
import { useLanguage } from "../../i18n";

export function AdminStoriesTab() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const query = useQuery({
    queryKey: ["admin", "stories", { page, search, status }],
    queryFn: () =>
      adminApi.listStories({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteStory(id),
    onSuccess: () => {
      toast.success(t.library.deleted);
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["admin", "stories"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const stories = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-fg">{t.admin.storiesTable}</h2>
      </div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-faint"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t.explore.searchPlaceholder}
            className="ps-10"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="sm:w-40"
        >
          <option value="">{t.library.status}</option>
          <option value="DRAFT">{t.status.DRAFT}</option>
          <option value="PROCESSING">{t.status.PROCESSING}</option>
          <option value="READY">{t.status.READY}</option>
          <option value="FAILED">{t.status.FAILED}</option>
        </Select>
      </div>

      {query.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-fg-faint">
                <th className="px-4 py-3 text-start font-semibold">
                  {t.create.storyTitle}
                </th>
                <th className="px-4 py-3 text-start font-semibold">
                  {t.library.status}
                </th>
                <th className="px-4 py-3 text-start font-semibold">
                  {t.library.visibility}
                </th>
                <th className="px-4 py-3 text-start font-semibold">Owner</th>
                <th className="px-4 py-3 text-end font-semibold">
                  {"Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => (
                <tr
                  key={story.id}
                  className="border-b border-border last:border-0 hover:bg-surface-2/60"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/stories/${story.id}`}
                      className="font-medium text-fg hover:text-brand-600"
                    >
                      {story.title}
                    </Link>
                    <p className="text-xs text-fg-muted">{story.sourceType}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        story.status === "READY"
                          ? "success"
                          : story.status === "FAILED"
                            ? "danger"
                            : story.status === "PROCESSING"
                              ? "warning"
                              : "neutral"
                      }
                      dot={story.status === "PROCESSING"}
                    >
                      {t.status[story.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        story.visibility === "PUBLIC"
                          ? "brand"
                          : story.visibility === "SHARED" ||
                              story.visibility === "MEMBERS"
                            ? "info"
                            : "neutral"
                      }
                    >
                      {t.status[story.visibility]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-fg">
                      {story.owner?.name ?? "—"}
                    </p>
                    <p className="text-xs text-fg-muted">
                      {story.owner?.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-fg-muted hover:text-red-600"
                      onClick={() =>
                        setDeleteTarget({ id: story.id, title: story.title })
                      }
                      aria-label={`${t.library.delete}: ${story.title}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        className="mt-6"
        page={page}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={setPage}
      />

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={t.library.confirmDelete}
      >
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            {t.common.cancel}
          </Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={() =>
              deleteTarget && deleteMutation.mutate(deleteTarget.id)
            }
          >
            {t.common.delete}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
