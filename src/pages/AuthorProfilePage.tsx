import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { BookOpen, ChevronLeft, ChevronRight, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../api/usersApi";
import type { StoryLibraryItem } from "../api/types";
import { StoryCard } from "../components/home/StoryCard";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState } from "../components/ui/States";
import { PageLoader, SkeletonGrid } from "../components/ui/Skeleton";
import { useContentLoading } from "../layouts/PageLoading";
import { useLanguage } from "../i18n";

export function AuthorProfilePage() {
  const { t } = useLanguage();
  const { userId } = useParams<{ userId: string }>();
  const [page, setPage] = useState(1);

  const profileQuery = useQuery({
    queryKey: ["author", "profile", userId],
    queryFn: () => usersApi.getPublicProfile(userId!),
    enabled: Boolean(userId),
  });

  const storiesQuery = useQuery({
    queryKey: ["author", "stories", userId, page],
    queryFn: () => usersApi.getPublicStories(userId!, { page, limit: 9 }),
    enabled: Boolean(userId),
  });

  useContentLoading(profileQuery.isLoading || storiesQuery.isLoading);

  if (!userId) return null;

  if (profileQuery.isLoading) {
    return (
      <div className="page-shell py-16">
        <PageLoader label={t.common.loading} />
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data?.data) {
    return (
      <div className="page-shell py-16">
        <ErrorState
          title={t.errors.notFoundTitle}
          message={t.errors.notFoundMessage}
          onRetry={() => profileQuery.refetch()}
        />
      </div>
    );
  }

  const profile = profileQuery.data.data;
  const stories = (storiesQuery.data?.data ?? []) as StoryLibraryItem[];
  const meta = storiesQuery.data?.meta;

  return (
    <>
      <Helmet>
        <title>
          {profile.name} - {t.brand.name}
        </title>
        <meta name="description" content={`${profile.name}'s public stories`} />
      </Helmet>

      <section className="hero-aurora relative min-h-[70vh]">
        <div className="page-shell py-10 sm:py-14">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-sm font-semibold text-fg-muted transition-colors hover:text-fg"
          >
            <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
            {t.nav.explore}
          </Link>

          <div className="relative mt-6 overflow-hidden rounded-[2rem] border border-brand-500/20 bg-surface/85 p-6 shadow-xl backdrop-blur sm:p-8">
            <div className="pointer-events-none absolute -end-20 -top-24 size-64 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 sm:gap-5">
                <Avatar
                  src={profile.avatarUrl}
                  alt={profile.name}
                  name={profile.name}
                  size="xl"
                  className="border-2 border-brand-500/30 shadow-lg"
                />
                <div>
                  <p className="inline-flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
                    <UserRound className="size-3.5" aria-hidden />
                    {t.admin.publicProfile}
                  </p>
                  <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] text-fg sm:text-5xl">
                    {profile.name}
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-fg-muted sm:text-base">
                    Stories created and shared publicly by this author.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-border bg-surface-2/70 px-4 py-3">
                <BookOpen
                  className="size-5 text-brand-600 dark:text-brand-400"
                  aria-hidden
                />
                <div>
                  <p className="text-2xl font-bold leading-none text-fg">
                    {profile.stats.publicStories}
                  </p>
                  <p className="mt-1 text-xs font-medium text-fg-muted">
                    {t.admin.publicStories}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-end justify-between gap-4">
            <div>
              <Badge tone="neutral">{t.admin.publicStories}</Badge>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-fg sm:text-4xl">
                {t.admin.publicStories}
              </h2>
              <p className="mt-2 text-fg-muted">
                Explore the stories this author has chosen to share.
              </p>
            </div>
            {meta && meta.total > 0 && (
              <span className="hidden text-sm text-fg-faint sm:block">
                {meta.total} {t.admin.publicStories.toLowerCase()}
              </span>
            )}
          </div>

          <div className="mt-7">
            {storiesQuery.isLoading ? (
              <SkeletonGrid count={6} />
            ) : storiesQuery.isError ? (
              <ErrorState
                title={t.explore.error}
                onRetry={() => storiesQuery.refetch()}
                retryLabel={t.explore.retry}
              />
            ) : stories.length === 0 ? (
              <EmptyState title={t.library.empty} />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {stories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>

                {meta && meta.totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                    >
                      <ChevronLeft
                        className="size-4 rtl:rotate-180"
                        aria-hidden
                      />
                      {t.common.previous}
                    </Button>
                    <span className="min-w-20 text-center text-sm font-semibold text-fg-muted">
                      {page} / {meta.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= meta.totalPages}
                      onClick={() =>
                        setPage((current) =>
                          Math.min(meta.totalPages, current + 1),
                        )
                      }
                    >
                      {t.common.next}
                      <ChevronRight
                        className="size-4 rtl:rotate-180"
                        aria-hidden
                      />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
