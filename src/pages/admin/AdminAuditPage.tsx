import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { adminApi } from "../../api/adminApi";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { Pagination } from "../../components/ui/Pagination";
import { Input } from "../../components/ui/field";
import { useLanguage } from "../../i18n";

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function AdminAuditPage() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["admin", "audit", { page, search }],
    queryFn: () => adminApi.audit({ page, limit: 20, search: search || undefined }),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const audits = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <>
      <Helmet>
        <title>
          {t.admin.auditPageTitle} · {t.brand.name}
        </title>
      </Helmet>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">{t.admin.auditPageTitle}</h1>
          <p className="mt-2 text-fg-muted">{t.admin.auditPageSubtitle}</p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t.common.search}
            className="max-w-xs"
          />
        </div>

        <Card>
          <CardHeader>
            <h3 className="font-bold text-fg">Audit Log</h3>
          </CardHeader>
          <CardBody>
            {query.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : query.isError ? (
              <p className="text-red-600">{t.common.error}</p>
            ) : audits.length === 0 ? (
              <p className="text-fg-muted">{t.common.empty}</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wide text-fg-faint">
                        <th className="px-4 py-3 text-start font-semibold">ID</th>
                        <th className="px-4 py-3 text-start font-semibold">Action</th>
                        <th className="px-4 py-3 text-start font-semibold">User</th>
                        <th className="px-4 py-3 text-start font-semibold">Resource</th>
                        <th className="px-4 py-3 text-start font-semibold">Details</th>
                        <th className="px-4 py-3 text-start font-semibold">IP</th>
                        <th className="px-4 py-3 text-start font-semibold">Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audits.map((audit) => (
                        <tr
                          key={audit.id}
                          className="border-b border-border last:border-0 hover:bg-surface-2/60"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-fg">{audit.id.slice(0, 8)}</td>
                          <td className="px-4 py-3">
                            <Badge tone="neutral">{audit.action}</Badge>
                          </td>
                          <td className="px-4 py-3 text-fg">{audit.adminEmail ?? audit.adminId}</td>
                          <td className="px-4 py-3 text-fg-muted">
                            {audit.targetType ? (
                              <>
                                {audit.targetType}
                                {audit.targetId ? (
                                  <span className="ml-2 font-mono text-xs text-fg-faint">
                                    {audit.targetId.slice(0, 8)}
                                  </span>
                                ) : null}
                              </>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3 max-w-xs truncate text-fg-muted">
                            {audit.metadata?.method ? `${audit.metadata.method} ${audit.metadata.path}` : "—"}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-fg-muted">{audit.ip ?? "—"}</td>
                          <td className="px-4 py-3 text-fg-muted">{formatDate(audit.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {meta && meta.totalPages > 1 && (
                  <Pagination className="mt-6" page={page} totalPages={meta.totalPages} onPageChange={setPage} />
                )}
              </>
            )}
          </CardBody>
        </Card>
      </section>
    </>
  );
}