import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { CheckCircle, AlertCircle, XCircle, Server, Database, HardDrive, Cpu } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { healthApi } from "../../api/healthApi";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { useLanguage } from "../../i18n";
import { cn } from "../../lib/cn";

const healthChecks = [
  { key: "database", label: "Database", icon: Database },
  { key: "redis", label: "Redis", icon: HardDrive },
  { key: "queue", label: "Queue", icon: Cpu },
] as const;

export function AdminHealthPage() {
  const { t } = useLanguage();

  const adminHealth = useQuery({
    queryKey: ["admin", "health"],
    queryFn: adminApi.health,
  });

  const healthCheck = useQuery({
    queryKey: ["health", "check"],
    queryFn: healthApi.check,
  });

  const healthReady = useQuery({
    queryKey: ["health", "ready"],
    queryFn: healthApi.ready,
  });

  return (
    <>
      <Helmet>
        <title>
          {t.admin.healthPageTitle} · {t.brand.name}
        </title>
      </Helmet>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">{t.admin.healthPageTitle}</h1>
          <p className="mt-2 text-fg-muted">{t.admin.healthPageSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <h3 className="flex items-center gap-2 font-bold text-fg">
                <Server className="size-4" aria-hidden />
                {t.admin.healthTitle} (Admin)
              </h3>
            </CardHeader>
            <CardBody>
              {adminHealth.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              ) : adminHealth.isError || !adminHealth.data ? (
                <div className="flex items-center gap-3 text-red-600">
                  <XCircle className="size-5" aria-hidden />
                  <span>{t.common.error}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={cn(
                    "flex items-center justify-between rounded-lg p-4",
                    adminHealth.data.status === "ok" ? "bg-emerald-500/10" : "bg-red-500/10"
                  )}>
                    <div className="flex items-center gap-3">
                      {adminHealth.data.status === "ok" ? (
                        <CheckCircle className="size-5 text-emerald-600" aria-hidden />
                      ) : (
                        <AlertCircle className="size-5 text-red-600" aria-hidden />
                      )}
                      <span className="font-semibold text-fg">{t.admin.healthTitle}</span>
                    </div>
                    <Badge tone={adminHealth.data.status === "ok" ? "success" : "danger"} dot>
                      {adminHealth.data.status}
                    </Badge>
                  </div>
                  {healthChecks.map((check) => {
                    const status = adminHealth.data.checks[check.key];
                    const Icon = check.icon;
                    return (
                      <div key={check.key} className="flex items-center justify-between rounded-lg bg-surface-2 p-3">
                        <div className="flex items-center gap-3">
                          <Icon className={cn("size-5", status === "up" ? "text-emerald-600" : "text-red-600")} aria-hidden />
                          <span className="font-medium text-fg">{check.label}</span>
                        </div>
                        <Badge tone={status === "up" ? "success" : "danger"}>
                          {status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="flex items-center gap-2 font-bold text-fg">
                <Server className="size-4" aria-hidden />
                {t.admin.healthPageTitle} (Public)
              </h3>
            </CardHeader>
            <CardBody>
              {healthCheck.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              ) : healthCheck.isError ? (
                <div className="flex items-center gap-3 text-red-600">
                  <XCircle className="size-5" aria-hidden />
                  <span>{t.common.error}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={cn(
                    "flex items-center justify-between rounded-lg p-4",
                    healthCheck.data?.status === "ok" ? "bg-emerald-500/10" : "bg-red-500/10"
                  )}>
                    <div className="flex items-center gap-3">
                      {healthCheck.data?.status === "ok" ? (
                        <CheckCircle className="size-5 text-emerald-600" aria-hidden />
                      ) : (
                        <AlertCircle className="size-5 text-red-600" aria-hidden />
                      )}
                      <span className="font-semibold text-fg">{t.admin.healthTitle}</span>
                    </div>
                    <Badge tone={healthCheck.data?.status === "ok" ? "success" : "danger"} dot>
                      {healthCheck.data?.status ?? "unknown"}
                    </Badge>
                  </div>
                  <div className="text-sm text-fg-muted">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(healthCheck.data, null, 2)}</pre>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="flex items-center gap-2 font-bold text-fg">
                <Server className="size-4" aria-hidden />
                Readiness Check
              </h3>
            </CardHeader>
            <CardBody>
              {healthReady.isLoading ? (
                <Skeleton className="h-10" />
              ) : healthReady.isError ? (
                <div className="flex items-center gap-3 text-red-600">
                  <XCircle className="size-5" aria-hidden />
                  <span>{t.common.error}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={cn(
                    "flex items-center justify-between rounded-lg p-4",
                    healthReady.data?.status === "ok" ? "bg-emerald-500/10" : "bg-red-500/10"
                  )}>
                    <div className="flex items-center gap-3">
                      {healthReady.data?.status === "ok" ? (
                        <CheckCircle className="size-5 text-emerald-600" aria-hidden />
                      ) : (
                        <AlertCircle className="size-5 text-red-600" aria-hidden />
                      )}
                      <span className="font-semibold text-fg">Ready</span>
                    </div>
                    <Badge tone={healthReady.data?.status === "ok" ? "success" : "danger"} dot>
                      {healthReady.data?.status ?? "unknown"}
                    </Badge>
                  </div>
                  <div className="text-sm text-fg-muted">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(healthReady.data, null, 2)}</pre>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </section>
    </>
  );
}