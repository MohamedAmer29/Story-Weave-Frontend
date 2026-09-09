import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGSAP } from "@gsap/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Heart, Search } from "lucide-react";
import { favouritesApi } from "../api/favouritesApi";
import type { StoryLibraryItem } from "../api/types";
import { StoryCard } from "../components/home/StoryCard";
import { SkeletonGrid } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/States";
import { Input } from "../components/ui/field";
import { Button } from "../components/ui/Button";
import { Pagination } from "../components/ui/Pagination";
import { getErrorMessage } from "../api/axios";
import { useLanguage } from "../i18n";
import { gsap, prefersReducedMotion, revealEase } from "../lib/gsap";

export function FavouritesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLElement>(null);

  const query = useQuery({
    queryKey: ["favourites", { page, search }],
    queryFn: () =>
      favouritesApi.list({
        page,
        limit: 9,
        search: search || undefined,
      }),
  });

  const stories = query.data?.data ?? ([] as StoryLibraryItem[]);
  const meta = query.data?.meta;

  const removeMutation = useMutation({
    mutationFn: (storyId: string) => favouritesApi.remove(storyId),
    onSuccess: (_, storyId) => {
      toast.success(t.favourites.removed);
      void queryClient.invalidateQueries({ queryKey: ["favourites"] });
      if (stories.length === 1 && page > 1) {
        setPage((p) => p - 1);
      }
      void queryClient.setQueryData(
        ["story", storyId, "favorite"],
        { favorited: false },
      );
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const filtersActive = Boolean(search);

  const resetFilters = () => {
    setSearch("");
    setPage(1);
  };

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
    { scope: rootRef, dependencies: [page, search] },
  );

  return (
    <>
      <Helmet>
        <title>
          {t.favourites.title} · {t.brand.name}
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
              {t.favourites.title}
            </h1>
            <p className="mt-2 text-copy-rhythm text-fg-muted">
              {t.favourites.subtitle}
            </p>
          </div>
        </div>

        <div data-page-reveal className="relative mt-6 max-w-md">
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
            placeholder={t.favourites.searchPlaceholder}
            aria-label={t.favourites.searchPlaceholder}
            className="ps-10"
          />
        </div>

        <div data-page-reveal className="mt-8">
          {query.isLoading ? (
            <SkeletonGrid count={6} />
          ) : query.isError ? (
            <EmptyState
              title={t.explore.error}
              action={
                <Button onClick={() => query.refetch()}>
                  {t.common.retry}
                </Button>
              }
            />
          ) : stories.length === 0 ? (
            <EmptyState
              icon={<Heart className="size-6" />}
              title={
                search
                  ? t.favourites.noResults
                  : t.favourites.empty
              }
              description={search ? undefined : t.favourites.emptyHint}
              action={
                filtersActive ? (
                  <Button variant="outline" onClick={resetFilters}>
                    {t.favourites.clearFilters}
                  </Button>
                ) : (
                  <Button onClick={() => navigate("/explore")}>
                    {t.nav.explore}
                  </Button>
                )
              }
            />
          ) : (
            <>
              {filtersActive && (
                <button
                  onClick={resetFilters}
                  className="mb-4 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
                >
                  {t.favourites.clearFilters}
                </button>
              )}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stories.map((story) => (
                  <div key={story.id} className="relative">
                    <StoryCard
                      story={story}
                      footer={
                        <div className="ms-auto flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMutation.mutate(story.id)}
                            aria-label={`${t.favourites.remove}: ${story.title}`}
                            className="text-brand-600 hover:text-red-600 dark:text-brand-400 dark:hover:text-red-400"
                          >
                            <Heart className="size-4 fill-current" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/stories/${story.id}`)}
                          >
                            {t.favourites.open}
                          </Button>
                        </div>
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
    </>
  );
}