import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGSAP } from "@gsap/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Plus, Search, Trash2, BookOpen, Heart } from "lucide-react";
import { usersApi } from "../api/usersApi";
import { storiesApi } from "../api/storiesApi";
import type { StoryLibraryItem, StoryResponse, StoryType } from "../api/types";
import { useAuth } from "../hooks/useAuth";
import { useFavouritesIds } from "../hooks/useFavourites";
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
import { gsap, prefersReducedMotion, revealEase } from "../lib/gsap";

type Tab = "mine" | "shared" | "public";

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
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  const mineQuery = useQuery({
    queryKey: [
      "library",
      "mine",
      { page, search, status, visibility, storyType },
    ],
    queryFn: () =>
      usersApi.myStories({
        page,
        limit: 9,
        search: search || undefined,
        status: status || undefined,
        visibility: visibility || undefined,
        storyType: storyType || undefined,
      }),
    enabled: tab === "mine",
  });

  const sharedQuery = useQuery({
    queryKey: ["library", "shared", { page, search }],
    queryFn: () =>
      usersApi.sharedStories({ page, limit: 9, search: search || undefined }),
    enabled: tab === "shared",
  });

  const publicQuery = useQuery({
    queryKey: ["library", "public", { page, search, storyType }],
    queryFn: () =>
      storiesApi.publicStories({
        page,
        limit: 9,
        search: search || undefined,
      }),
    enabled: tab === "public",
  });

  const activeQuery =
    tab === "mine" ? mineQuery : tab === "shared" ? sharedQuery : publicQuery;
  const stories = (activeQuery.data?.data ?? []) as Array<
    StoryLibraryItem | StoryResponse
  >;
  const meta = activeQuery.data?.meta;

  const { isAuthenticated } = useAuth();
  const { favIds, isLoaded, isPending, toggle } = useFavouritesIds();

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

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const items = rootRef.current?.querySelectorAll("[data-page-reveal]");
      if (!items?.length) return;
      gsap.fromTo(
        items,
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, stagger: 0.06, ease: revealEase },
      );
    },
    {
      scope: rootRef,
      dependencies: [tab, page, search, status, visibility, storyType],
    },
  );

  return (
    <>
      <Helmet>
        <title>
          {t.library.title} · {t.brand.name}
        </title>
      </Helmet>
      <section
        ref={rootRef}
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <div
          data-page-reveal
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-display-tight text-fg sm:text-4xl">
              {t.library.title}
            </h1>
            <p className="mt-2 text-copy-rhythm text-fg-muted">
              {t.library.subtitle}
            </p>
          </div>
          <Button onClick={() => navigate("/create")}>
            <Plus className="size-4" aria-hidden />
            {t.nav.createStory}
          </Button>
        </div>

        <div
          data-page-reveal
          className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center"
        >
          <div
            className="flex rounded-lg border border-border bg-surface p-1"
            role="tablist"
            aria-label="Library tabs"
          >
            <button
              role="tab"
              aria-selected={tab === "mine"}
              onClick={() => {
                setTab("mine");
                setPage(1);
              }}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                tab === "mine"
                  ? "bg-brand-600 text-white"
                  : "text-fg-muted hover:text-fg",
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
                tab === "shared"
                  ? "bg-brand-600 text-white"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              {t.library.sharedTitle}
            </button>
            <button
              role="tab"
              aria-selected={tab === "public"}
              onClick={() => {
                setTab("public");
                setPage(1);
              }}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                tab === "public"
                  ? "bg-brand-600 text-white"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              {t.explore.title}
            </button>
          </div>

          <div className="relative flex-1">
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
                {(["DRAFT", "PROCESSING", "READY", "FAILED"] as const).map(
                  (s) => (
                    <option key={s} value={s}>
                      {t.status[s]}
                    </option>
                  ),
                )}
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
                {(["PUBLIC", "MEMBERS", "PRIVATE", "SHARED"] as const).map(
                  (v) => (
                    <option key={v} value={v}>
                      {t.status[v]}
                    </option>
                  ),
                )}
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
                {(
                  [
                    "FANTASY",
                    "ADVENTURE",
                    "SCI_FI",
                    "MYSTERY",
                    "HORROR",
                    "ROMANCE",
                    "COMEDY",
                    "DRAMA",
                    "HISTORICAL",
                    "FAIRY_TALE",
                    "CHILDREN",
                    "ACTION",
                    "THRILLER",
                  ] as const
                ).map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
            </>
          )}
        </div>

        <div data-page-reveal className="mt-8">
          {activeQuery.isLoading ? (
            <SkeletonGrid count={6} />
          ) : activeQuery.isError ? (
            <EmptyState
              title={t.explore.error}
              action={
                <Button onClick={() => activeQuery.refetch()}>
                  {t.common.retry}
                </Button>
              }
            />
          ) : stories.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="size-6" />}
              title={
                tab === "mine"
                  ? t.library.empty
                  : tab === "shared"
                    ? t.library.sharedEmpty
                    : t.explore.empty
              }
              description={tab === "mine" ? t.library.emptyHint : undefined}
              action={
                filtersActive ? (
                  <Button variant="outline" onClick={resetFilters}>
                    {t.library.clearFilters}
                  </Button>
                ) : tab === "mine" ? (
                  <Button onClick={() => navigate("/create")}>
                    {t.nav.createStory}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              {filtersActive && (
                <button
                  onClick={resetFilters}
                  className="mb-4 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
                >
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
                            {isAuthenticated && (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!isLoaded || isPending}
                                onClick={() => toggle(story.id)}
                                aria-label={
                                  favIds.has(story.id)
                                    ? t.favourites.remove
                                    : t.favourites.add
                                }
                                className={cn(
                                  "text-fg-muted hover:text-brand-600 dark:hover:text-brand-400",
                                  favIds.has(story.id) &&
                                    "text-brand-600 dark:text-brand-400",
                                )}
                              >
                                <Heart
                                  className={cn(
                                    "size-4",
                                    favIds.has(story.id) &&
                                      "fill-brand-600 text-brand-600 dark:fill-brand-400 dark:text-brand-400",
                                  )}
                                  aria-hidden
                                />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setDeleteTarget({
                                  id: story.id,
                                  title: story.title,
                                })
                              }
                              aria-label={`${t.library.delete}: ${story.title}`}
                              className="text-fg-muted hover:text-red-600 dark:hover:text-red-400"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => navigate(`/stories/${story.id}`)}
                            >
                              {t.library.open}
                            </Button>
                          </>
                        ) : (
                          <div className="ms-auto flex items-center gap-2">
                            {isAuthenticated && (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!isLoaded || isPending}
                                onClick={() => toggle(story.id)}
                                aria-label={
                                  favIds.has(story.id)
                                    ? t.favourites.remove
                                    : t.favourites.add
                                }
                                className={cn(
                                  "text-fg-muted hover:text-brand-600 dark:hover:text-brand-400",
                                  favIds.has(story.id) &&
                                    "text-brand-600 dark:text-brand-400",
                                )}
                              >
                                <Heart
                                  className={cn(
                                    "size-4",
                                    favIds.has(story.id) &&
                                      "fill-brand-600 text-brand-600 dark:fill-brand-400 dark:text-brand-400",
                                  )}
                                  aria-hidden
                                />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => navigate(`/stories/${story.id}`)}
                            >
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
            onClick={() =>
              deleteTarget && deleteMutation.mutate(deleteTarget.id)
            }
          >
            {t.common.delete}
          </Button>
        </div>
      </Modal>
    </>
  );
}
