import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileX,
  Globe,
  Lock,
  Share2,
  Plus,
} from "lucide-react";
import { dashboardApi } from "../api/dashboardApi";
import { Card, CardBody } from "../components/ui/Card";
import { StoryCard } from "../components/home/StoryCard";
import { PageLoader } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState } from "../components/ui/States";
import { useLanguage } from "../i18n";

function StatTile({
  icon: Icon,
  label,
  value,
  tone = "brand",
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
  tone?: "brand" | "success" | "warning" | "danger";
}) {
  const toneClasses = {
    brand: "bg-brand-500/10 text-brand-600 dark:text-brand-400",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          <Icon className="size-5.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-fg">{value}</p>
          <p className="truncate text-sm text-fg-muted">{label}</p>
        </div>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
  });

  if (query.isLoading) return <PageLoader label={t.dashboard.subtitle} />;
  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState
          title={t.common.error}
          message={query.error?.message}
          onRetry={() => query.refetch()}
          retryLabel={t.common.retry}
        />
      </div>
    );
  }

  const data = query.data;

  return (
    <>
      <Helmet>
        <title>
          {t.nav.dashboard} · {t.brand.name}
        </title>
      </Helmet>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">
              {t.dashboard.title}
            </h1>
            <p className="mt-2 text-fg-muted">{t.dashboard.subtitle}</p>
          </div>
          <Button onClick={() => navigate("/create")}>
            <Plus className="size-4" aria-hidden />
            {t.dashboard.createStory}
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile
            icon={BookOpen}
            label={t.dashboard.totalStories}
            value={data.stats.totalStories}
          />
          <StatTile
            icon={Globe}
            label={t.dashboard.publicStories}
            value={data.stats.publicStories}
          />
          <StatTile
            icon={Lock}
            label={t.dashboard.privateStories}
            value={data.stats.privateStories}
          />
          <StatTile
            icon={Share2}
            label={t.dashboard.sharedStories}
            value={data.stats.sharedStories}
          />
          <StatTile
            icon={Clock}
            label={t.dashboard.processing}
            value={data.stats.processingStories}
            tone="warning"
          />
          <StatTile
            icon={CheckCircle2}
            label={t.dashboard.completed}
            value={data.stats.completedStories}
            tone="success"
          />
          <StatTile
            icon={FileX}
            label={t.dashboard.failed}
            value={data.stats.failedStories}
            tone="danger"
          />
          <Card className="p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <BookOpen className="size-5.5" aria-hidden />
              </span>
              <div>
                <p className="text-2xl font-bold text-fg">
                  {data.stats.illustratedPages}
                  <span className="text-sm font-normal text-fg-faint">
                    {" "}
                    / {data.stats.totalPages}
                  </span>
                </p>
                <p className="truncate text-sm text-fg-muted">
                  {t.dashboard.illustratedPages}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 ">
            <div className="mb-4  flex items-center justify-between">
              <h2 className="text-lg font-bold text-fg">
                {t.dashboard.recentStories}
              </h2>
              <Link
                to="/library"
                className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                {t.dashboard.viewAll} →
              </Link>
            </div>
            {data.recentStories.length === 0 ? (
              <EmptyState
                title={t.dashboard.noRecentStories}
                action={
                  <Button onClick={() => navigate("/create")}>
                    {t.dashboard.createStory}
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 bg-auto rounded-2xl border border-border shadow-sm p-5">
                {data.recentStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-fg">
                {t.dashboard.recentNotifications}
              </h2>
              <Link
                to="/notifications"
                className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                {t.dashboard.viewAll} →
              </Link>
            </div>
            <Card>
              <CardBody className="space-y-1 p-3 ">
                {data.recentNotifications.length === 0 ? (
                  <p className="px-10 py-6 text-center text-sm text-fg-muted">
                    {t.notifications.empty}
                  </p>
                ) : (
                  data.recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-lg px-3 py-2.5 ${n.isRead ? "" : "bg-brand-500/5"}`}
                    >
                      <p className="text-sm font-medium text-fg">{n.title}</p>
                      {n.message && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-fg-muted">
                          {n.message}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
