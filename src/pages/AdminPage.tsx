import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  LayoutDashboard,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { adminApi } from "../api/adminApi";
import { Badge } from "../components/ui/Badge";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { PageLoader, Skeleton } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/States";
import { useLanguage } from "../i18n";
import { cn } from "../lib/cn";
import { AdminUsersTab } from "./admin/AdminUsersTab";
import { AdminStoriesTab } from "./admin/AdminStoriesTab";
import { AdminSystemTab } from "./admin/AdminSystemTab";
import { AdminHealthPage } from "./admin/AdminHealthPage";
import { AdminQueuePage } from "./admin/AdminQueuePage";
import { AdminAuditPage } from "./admin/AdminAuditPage";

type Tab = "overview" | "users" | "stories" | "system" | "health" | "queue" | "audit";

export function AdminPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> =
    [
      { id: "overview", label: t.admin.overview, icon: LayoutDashboard },
      { id: "users", label: t.admin.users, icon: Users },
      { id: "stories", label: t.admin.stories, icon: BookOpen },
      { id: "system", label: t.admin.system, icon: Server },
      { id: "health", label: t.admin.healthTitle, icon: Server },
      { id: "queue", label: t.admin.queueTitle, icon: AlertTriangle },
      { id: "audit", label: t.admin.audit, icon: ShieldCheck },
    ];

  useEffect(() => {
    const nextTab = searchParams.get("tab");
    if (
      nextTab === "overview" ||
      nextTab === "users" ||
      nextTab === "stories" ||
      nextTab === "system" ||
      nextTab === "health" ||
      nextTab === "queue" ||
      nextTab === "audit"
    ) {
      setTab(nextTab);
    } else {
      setTab("overview");
      setSearchParams({ tab: "overview" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleTabChange = (nextTab: Tab) => {
    setTab(nextTab);
    setSearchParams({ tab: nextTab }, { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>
          {t.nav.admin} · {t.brand.name}
        </title>
      </Helmet>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-border pb-6">
          <Badge tone="brand" className="mb-3 inline-flex items-center gap-2">
            <Sparkles className="size-3.5" aria-hidden />
            {t.nav.admin}
          </Badge>
          <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">
            {t.admin.title}
          </h1>
        </div>

        <div
          className="mt-6 flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1"
          role="tablist"
          aria-label={t.admin.title}
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                tab === item.id
                  ? "bg-brand-600 text-white"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "overview" && <AdminOverviewTab />}
          {tab === "users" && <AdminUsersTab />}
          {tab === "stories" && <AdminStoriesTab />}
          {tab === "system" && <AdminSystemTab />}
          {tab === "health" && <AdminHealthPage />}
          {tab === "queue" && <AdminQueuePage />}
          {tab === "audit" && <AdminAuditPage />}
        </div>
      </section>
    </>
  );
}

function StatCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "brand" | "success" | "warning" | "danger";
}) {
  const tones = {
    brand: "text-brand-600 dark:text-brand-400",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <p className={cn("text-2xl font-bold", tones[tone ?? "brand"])}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-fg-muted">{label}</p>
    </div>
  );
}

export function AdminOverviewTab() {
  const { t } = useLanguage();
  const query = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminApi.dashboard,
  });
  const queue = useQuery({
    queryKey: ["admin", "queue"],
    queryFn: adminApi.queueStats,
  });
  const health = useQuery({
    queryKey: ["admin", "health"],
    queryFn: adminApi.health,
  });

  if (query.isLoading) return <PageLoader />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        title={t.common.error}
        onRetry={() => query.refetch()}
        retryLabel={t.common.retry}
      />
    );
  }

  const data = query.data;
  const usagePercent = Math.max(0, Math.min(100, data.aiUsage.percentage));
  const generationStatus =
    data.generations.pageCounts.completed +
    data.generations.pageCounts.failed +
    data.generations.pageCounts.inFlight;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCell label={t.admin.totalUsers} value={data.users.total} />
        <StatCell
          label={t.admin.activeUsers}
          value={data.users.active}
          tone="success"
        />
        <StatCell label={t.admin.totalStories} value={data.stories.total} />
        <StatCell
          label={t.admin.readyStories}
          value={data.stories.byStatus.ready}
          tone="success"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-fg-muted">
                  {t.admin.generationsTitle}
                </p>
                <h3 className="mt-1 text-lg font-bold text-fg">
                  Generation pipeline
                </h3>
              </div>
              <Badge tone="info" className="border-transparent">
                {generationStatus} active
              </Badge>
            </CardHeader>
            <CardBody>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <StatCell
                  label={t.admin.pageTotal}
                  value={data.generations.pageCounts.total}
                />
                <StatCell
                  label={t.admin.pageCompleted}
                  value={data.generations.pageCounts.completed}
                  tone="success"
                />
                <StatCell
                  label={t.admin.pageInFlight}
                  value={data.generations.pageCounts.inFlight}
                  tone="warning"
                />
                <StatCell
                  label={t.admin.pageFailed}
                  value={data.generations.pageCounts.failed}
                  tone="danger"
                />
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-surface-2 p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-fg-muted">
                  <span>Completion rate</span>
                  <span className="font-medium text-fg">
                    {Math.round(
                      (data.generations.pageCounts.completed /
                        Math.max(1, data.generations.pageCounts.total)) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                    style={{
                      width: `${Math.min(100, Math.round((data.generations.pageCounts.completed / Math.max(1, data.generations.pageCounts.total)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-fg-muted">
                  {t.admin.recentUsers}
                </p>
                <h3 className="mt-1 text-lg font-bold text-fg">
                  Recently active users
                </h3>
              </div>
              <Badge tone="neutral">{data.recentUsers.length} records</Badge>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {data.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-fg">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-fg-muted">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        tone={user.role === "ADMIN" ? "danger" : "neutral"}
                      >
                        {user.role}
                      </Badge>
                      <Badge tone={user.isActive ? "success" : "danger"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-fg-muted">
                  {t.admin.aiUsageTitle}
                </p>
                <h3 className="mt-1 text-lg font-bold text-fg">AI capacity</h3>
              </div>
              <ShieldCheck
                className="size-5 text-brand-600 dark:text-brand-400"
                aria-hidden
              />
            </CardHeader>
            <CardBody>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-fg">
                    {data.aiUsage.used}
                  </p>
                  <p className="text-sm text-fg-muted">
                    of {data.aiUsage.limit} total
                  </p>
                </div>
                <Badge tone={data.aiUsage.blocked ? "danger" : "success"} dot>
                  {data.aiUsage.blocked ? t.explore.retry : t.status.READY}
                </Badge>
              </div>

              <div
                className="relative mx-auto mb-4 flex size-28 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, var(--color-brand-600) 0deg ${usagePercent * 3.6}deg, rgba(148, 163, 184, 0.18) ${usagePercent * 3.6}deg 360deg)`,
                }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-center shadow-inner">
                  <div>
                    <div className="text-xl font-bold text-fg">
                      {Math.round(usagePercent)}%
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-fg-muted">
                      used
                    </div>
                  </div>
                </div>
              </div>

              {queue.data && (
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-xl bg-surface-2 p-2">
                    <p className="text-lg font-bold text-fg">
                      {queue.data.counts.waiting}
                    </p>
                    <p className="text-[11px] text-fg-muted">Waiting</p>
                  </div>
                  <div className="rounded-xl bg-surface-2 p-2">
                    <p className="text-lg font-bold text-fg">
                      {queue.data.counts.active}
                    </p>
                    <p className="text-[11px] text-fg-muted">Active</p>
                  </div>
                  <div className="rounded-xl bg-surface-2 p-2">
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {queue.data.counts.failed}
                    </p>
                    <p className="text-[11px] text-fg-muted">Failed</p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-fg-muted">
                  {t.admin.healthTitle}
                </p>
                <h3 className="mt-1 text-lg font-bold text-fg">
                  System health
                </h3>
              </div>
              <AlertTriangle
                className="size-5 text-amber-600 dark:text-amber-400"
                aria-hidden
              />
            </CardHeader>
            <CardBody>
              {health.isLoading ? (
                <Skeleton className="h-24" />
              ) : health.data ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-surface-2 px-3 py-2.5 text-sm">
                    <span className="text-fg-muted">Status</span>
                    <Badge
                      tone={health.data.status === "ok" ? "success" : "danger"}
                      dot
                    >
                      {health.data.status}
                    </Badge>
                  </div>
                  {(["database", "redis", "queue"] as const).map((check) => (
                    <div
                      key={check}
                      className="flex items-center justify-between rounded-2xl bg-surface-2 px-3 py-2.5 text-sm"
                    >
                      <span className="capitalize text-fg-muted">{check}</span>
                      <Badge
                        tone={
                          health.data.checks[check] === "up"
                            ? "success"
                            : "danger"
                        }
                      >
                        {health.data.checks[check]}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-fg-faint">—</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}