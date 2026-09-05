import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { adminApi } from "../../api/adminApi";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/Tabs";
import { TabsProvider } from "../../components/ui/Tabs";
import { Input, Select } from "../../components/ui/field";
import { Pagination } from "../../components/ui/Pagination";
import { useLanguage } from "../../i18n";
import { cn } from "../../lib/cn";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

interface FailedJob {
  id: string;
  name: string;
  attemptsMade: number;
  failedReason: string;
  timestamp: string;
  processedOn: string;
  data: {
    storyId: string;
    storyPageId: string | null;
    userId: string;
  };
}

interface GenerationPage {
  pageId: string;
  pageNumber: number;
  imageStatus: string;
  imageUrl: string | null;
  imageError: string | null;
  imageGeneratedAt: string | null;
  updatedAt: string;
  story: {
    id: string;
    title: string;
  };
  owner: {
    id: string;
    email: string;
  };
}

export function AdminQueuePage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    "overview" | "failures" | "generations"
  >("overview");

  const [failurePage, setFailurePage] = useState(1);
  const [generationPage, setGenerationPage] = useState(1);
  const [generationStoryId, setGenerationStoryId] = useState("");
  const [generationStatus, setGenerationStatus] = useState("");

  const queueStats = useQuery({
    queryKey: ["admin", "queue"],
    queryFn: adminApi.queueStats,
  });

  const failures = useQuery({
    queryKey: ["admin", "queue", "failures", { page: failurePage, limit: 20 }],
    queryFn: () => adminApi.queueFailures({ page: failurePage, limit: 20 }),
    enabled: activeTab === "failures",
  });

  const generations = useQuery({
    queryKey: ["admin", "generations", { page: generationPage, limit: 20, storyId: generationStoryId, imageStatus: generationStatus }],
    queryFn: () => adminApi.generations({ page: generationPage, limit: 20, storyId: generationStoryId || undefined, imageStatus: generationStatus || undefined }),
    enabled: activeTab === "generations",
  });

  const queueCounts = queueStats.data?.counts ?? {
    waiting: 0,
    active: 0,
    delayed: 0,
    failed: 0,
    completed: 0,
  };

  const barChartData = {
    labels: ["Waiting", "Active", "Delayed", "Failed", "Completed"],
    datasets: [
      {
        label: "Jobs",
        data: [
          queueCounts.waiting,
          queueCounts.active,
          queueCounts.delayed,
          queueCounts.failed,
          queueCounts.completed,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(99, 102, 241, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(245, 158, 11)",
          "rgb(239, 68, 68)",
          "rgb(99, 102, 241)",
        ],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const doughnutChartData = {
    labels: ["Waiting", "Active", "Delayed", "Failed", "Completed"],
    datasets: [
      {
        data: [
          queueCounts.waiting,
          queueCounts.active,
          queueCounts.delayed,
          queueCounts.failed,
          queueCounts.completed,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(99, 102, 241, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(245, 158, 11)",
          "rgb(239, 68, 68)",
          "rgb(99, 102, 241)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const getStatusBadgeTone = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "FAILED":
        return "danger";
      case "GENERATING":
      case "UPLOADING":
        return "warning";
      case "QUEUED":
      case "PENDING":
        return "info";
      default:
        return "neutral";
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {t.admin.queuePageTitle} · {t.brand.name}
        </title>
      </Helmet>
      <TabsProvider value={activeTab} onValueChange={setActiveTab}>
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">
              {t.admin.queuePageTitle}
            </h1>
            <p className="mt-2 text-fg-muted">{t.admin.queuePageSubtitle}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">{t.admin.queueTitle}</TabsTrigger>
              <TabsTrigger value="failures">{t.admin.failedTitle}</TabsTrigger>
              <TabsTrigger value="generations">
                {t.admin.generationsList}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <h3 className="font-bold text-fg">Queue Distribution</h3>
                  </CardHeader>
                  <CardBody>
                    {queueStats.isLoading ? (
                      <Skeleton className="h-64" />
                    ) : queueStats.isError ? (
                      <p className="text-red-600">{t.common.error}</p>
                    ) : (
                      <>
                        <div className="h-64">
                          <Bar
                            data={barChartData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                            }}
                          />
                        </div>
                        <div className="mt-6 h-64">
                          <Doughnut
                            data={doughnutChartData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                            }}
                          />
                        </div>
                      </>
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="font-bold text-fg">Queue Statistics</h3>
                  </CardHeader>
                  <CardBody>
                    {queueStats.isLoading ? (
                      <div className="grid grid-cols-3 gap-2">
                        <Skeleton className="h-20" />
                        <Skeleton className="h-20" />
                        <Skeleton className="h-20" />
                        <Skeleton className="h-20" />
                        <Skeleton className="h-20" />
                        <Skeleton className="h-20" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="rounded-lg bg-surface-2 p-4">
                          <p className="text-3xl font-bold text-fg">
                            {queueCounts.total}
                          </p>
                          <p className="text-sm text-fg-muted">Total</p>
                        </div>
                        <div className="rounded-lg bg-surface-2 p-4">
                          <p className="text-3xl font-bold text-blue-600">
                            {queueCounts.waiting}
                          </p>
                          <p className="text-sm text-fg-muted">Waiting</p>
                        </div>
                        <div className="rounded-lg bg-surface-2 p-4">
                          <p className="text-3xl font-bold text-emerald-600">
                            {queueCounts.active}
                          </p>
                          <p className="text-sm text-fg-muted">Active</p>
                        </div>
                        <div className="rounded-lg bg-surface-2 p-4">
                          <p className="text-3xl font-bold text-amber-600">
                            {queueCounts.delayed}
                          </p>
                          <p className="text-sm text-fg-muted">Delayed</p>
                        </div>
                        <div className="rounded-lg bg-surface-2 p-4">
                          <p className="text-3xl font-bold text-red-600">
                            {queueCounts.failed}
                          </p>
                          <p className="text-sm text-fg-muted">Failed</p>
                        </div>
                        <div className="rounded-lg bg-surface-2 p-4">
                          <p className="text-3xl font-bold text-indigo-600">
                            {queueCounts.completed}
                          </p>
                          <p className="text-sm text-fg-muted">Completed</p>
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="failures">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="font-bold text-fg">{t.admin.failedTitle}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Select
                      value={failurePage}
                      onChange={(e) => setFailurePage(Number(e.target.value))}
                      className="w-auto"
                    >
                      {Array.from({ length: failures.data?.meta?.totalPages ?? 1 }, (_, i) => i + 1).map((p) => (
                        <option key={p} value={p}>
                          Page {p}
                        </option>
                      ))}
                    </Select>
                  </div>
                </CardHeader>
                <CardBody>
                  {failures.isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12" />
                      <Skeleton className="h-12" />
                      <Skeleton className="h-12" />
                    </div>
                  ) : failures.isError ? (
                    <p className="text-red-600">{t.common.error}</p>
                  ) : failures.data?.data?.length === 0 ? (
                    <p className="text-fg-muted">{t.common.empty}</p>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-sm">
                          <thead>
                            <tr className="border-b border-border text-xs uppercase tracking-wide text-fg-faint">
                              <th className="px-4 py-3 text-start font-semibold">Job ID</th>
                              <th className="px-4 py-3 text-start font-semibold">Type</th>
                              <th className="px-4 py-3 text-start font-semibold">Failed At</th>
                              <th className="px-4 py-3 text-start font-semibold">Error</th>
                              <th className="px-4 py-3 text-start font-semibold">Attempts</th>
                              <th className="px-4 py-3 text-start font-semibold">Story ID</th>
                              <th className="px-4 py-3 text-start font-semibold">Page ID</th>
                            </tr>
                          </thead>
                          <tbody>
                            {failures.data?.data?.map((failure: FailedJob) => (
                              <tr
                                key={failure.id}
                                className="border-b border-border last:border-0 hover:bg-surface-2/60"
                              >
                                <td className="px-4 py-3 font-mono text-xs text-fg max-w-xs truncate">
                                  {failure.id}
                                </td>
                                <td className="px-4 py-3">
                                  <Badge tone="neutral">{failure.name}</Badge>
                                </td>
                                <td className="px-4 py-3 text-fg-muted">
                                  {new Date(failure.timestamp).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-red-600 max-w-xs truncate" title={failure.failedReason}>
                                  {failure.failedReason}
                                </td>
                                <td className="px-4 py-3 text-fg-muted">
                                  {failure.attemptsMade}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-fg-muted">
                                  {failure.data.storyId}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-fg-muted">
                                  {failure.data.storyPageId ?? "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {failures.data?.meta && failures.data.meta.totalPages > 1 && (
                        <Pagination
                          className="mt-6"
                          page={failurePage}
                          totalPages={failures.data.meta.totalPages}
                          onPageChange={setFailurePage}
                        />
                      )}
                    </>
                  )}
                </CardBody>
              </Card>
            </TabsContent>

            <TabsContent value="generations">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="font-bold text-fg">{t.admin.generationsList}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Input
                      placeholder={t.common.search + " (Story ID)"}
                      value={generationStoryId}
                      onChange={(e) => {
                        setGenerationStoryId(e.target.value);
                        setGenerationPage(1);
                      }}
                      className="w-64"
                    />
                    <Select
                      value={generationStatus}
                      onChange={(e) => {
                        setGenerationStatus(e.target.value);
                        setGenerationPage(1);
                      }}
                      className="w-44"
                    >
                      <option value="">{t.status.all}</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="FAILED">FAILED</option>
                      <option value="GENERATING">GENERATING</option>
                      <option value="UPLOADING">UPLOADING</option>
                      <option value="QUEUED">QUEUED</option>
                      <option value="PENDING">PENDING</option>
                    </Select>
                  </div>
                </CardHeader>
                <CardBody>
                  {generations.isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12" />
                      <Skeleton className="h-12" />
                      <Skeleton className="h-12" />
                    </div>
                  ) : generations.isError ? (
                    <p className="text-red-600">{t.common.error}</p>
                  ) : generations.data?.data?.length === 0 ? (
                    <p className="text-fg-muted">{t.common.empty}</p>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] text-sm">
                          <thead>
                            <tr className="border-b border-border text-xs uppercase tracking-wide text-fg-faint">
                              <th className="px-4 py-3 text-start font-semibold">Page ID</th>
                              <th className="px-4 py-3 text-start font-semibold">Page #</th>
                              <th className="px-4 py-3 text-start font-semibold">Story</th>
                              <th className="px-4 py-3 text-start font-semibold">Status</th>
                              <th className="px-4 py-3 text-start font-semibold">Image</th>
                              <th className="px-4 py-3 text-start font-semibold">Generated At</th>
                              <th className="px-4 py-3 text-start font-semibold">Owner</th>
                            </tr>
                          </thead>
                          <tbody>
                            {generations.data?.data?.map((gen: GenerationPage) => (
                              <tr
                                key={gen.pageId}
                                className="border-b border-border last:border-0 hover:bg-surface-2/60"
                              >
                                <td className="px-4 py-3 font-mono text-xs text-fg max-w-xs truncate">
                                  {gen.pageId}
                                </td>
                                <td className="px-4 py-3 text-fg-muted">
                                  {gen.pageNumber}
                                </td>
                                <td className="px-4 py-3 text-fg">
                                  <div className="font-medium">{gen.story.title}</div>
                                  <div className="text-xs text-fg-muted">{gen.story.id}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge tone={getStatusBadgeTone(gen.imageStatus)}>
                                    {gen.imageStatus}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3">
                                  {gen.imageUrl ? (
                                    <img
                                      src={gen.imageUrl}
                                      alt={`Page ${gen.pageNumber}`}
                                      className="size-12 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <span className="text-fg-muted">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-fg-muted">
                                  {gen.imageGeneratedAt
                                    ? new Date(gen.imageGeneratedAt).toLocaleString()
                                    : "—"}
                                </td>
                                <td className="px-4 py-3 text-fg-muted">
                                  {gen.owner.email}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {generations.data?.meta && generations.data.meta.totalPages > 1 && (
                        <Pagination
                          className="mt-6"
                          page={generationPage}
                          totalPages={generations.data.meta.totalPages}
                          onPageChange={setGenerationPage}
                        />
                      )}
                    </>
                  )}
                </CardBody>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </TabsProvider>
    </>
  );
}