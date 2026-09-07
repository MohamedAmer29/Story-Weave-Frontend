import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { RotateCcw, Server, LogOut } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { Modal } from "../../components/ui/Modal";
import { getErrorMessage } from "../../api/axios";
import { useLanguage } from "../../i18n";

function CardLoading({ height = "h-24" }: { height?: string }) {
  return <Skeleton className={height} />;
}

function CardError({ onRetry }: { onRetry: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-fg-muted">{t.common.error}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        {t.common.retry}
      </Button>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
      <span className="text-fg-muted">{label}</span>
      {children}
    </div>
  );
}

const healthChecks = ["database", "redis", "queue"] as const;

export function AdminSystemTab() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [resetOpen, setResetOpen] = useState(false);

  const health = useQuery({
    queryKey: ["admin", "health"],
    queryFn: adminApi.health,
  });
  const queue = useQuery({
    queryKey: ["admin", "queue"],
    queryFn: adminApi.queueStats,
  });
  const usage = useQuery({
    queryKey: ["admin", "ai-usage"],
    queryFn: adminApi.aiUsage,
  });

  const resetMutation = useMutation({
    mutationFn: () => adminApi.resetAiUsage(),
    onSuccess: () => {
      toast.success(t.admin.usageReset);
      setResetOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["admin", "ai-usage"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const revokeOtherSessionsMutation = useMutation({
    mutationFn: () => adminApi.revokeOtherSessions(),
    onSuccess: () => {
      toast.success(t.admin.revokeOtherSessionsSuccess);
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-fg">{t.admin.systemTitle}</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-bold text-fg">
              <Server className="size-4" aria-hidden />
              {t.admin.healthTitle}
            </h3>
          </CardHeader>
          <CardBody>
            {health.isLoading ? (
              <CardLoading />
            ) : health.isError || !health.data ? (
              <CardError onRetry={() => health.refetch()} />
            ) : (
              <div className="space-y-2">
                <Row label="Status">
                  <Badge
                    tone={health.data.status === "ok" ? "success" : "danger"}
                    dot
                  >
                    {health.data.status}
                  </Badge>
                </Row>
                {healthChecks.map((check) => (
                  <Row key={check} label={check}>
                    <Badge
                      tone={
                        health.data.checks[check] === "up"
                          ? "success"
                          : "danger"
                      }
                    >
                      {health.data.checks[check]}
                    </Badge>
                  </Row>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => revokeOtherSessionsMutation.mutate()}
                loading={revokeOtherSessionsMutation.isPending}
              >
                <LogOut className="size-4 mr-2" aria-hidden />
                {t.admin.revokeOtherSessions}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-bold text-fg">{t.admin.queueTitle}</h3>
          </CardHeader>
          <CardBody>
            {queue.isLoading ? (
              <CardLoading />
            ) : queue.isError || !queue.data ? (
              <CardError onRetry={() => queue.refetch()} />
            ) : (
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                {[
                  {
                    label: "Waiting",
                    value: queue.data.counts.waiting,
                    tone: "text-fg",
                  },
                  {
                    label: "Active",
                    value: queue.data.counts.active,
                    tone: "text-fg",
                  },
                  {
                    label: "Failed",
                    value: queue.data.counts.failed,
                    tone: "text-red-600 dark:text-red-400",
                  },
                  {
                    label: "Delayed",
                    value: queue.data.counts.delayed,
                    tone: "text-fg",
                  },
                  {
                    label: "Completed",
                    value: queue.data.counts.completed,
                    tone: "text-emerald-600 dark:text-emerald-400",
                  },
                  {
                    label: "Total",
                    value: queue.data.counts.total,
                    tone: "text-fg",
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-surface-2 p-2">
                    <p className={`font-bold ${item.tone}`}>{item.value}</p>
                    <p className="text-xs text-fg-faint">{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-bold text-fg">{t.admin.aiUsageTitle}</h3>
          </CardHeader>
          <CardBody>
            {usage.isLoading ? (
              <CardLoading />
            ) : usage.isError || !usage.data ? (
              <CardError onRetry={() => usage.refetch()} />
            ) : (
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-fg">
                    {usage.data.used}
                    <span className="text-sm font-normal text-fg-faint">
                      {" "}
                      / {usage.data.dailyLimit}
                    </span>
                  </span>
                  <Badge tone={usage.data.blocked ? "danger" : "success"} dot>
                    {usage.data.blocked ? "Blocked" : "Available"}
                  </Badge>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, usage.data.percentageUsed)}%`,
                    }}
                  />
                </div>
                <Row label="Safety limit">
                  <span className="font-medium text-fg">
                    {usage.data.safetyLimit}
                  </span>
                </Row>
                <Row label="Remaining">
                  <span className="font-medium text-fg">
                    {usage.data.remainingUntilSafetyLimit}
                  </span>
                </Row>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 w-full"
                  onClick={() => setResetOpen(true)}
                  loading={resetMutation.isPending}
                >
                  <RotateCcw className="size-4" aria-hidden />
                  {t.admin.resetUsage}
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title={t.admin.resetUsage}
      >
        <p className="text-sm text-fg-muted">{t.admin.resetUsageConfirm}</p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setResetOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button
            variant="danger"
            loading={resetMutation.isPending}
            onClick={() => resetMutation.mutate()}
          >
            {t.admin.resetUsage}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
