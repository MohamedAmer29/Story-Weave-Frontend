import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Globe,
  Loader2,
  Lock,
  Pencil,
  Share2,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { storiesApi, illustrationApi } from "../api/storiesApi";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/field";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { PageLoader } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/States";
import { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../i18n";
import { useAppDispatch, useAppSelector } from "../store";
import { setPage as savePage } from "../store/readerSlice";
import { cn } from "../lib/cn";
import {
  buildResponsiveSrcSet,
  withImageCacheBust,
} from "../utils/imageSrcSet";
import type { IllustrationPageStatus } from "../api/types";

const activeStatuses: IllustrationPageStatus[] = [
  "PENDING",
  "QUEUED",
  "GENERATING",
  "UPLOADING",
];

export function StoryReaderPage() {
  const { id } = useParams<{ id: string }>();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const storyId = id!;

  const page = useAppSelector(
    (state) => state.reader.lastPageByStory[storyId] ?? 1,
  );

  const query = useQuery({
    queryKey: ["story", storyId],
    queryFn: () => storiesApi.get(storyId),
    enabled: Boolean(storyId),
  });

  const isOwner = Boolean(user && storyId && user.id === query.data?.author.id);

  const statusQuery = useQuery({
    queryKey: ["story", storyId, "illustration-status"],
    queryFn: () => illustrationApi.status(storyId),
    enabled: isOwner && Boolean(query.data) && query.data?.status === "READY",
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (
        status === "COMPLETED" ||
        status === "FAILED" ||
        status === "PARTIALLY_FAILED"
      )
        return false;
      return 4000;
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => illustrationApi.generate(storyId),
    onSuccess: () => {
      toast.success(t.create.generationStarted);
      void queryClient.invalidateQueries({
        queryKey: ["story", storyId, "illustration-status"],
      });
      void queryClient.invalidateQueries({ queryKey: ["story", storyId] });
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const deleteMutation = useMutation({
    mutationFn: () => storiesApi.remove(storyId),
    onSuccess: () => {
      toast.success(t.library.deleted);
      navigate("/library");
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const isGenerating =
    statusQuery.data?.status === "GENERATING" ||
    statusQuery.data?.status === "QUEUED";

  const sections = useMemo(() => query.data?.sections ?? [], [query.data]);
  const totalPages = Math.max(sections.length, 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const current = sections[safePage - 1];

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <PageLoader label={t.reader.loading} />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <ErrorState
          title={t.reader.storyNotFound}
          onRetry={() => query.refetch()}
          retryLabel={t.common.retry}
        />
      </div>
    );
  }

  const story = query.data;
  const storyCoverSrc = story.cover.imageUrl
    ? withImageCacheBust(story.cover.imageUrl, story.updatedAt)
    : null;
  const currentImageSrc = current.imageUrl
    ? withImageCacheBust(current.imageUrl, story.updatedAt)
    : null;
  const statusLabel = (s: IllustrationPageStatus | null) => {
    if (s === "COMPLETED") return t.reader.illustrationStatus.COMPLETED;
    if (s === "FAILED") return t.reader.illustrationStatus.FAILED;
    if (activeStatuses.includes(s ?? "PENDING")) {
      return t.reader.illustrationStatus[s ?? "PENDING"];
    }
    return t.reader.illustrationStatus.PENDING;
  };

  const goTo = (target: number) => {
    const next = Math.min(Math.max(target, 1), totalPages);
    dispatch(savePage({ storyId, page: next }));
  };

  return (
    <>
      <Helmet>
        <title>
          {story.title} · {t.brand.name}
        </title>
        <meta name="description" content={story.description ?? undefined} />
      </Helmet>

      <section className="hero-aurora relative">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/library"
            className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
            {t.reader.backToLibrary}
          </Link>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row">
            <div className="mx-auto w-full max-w-xs shrink-0 lg:mx-0">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
                {storyCoverSrc ? (
                  <img
                    src={storyCoverSrc}
                    alt={story.title}
                    loading="lazy"
                    srcSet={buildResponsiveSrcSet(storyCoverSrc) ?? undefined}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-brand-600/20 via-surface to-navy-800/20 p-6 text-center">
                    <BookOpen
                      className="size-10 text-brand-500/60"
                      aria-hidden
                    />
                    <span className="font-display text-lg font-bold text-fg">
                      {story.title}
                    </span>
                  </div>
                )}
                {story.cover.imageStatus === "FAILED" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-overlay">
                    <Badge tone="danger">
                      {t.reader.illustrationStatus.FAILED}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  tone={
                    story.visibility === "PUBLIC"
                      ? "brand"
                      : story.visibility === "SHARED"
                        ? "info"
                        : "neutral"
                  }
                >
                  {story.visibility === "PUBLIC" ? (
                    <Globe className="size-3" aria-hidden />
                  ) : (
                    <Lock className="size-3" aria-hidden />
                  )}
                  {
                    t.reader[
                      story.visibility.toLowerCase() as
                        | "public"
                        | "private"
                        | "shared"
                    ]
                  }
                </Badge>
                {story.storyType && (
                  <Badge tone="neutral">{story.storyType}</Badge>
                )}
                <Badge tone="neutral">
                  {t.reader.pages}: {story.stats.totalPages}
                </Badge>
              </div>

              <h1 className="font-display mt-4 text-3xl font-bold leading-tight text-fg sm:text-4xl">
                {story.title}
              </h1>

              {story.description && (
                <p className="mt-3 text-base text-fg-muted">
                  {story.description}
                </p>
              )}

              <p className="mt-3 text-sm text-fg-faint">
                {t.reader.by}{" "}
                <span className="font-medium text-fg-muted">
                  {story.author.name}
                </span>
              </p>

              <div className="mt-6 grid max-w-md grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                {story.era && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-fg-faint">
                      {t.create.era}
                    </p>
                    <p className="font-medium text-fg">
                      {story.era === "UNSPECIFIED" ? "—" : story.era}
                    </p>
                  </div>
                )}
                {story.year != null && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-fg-faint">
                      {t.create.year}
                    </p>
                    <p className="font-medium text-fg">{story.year}</p>
                  </div>
                )}
                {story.location && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-fg-faint">
                      {t.create.location}
                    </p>
                    <p className="font-medium text-fg">{story.location}</p>
                  </div>
                )}
                {story.civilization && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-fg-faint">
                      {t.create.civilization}
                    </p>
                    <p className="font-medium text-fg">
                      {story.civilization === "UNSPECIFIED"
                        ? "—"
                        : story.civilization}
                    </p>
                  </div>
                )}
                {story.theme && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-fg-faint">
                      {t.create.theme}
                    </p>
                    <p className="font-medium text-fg">
                      {story.theme === "UNSPECIFIED" ? "—" : story.theme}
                    </p>
                  </div>
                )}
                {story.language && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-fg-faint">
                      {t.create.language}
                    </p>
                    <p className="font-medium text-fg">{story.language}</p>
                  </div>
                )}
              </div>

              {isOwner && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/stories/${storyId}/edit`)}
                  >
                    <Pencil className="size-4" aria-hidden />
                    {t.reader.editStory}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShareOpen(true)}
                  >
                    <Share2 className="size-4" aria-hidden />
                    {t.reader.share}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateMutation.mutate()}
                    loading={generateMutation.isPending}
                    disabled={isGenerating}
                    className="border-brand-500/40 text-brand-600 hover:bg-brand-500/10 dark:text-brand-400"
                  >
                    {isGenerating ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Wand2 className="size-4" aria-hidden />
                    )}
                    {isGenerating ? t.create.generating : t.create.generateNow}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-fg-muted hover:text-red-600"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    {t.reader.deleteStory}
                  </Button>
                </div>
              )}

              {/* Generation progress */}
              {statusQuery.data && statusQuery.data.totalPages > 0 && (
                <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold text-fg">
                      <Sparkles
                        className="size-4 text-brand-600 dark:text-brand-400"
                        aria-hidden
                      />
                      {t.reader.generationProgress}
                    </span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      {statusQuery.data.progress}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500"
                      style={{ width: `${statusQuery.data.progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-fg-faint">
                    {statusQuery.data.completed}/{statusQuery.data.totalPages}{" "}
                    {dir === "rtl" ? "صفحات مصوّرة" : "illustrated"} ·{" "}
                    {statusQuery.data.failed}{" "}
                    {dir === "rtl" ? "فاشلة" : "failed"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Reader */}
          {sections.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border-strong bg-surface/50 p-10 text-center">
              <p className="text-fg-muted">{t.reader.noPages}</p>
              {isOwner && (
                <Button
                  className="mt-4"
                  onClick={() => generateMutation.mutate()}
                  loading={generateMutation.isPending}
                >
                  {t.create.generateNow}
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-12 space-y-10">
              <div
                className={cn(
                  "overflow-hidden rounded-2xl border border-border bg-surface shadow-xl",
                )}
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <span className="text-sm font-semibold text-fg-muted">
                    {t.reader.page} {safePage} {t.reader.of} {totalPages}
                  </span>
                  <span className="text-xs text-fg-faint">
                    {t.reader.readingProgress}:{" "}
                    {Math.round((safePage / totalPages) * 100)}%
                  </span>
                </div>
                <div className="grid grid-cols-1">
                  <article className="p-6 sm:p-10 lg:p-12" dir={dir}>
                    <div className="story-book-layout">
                      {currentImageSrc ? (
                        <figure
                          className={cn(
                            "story-book-figure cursor-pointer",
                            dir === "rtl"
                              ? "story-book-figure-rtl"
                              : "story-book-figure-ltr",
                          )}
                          onClick={() => setExpandedImage(currentImageSrc)}
                        >
                          <img
                            src={currentImageSrc}
                            alt=""
                            loading="lazy"
                            className="mx-auto max-h-[28rem] rounded-xl border border-border object-contain shadow-lg transition-transform duration-200 hover:scale-[1.02]"
                          />
                          {current.imageStatus !== "COMPLETED" && (
                            <figcaption className="mt-2 text-center text-xs text-fg-faint">
                              {statusLabel(current.imageStatus)}
                            </figcaption>
                          )}
                        </figure>
                      ) : (
                        <div
                          className={cn(
                            "story-book-figure story-book-placeholder",
                            dir === "rtl"
                              ? "story-book-figure-rtl"
                              : "story-book-figure-ltr",
                          )}
                        >
                          <div className="flex min-h-[14rem] items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-2/60 p-8 text-sm text-fg-faint">
                            {activeStatuses.includes(
                              (current.imageStatus ??
                                "PENDING") as IllustrationPageStatus,
                            ) ? (
                              <>
                                <Loader2
                                  className="size-4 animate-spin"
                                  aria-hidden
                                />
                                {
                                  t.reader.illustrationStatus[
                                    current.imageStatus ?? "PENDING"
                                  ]
                                }
                              </>
                            ) : current.imageStatus === "FAILED" ? (
                              t.reader.illustrationStatus.FAILED
                            ) : null}
                          </div>
                        </div>
                      )}

                      <p className="story-book-text whitespace-pre-line text-lg leading-loose text-fg">
                        {current.text}
                      </p>
                    </div>
                  </article>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => goTo(safePage - 1)}
                  disabled={safePage <= 1}
                >
                  <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
                  {t.common.previous}
                </Button>
                <span className="text-sm text-fg-faint">
                  {safePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => goTo(safePage + 1)}
                  disabled={safePage >= totalPages}
                >
                  {t.common.next}
                  <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {expandedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setExpandedImage(null);
          }}
        >
          <div className="relative flex h-full w-full items-center justify-center">
            <button
              type="button"
              onClick={() => setExpandedImage(null)}
              aria-label={t.common.close}
              className="absolute right-4 top-4 z-10 rounded-full border border-border bg-surface/80 p-2 text-fg shadow-lg transition hover:bg-surface"
            >
              <X className="size-5" />
            </button>
            <img
              src={expandedImage}
              alt="Expanded story illustration"
              className="max-h-[92vh] w-full max-w-[96vw] rounded-2xl border border-border bg-surface object-contain shadow-2xl transition-transform duration-200"
            />
          </div>
        </div>
      )}

      <ShareModal
        storyId={storyId}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t.library.confirmDelete}
      >
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            {t.common.delete}
          </Button>
        </div>
      </Modal>
    </>
  );
}

function ShareModal({
  storyId,
  open,
  onClose,
}: {
  storyId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sharesQuery = useQuery({
    queryKey: ["story", storyId, "shares"],
    queryFn: () => storiesApi.shareEntries(storyId),
    enabled: open,
  });

  const shareMutation = useMutation({
    mutationFn: (userId: string) => storiesApi.share(storyId, userId),
    onSuccess: () => {
      toast.success(t.share.shared);
      setRecipient("");
      void queryClient.invalidateQueries({
        queryKey: ["story", storyId, "shares"],
      });
    },
    onError: (err) => setError(getErrorMessage(err) ?? t.common.error),
  });

  const revokeMutation = useMutation({
    mutationFn: (userId: string) => storiesApi.revokeShare(storyId, userId),
    onSuccess: () => {
      toast.success(t.share.revoked);
      void queryClient.invalidateQueries({
        queryKey: ["story", storyId, "shares"],
      });
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.share.title}
      description={t.share.subtitle}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={recipient}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setRecipient(e.target.value);
              setError(null);
            }}
            placeholder={t.share.userEmail}
            aria-label={t.share.userEmail}
            type="email"
          />
          <Button
            onClick={() => {
              const trimmed = recipient.trim();
              if (trimmed.length < 8) {
                setError(t.validation.minLength.replace("{count}", "8"));
                return;
              }
              void shareMutation.mutateAsync(trimmed).catch(() => undefined);
            }}
            loading={shareMutation.isPending}
          >
            {t.share.shareAction}
          </Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div>
          <p className="mb-2 text-sm font-semibold text-fg">
            {t.share.sharedWith}
          </p>
          {sharesQuery.isLoading ? (
            <p className="text-sm text-fg-faint">{t.common.loading}</p>
          ) : sharesQuery.data?.data.length === 0 ? (
            <p className="text-sm text-fg-faint">{t.share.noShares}</p>
          ) : (
            <ul className="space-y-2">
              {(sharesQuery.data?.data ?? []).map((share) => (
                <li
                  key={share.userId}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-fg">
                      {share.name}
                    </p>
                    <p className="truncate text-xs text-fg-muted">
                      {share.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeMutation.mutate(share.userId)}
                    className="text-fg-muted hover:text-red-600"
                  >
                    {t.share.revoke}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
