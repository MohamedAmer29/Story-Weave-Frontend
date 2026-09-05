import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Plus, Search, Trash2, BookOpen } from "lucide-react";
import { usersApi } from "../api/usersApi";
import { storiesApi } from "../api/storiesApi";
import type { StoryType } from "../api/types";
import { StoryCard } from "../components/home/StoryCard";
import { SkeletonGrid } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/States";
import { Input, Select } from "../components/ui/field";
import { Button } from "../components/ui/Button";
import { Pagination } from "../components/ui/Pagination";
import { Modal } from "../components/ui/Modal";
import { getErrorMessage } from "../api/axios";
import { useLanguage } from "../i18n";
import { cn } from "../lib/cn";

type Tab = "mine" | "shared";

export function LibraryPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("mine");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [visibility, setVisibility] = useState("");
  const [storyType, setStoryType] = useState<"" | StoryType>("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const mineQuery = useQuery({
    queryKey: ["library", "mine", { page, search, status, visibility, storyType }],
    queryFn: () =>
      storiesApi.myStories({
        page,
        limit: 9,
        search: search || undefined,
        status: status || undefined,
        visibility: visibility || undefined,
        sourceType: storyType || undefined,
      }),
    enabled: tab === "mine",
  });

  const sharedQuery = useQuery({
    queryKey: ["library", "shared", { page, search }],
    queryFn: () => usersApi.sharedStories({ page, limit: 9, search: search || undefined }),
    enabled: tab === "shared",
  });

  const activeQuery = tab === "mine" ? mineQuery : sharedQuery;
  const stories = activeQuery.data?.data ?? [];
  const meta = activeQuery.data?.meta;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => storiesApi.remove(id),
    onSuccess: () => {
      toast.success(t.library.deleted);
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["library"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setVisibility("");
    setStoryType("");
    setPage(1);
  };

  const filtersActive = Boolean(search || status || visibility || storyType);

  return (
    <>
      <Helmet>
        <title>
          {t.library.title} · {t.brand.name}
        </title>
      </Helmet>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">{t.library.title}</h1>
            <p className="mt-2 text-fg-muted">{t.library.subtitle}</p>
          </div>
          <Button onClick={() => navigate("/create")}>
            <Plus className="size-4" aria-hidden />
            {t.nav.createStory}
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex rounded-lg border border-border bg-surface p-1" role="tablist" aria-label="Library tabs">
            <button
              role="tab"
              aria-selected={tab === "mine"}
              onClick={() => {
                setTab("mine");
                setPage(1);
              }}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                tab === "mine" ? "bg-brand-600 text-white" : "text-fg-muted hover:text-fg"
              )}
            >
              {t.library.title}
            </button>
            <button
              role="tab"
              aria-selected={tab === "shared"}
              onClick={() => {
                setTab("shared");
                setPage(1);
              }}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                tab === "shared" ? "bg-brand-600 text-white" : "text-fg-muted hover:text-fg"
              )}
            >
              {t.library.sharedTitle}
            </button>
          </div>

          <div className="relative flex-1">
            <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-faint" aria-hidden />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t.library.searchPlaceholder}
              aria-label={t.library.searchPlaceholder}
              className="ps-10"
            />
          </div>

          {tab === "mine" && (
            <>
              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                aria-label={t.library.status}
                className="lg:w-44"
              >
                <option value="">{t.library.status}</option>
                {(["DRAFT", "PROCESSING", "READY", "FAILED"] as const).map((s) => (
                  <option key={s} value={s}>
                    {t.status[s]}
                  </option>
                ))}
              </Select>
              <Select
                value={visibility}
                onChange={(e) => {
                  setVisibility(e.target.value);
                  setPage(1);
                }}
                aria-label={t.library.visibility}
                className="lg:w-40"
              >
                <option value="">{t.library.visibility}</option>
                {(["PUBLIC", "PRIVATE", "SHARED"] as const).map((v) => (
                  <option key={v} value={v}>
                    {t.status[v]}
                  </option>
                ))}
              </Select>
              <Select
                value={storyType}
                onChange={(e) => {
                  setStoryType(e.target.value as "" | StoryType);
                  setPage(1);
                }}
                aria-label={t.create.storyType}
                className="lg:w-44"
              >
                <option value="">{t.create.storyType}</option>
                {(["FANTASY", "ADVENTURE", "SCI_FI", "MYSTERY", "HORROR", "ROMANCE", "COMEDY", "DRAMA", "HISTORICAL", "FAIRY_TALE", "CHILDREN", "ACTION", "THRILLER"] as const).map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
            </>
          )}
        </div>

        <div className="mt-8">
          {activeQuery.isLoading ? (
            <SkeletonGrid count={6} />
          ) : activeQuery.isError ? (
            <EmptyState title={t.explore.error} action={<Button onClick={() => activeQuery.refetch()}>{t.common.retry}</Button>} />
          ) : stories.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="size-6" />}
              title={tab === "mine" ? t.library.empty : t.library.sharedEmpty}
              description={tab === "mine" ? t.library.emptyHint : undefined}
              action={
                filtersActive ? (
                  <Button variant="outline" onClick={resetFilters}>
                    {t.library.clearFilters}
                  </Button>
                ) : tab === "mine" ? (
                  <Button onClick={() => navigate("/create")}>{t.nav.createStory}</Button>
                ) : undefined
              }
            />
          ) : (
            <>
              {filtersActive && (
                <button onClick={resetFilters} className="mb-4 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
                  {t.library.clearFilters}
                </button>
              )}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stories.map((story) => (
                  <div key={story.id} className="relative">
                    <StoryCard
                      story={story}
                      footer={
                        tab === "mine" ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget({ id: story.id, title: story.title })}
                              aria-label={`${t.library.delete}: ${story.title}`}
                              className="text-fg-muted hover:text-red-600 dark:hover:text-red-400"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                            <Button size="sm" onClick={() => navigate(`/stories/${story.id}`)}>
                              {t.library.open}
                            </Button>
                          </>
                        ) : (
                          <div className="ms-auto">
                            <Button size="sm" onClick={() => navigate(`/stories/${story.id}`)}>
                              {t.library.open}
                            </Button>
                          </div>
                        )
                      }
                    />
                  </div>
                ))}
              </div>
              <Pagination
                className="mt-10"
                page={page}
                totalPages={meta?.totalPages ?? 1}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </section>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={t.library.confirmDelete}
      >
        <p className="text-sm text-fg-muted">
          <strong className="text-fg">{deleteTarget?.title}</strong>
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            {t.common.cancel}
          </Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
          >
            {t.common.delete}
          </Button>
        </div>
      </Modal>
    </>
  );
}