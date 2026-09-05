import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Users, BookOpen, Server } from "lucide-react";
import { adminApi } from "../api/adminApi";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { PageLoader, Skeleton } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/States";
import { Badge } from "../components/ui/Badge";
import { useLanguage } from "../i18n";
import { cn } from "../lib/cn";
import { AdminUsersTab } from "./admin/AdminUsersTab";
import { AdminStoriesTab } from "./admin/AdminStoriesTab";
import { AdminSystemTab } from "./admin/AdminSystemTab";

type Tab = "overview" | "users" | "stories" | "system";

export function AdminPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
    { id: "overview", label: t.admin.overview, icon: LayoutDashboard },
    { id: "users", label: t.admin.users, icon: Users },
    { id: "stories", label: t.admin.stories, icon: BookOpen },
    { id: "system", label: t.admin.system, icon: Server },
  ];

  return (
    <>
      <Helmet>
        <title>
          {t.nav.admin} · {t.brand.name}
        </title>
      </Helmet>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">{t.admin.title}</h1>

        <div className="mt-6 flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1" role="tablist" aria-label={t.admin.title}>
          {tabs.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                tab === item.id ? "bg-brand-600 text-white" : "text-fg-muted hover:text-fg"
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
        </div>
      </section>
    </>
  );
}

function StatCell({ label, value, tone }: { label: string; value: number | string; tone?: "brand" | "success" | "warning" | "danger" }) {
  const tones = {
    brand: "text-brand-600 dark:text-brand-400",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
  };
  return (
    <Card className="p-4">
      <p className={cn("text-2xl font-bold", tones[tone ?? "brand"])}>{value}</p>
      <p className="mt-0.5 text-xs text-fg-muted">{label}</p>
    </Card>
  );
}

export function AdminOverviewTab() {
  const { t } = useLanguage();
  const query = useQuery({ queryKey: ["admin", "dashboard"], queryFn: adminApi.dashboard });
  const queue = useQuery({ queryKey: ["admin", "queue"], queryFn: adminApi.queueStats });
  const health = useQuery({ queryKey: ["admin", "health"], queryFn: adminApi.health });

  if (query.isLoading) return <PageLoader />;
  if (query.isError || !query.data) {
    return <ErrorState title={t.common.error} onRetry={() => query.refetch()} retryLabel={t.common.retry} />;
  }

  const data = query.data;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-bold text-fg">{t.admin.overviewTitle}</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCell label={t.admin.totalUsers} value={data.users.total} />
          <StatCell label={t.admin.activeUsers} value={data.users.active} tone="success" />
          <StatCell label={t.admin.totalStories} value={data.stories.total} />
          <StatCell label={t.admin.readyStories} value={data.stories.byStatus.ready} tone="success" />
          <StatCell label={t.admin.failedStories} value={data.stories.byStatus.failed} tone="danger" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-bold text-fg">{t.admin.generationsTitle}</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCell label={t.admin.pageTotal} value={data.generations.pageCounts.total} />
              <StatCell label={t.admin.pageCompleted} value={data.generations.pageCounts.completed} tone="success" />
              <StatCell label={t.admin.pageInFlight} value={data.generations.pageCounts.inFlight} tone="warning" />
              <StatCell label={t.admin.pageFailed} value={data.generations.pageCounts.failed} tone="danger" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-bold text-fg">{t.admin.aiUsageTitle}</h3>
          </CardHeader>
          <CardBody>
            <div className="mb-3 flex items-end justify-between">
              <span className="text-2xl font-bold text-fg">
                {data.aiUsage.used}
                <span className="text-sm font-normal text-fg-faint"> / {data.aiUsage.limit}</span>
              </span>
              <Badge tone={data.aiUsage.blocked ? "danger" : "success"} dot>
                {data.aiUsage.blocked ? t.explore.retry : t.status.READY}
              </Badge>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                style={{ width: `${Math.min(100, data.aiUsage.percentage)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-fg-faint">{Math.round(data.aiUsage.percentage)}%</p>

            {queue.data && (
              <div className="mt-5 border-t border-border pt-4">
                <h4 className="mb-2 text-sm font-semibold text-fg">{t.admin.queueTitle}</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg bg-surface-2 p-2">
                    <p className="font-bold text-fg">{queue.data.counts.waiting}</p>
                    <p className="text-xs text-fg-faint">Waiting</p>
                  </div>
                  <div className="rounded-lg bg-surface-2 p-2">
                    <p className="font-bold text-fg">{queue.data.counts.active}</p>
                    <p className="text-xs text-fg-faint">Active</p>
                  </div>
                  <div className="rounded-lg bg-surface-2 p-2">
                    <p className="font-bold text-red-600 dark:text-red-400">{queue.data.counts.failed}</p>
                    <p className="text-xs text-fg-faint">Failed</p>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-bold text-fg">{t.admin.recentUsers}</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {data.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-fg">{u.name}</p>
                    <p className="truncate text-xs text-fg-muted">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={u.role === "ADMIN" ? "danger" : "neutral"}>{u.role}</Badge>
                    <Badge tone={u.isActive ? "success" : "danger"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-bold text-fg">{t.admin.healthTitle}</h3>
          </CardHeader>
          <CardBody>
            {health.isLoading ? (
              <Skeleton className="h-24" />
            ) : health.data ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
                  <span className="text-fg-muted">Status</span>
                  <Badge tone={health.data.status === "ok" ? "success" : "danger"} dot>{health.data.status}</Badge>
                </div>
                {(["database", "redis", "queue"] as const).map((check) => (
                  <div key={check} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
                    <span className="text-fg-muted">{check}</span>
                    <Badge tone={health.data.checks[check] === "up" ? "success" : "danger"}>{health.data.checks[check]}</Badge>
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
  );
}