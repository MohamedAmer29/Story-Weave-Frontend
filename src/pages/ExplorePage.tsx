import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { storiesApi } from "../api/storiesApi";
import { StoryCard } from "../components/home/StoryCard";
import { SkeletonGrid } from "../components/ui/Skeleton";
import { EmptyState, ErrorState } from "../components/ui/States";
import { Input, Select } from "../components/ui/field";
import { Pagination } from "../components/ui/Pagination";
import { useLanguage } from "../i18n";

export function ExplorePage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"latest" | "oldest" | "updated">("latest");

  const query = useQuery({
    queryKey: ["stories", "explore", { page, search, sort }],
    queryFn: () => storiesApi.publicStories({ page, limit: 9, search: search || undefined, sort }),
  });

  const stories = query.data?.data ?? [];
  const meta = query.data?.meta;

  const applySearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>
          {t.explore.title} · {t.brand.name}
        </title>
        <meta name="description" content={t.explore.subtitle} />
      </Helmet>
      <section className="hero-aurora relative min-h-[70vh]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold text-fg sm:text-5xl">{t.explore.title}</h1>
          <p className="mt-3 max-w-xl text-lg text-fg-muted">{t.explore.subtitle}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-faint" aria-hidden />
              <Input
                value={search}
                onChange={(e) => applySearch(e.target.value)}
                placeholder={t.explore.searchPlaceholder}
                aria-label={t.explore.searchPlaceholder}
                className="ps-10"
              />
            </div>
            <Select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as "latest" | "oldest" | "updated");
                setPage(1);
              }}
              aria-label="Sort"
              className="w-full sm:w-auto"
            >
              <option value="latest">{t.sort.latest}</option>
              <option value="oldest">{t.sort.oldest}</option>
              <option value="updated">{t.sort.updated}</option>
            </Select>
          </div>

          <div className="mt-10">
            {query.isLoading ? (
              <SkeletonGrid count={6} />
            ) : query.isError ? (
              <ErrorState title={t.explore.error} onRetry={() => query.refetch()} retryLabel={t.explore.retry} />
            ) : stories.length === 0 ? (
              <EmptyState title={search ? t.explore.noResults : t.explore.empty} />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {stories.map((story) => (
                    <StoryCard key={story.id} story={story} />
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
        </div>
      </section>
    </>
  );
}