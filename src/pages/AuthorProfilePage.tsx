import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../api/usersApi";
import type { StoryLibraryItem } from "../api/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { EmptyState, ErrorState } from "../components/ui/States";
import { PageLoader } from "../components/ui/Skeleton";
import { Pagination } from "../components/ui/Pagination";
import { useLanguage } from "../i18n";
import { cn } from "../lib/cn";

export function AuthorProfilePage() {
  const { t } = useLanguage();
  const { userId } = useParams<{ userId: string }>();

  const profileQuery = useQuery({
    queryKey: ["author", "profile", userId],
    queryFn: () => usersApi.getPublicProfile(userId!),
    enabled: !!userId,
  });

  const storiesQuery = useQuery({
    queryKey: ["author", "stories", userId],
    queryFn: () => usersApi.getPublicStories(userId!, { page: 1, limit: 10 }),
    enabled: !!userId,
  });

  if (!userId) return null;

  const profile = profileQuery.data?.data;
  const stories = storiesQuery.data?.data ?? [];
  const meta = storiesQuery.data?.meta;

  if (profileQuery.isLoading || storiesQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <PageLoader label={t.common.loading} />
      </div>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <ErrorState
        title={t.errors.notFoundTitle}
        message={t.errors.notFoundMessage}
        onRetry={() => profileQuery.refetch()}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {profile.name} · {t.brand.name}
        </title>
      </Helmet>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              src={profile.avatarUrl}
              alt={profile.name as string}
              size="xl"
              fallback={profile.name?.charAt(0) ?? "?"}
            />
            <div>
              <h1 className="font-display text-2xl font-bold text-fg sm:text-3xl">
                {profile.name}
              </h1>
              {profile.email && (
                <p className="text-sm text-fg-muted">{profile.email}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold text-fg">{t.admin.publicStories}</h2>
          {stories.length === 0 ? (
            <EmptyState
              icon={<Badge tone="neutral" className="size-6" />}
              title={t.library.empty}
            />
          ) : (
            <div className="mt-4 space-y-4">
              {stories.map((story: StoryLibraryItem) => (
                <article
                  key={story.id}
                  className={cn(
                    "flex items-start gap-4 rounded-2xl border bg-surface p-4 transition-colors",
                    "hover:border-brand-500/50",
                  )}
                >
                  {story.coverImageUrl && (
                    <img
                      src={story.coverImageUrl}
                      alt={story.title}
                      className="size-20 shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-fg truncate">
                        {story.title}
                      </h3>
                      <Badge tone="neutral">
                        {story.storyType ?? t.common.all}
                      </Badge>
                      <Badge
                        tone={
                          story.visibility === "PUBLIC" ? "success" : "neutral"
                        }
                      >
                        {story.visibility}
                      </Badge>
                    </div>
                    {story.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-fg-muted">
                        {story.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-fg-faint">
                      <span>{story.totalPages} pages</span>
                      <span>·</span>
                      <span>{story.illustratedPages} illustrated</span>
                      <span>·</span>
                      <span className="capitalize">
                        {story.status.toLowerCase()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    asChild
                  >
                    <a href={`/stories/${story.id}`}>{t.explore.readStory}</a>
                  </Button>
                </article>
              ))}
            </div>
          )}
        </div>

        {meta && meta.totalPages > 1 && (
          <Pagination
            className="mt-8"
            page={1}
            totalPages={meta.totalPages}
            onPageChange={() => {}}
          />
        )}
      </section>
    </>
  );
}
