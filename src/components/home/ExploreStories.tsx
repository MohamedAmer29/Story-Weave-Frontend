import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { storiesApi } from "../../api/storiesApi";
import { SectionHeading } from "./SectionHeading";
import { StoryCard } from "./StoryCard";
import { SkeletonGrid } from "../ui/Skeleton";
import { EmptyState, ErrorState } from "../ui/States";
import { Input } from "../ui/field";
import { Pagination } from "../ui/Pagination";
import { useLanguage } from "../../i18n";

export function ExploreStories() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["stories", "public", { page, search }],
    queryFn: () => storiesApi.publicStories({ page, limit: 6, search: search || undefined }),
  });

  const data = query.data?.data ?? [];
  const meta = query.data?.meta;

  const filtered = useMemo(() => data, [data]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t.explore.title} title={t.explore.title} subtitle={t.explore.subtitle} />

        <div className="mx-auto mt-8 max-w-md">
          <div className="relative">
            <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-faint" aria-hidden />
            <Input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t.explore.searchPlaceholder}
              aria-label={t.explore.searchPlaceholder}
              className="ps-10"
            />
          </div>
        </div>

        <div className="mt-10">
          {query.isLoading ? (
            <SkeletonGrid count={6} />
          ) : query.isError ? (
            <ErrorState title={t.explore.error} onRetry={() => query.refetch()} retryLabel={t.explore.retry} />
          ) : filtered.length === 0 ? (
            <EmptyState title={search ? t.explore.noResults : t.explore.empty} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    authorName={(story as { authorName?: string }).authorName}
                  />
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
  );
}

export function ExploreCallToAction() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate("/explore")} className="mx-auto mt-4 block text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
      {t.explore.title} →
    </button>
  );
}