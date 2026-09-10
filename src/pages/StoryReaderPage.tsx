import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGSAP } from "@gsap/react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Globe,
  Heart,
  ListPlus,
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
import { favouritesApi } from "../api/favouritesApi";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/field";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { VisualContextOverrideForm } from "../components/story/VisualContextOverrideForm";
import { PageLoader } from "../components/ui/Skeleton";
import { useContentLoading } from "../layouts/PageLoading";
import { ErrorState } from "../components/ui/States";
import { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../i18n";
import { getCivilizationLabel } from "../constants/civilizations";
import { humanize } from "../lib/storyCatalog";
import { useStoryCivilizations, useStoryEras } from "../hooks/useStoryOptions";
import { useAppDispatch, useAppSelector } from "../store";
import { setPage as savePage } from "../store/readerSlice";
import { cn } from "../lib/cn";
import { gsap, prefersReducedMotion, revealEase } from "../lib/gsap";
import { withImageCacheBust } from "../utils/imageSrcSet";
import type {
  IllustrationPageStatus,
  VisualContextOverrides,
} from "../api/types";

const activeStatuses: IllustrationPageStatus[] = [
  "PENDING",
  "QUEUED",
  "GENERATING",
  "UPLOADING",
];

const loadedIllustrationSrcs = new Set<string>();

function regenerationProgress(
  status: IllustrationPageStatus | null | undefined,
  pending: boolean,
): number {
  if (pending) return 8;
  switch (status) {
    case "QUEUED":
      return 20;
    case "GENERATING":
      return 55;
    case "UPLOADING":
      return 85;
    case "COMPLETED":
      return 100;
    default:
      return 0;
  }
}

function RegenerationProgress({
  label,
  status,
  pending,
}: {
  label: string;
  status: IllustrationPageStatus | null | undefined;
  pending: boolean;
}) {
  const progress = regenerationProgress(status, pending);
  const active = ["QUEUED", "GENERATING", "UPLOADING"].includes(status ?? "");
  if (!pending && !active) return null;

  return (
    <div className="mt-3 rounded-xl border border-brand-500/20 bg-brand-500/5 p-3">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-fg">
        <span className="flex items-center gap-2">
          <Loader2
            className="size-3.5 animate-spin text-brand-600 dark:text-brand-400"
            aria-hidden
          />
          {label}
        </span>
        <span className="text-brand-600 dark:text-brand-400">{progress}%</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function StoryPageIllustration({
  src,
  imageStatus,
  statusLabel,
  onExpand,
  loadingLabel,
  generatingLabel,
}: {
  src: string;
  imageStatus: IllustrationPageStatus | null;
  statusLabel: (s: IllustrationPageStatus | null) => string;
  onExpand: (src: string) => void;
  loadingLabel: string;
  generatingLabel: string;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "error">(() =>
    loadedIllustrationSrcs.has(src) ? "loaded" : "loading",
  );
  const isGenerating =
    imageStatus === "PENDING" ||
    imageStatus === "QUEUED" ||
    imageStatus === "GENERATING" ||
    imageStatus === "UPLOADING";

  const markLoaded = () => {
    loadedIllustrationSrcs.add(src);
    setState("loaded");
  };

  return (
    <figure
      className="story-book-figure cursor-pointer"
      onClick={() => onExpand(src)}
    >
      <div className="relative flex min-h-[14rem] items-center justify-center">
        {(state !== "loaded" || isGenerating) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-2/60 p-8 text-sm text-fg-faint">
            {state === "error" ? (
              imageStatus === "FAILED" ? (
                statusLabel(imageStatus)
              ) : null
            ) : (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {isGenerating ? generatingLabel : loadingLabel}
              </>
            )}
          </div>
        )}
        <img
          ref={(img) => {
            if (img && img.complete && img.naturalWidth > 0) {
              markLoaded();
            }
          }}
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={markLoaded}
          onError={() => setState("error")}
          className={cn(
            "block max-h-[28rem] max-w-full overflow-hidden rounded-xl border border-border object-contain shadow-lg transition-[opacity,transform] duration-200 hover:scale-[1.02]",
            state === "loaded" ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
      {imageStatus !== "COMPLETED" && (
        <figcaption className="mt-2 text-center text-xs text-fg-faint">
          {isGenerating ? generatingLabel : statusLabel(imageStatus)}
        </figcaption>
      )}
    </figure>
  );
}

export function StoryReaderPage() {
  const { id } = useParams<{ id: string }>();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const [shareOpen, setShareOpen] = useState(false);
  const [appendOpen, setAppendOpen] = useState(false);
  const [appendText, setAppendText] = useState("");
  const [appendFile, setAppendFile] = useState<File | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [regenerationTarget, setRegenerationTarget] = useState<
    "page" | "cover" | null
  >(null);
  const rootRef = useRef<HTMLElement>(null);

  const storyId = id!;

  const page = useAppSelector(
    (state) => state.reader.lastPageByStory[storyId] ?? 1,
  );

  const query = useQuery({
    queryKey: ["story", storyId],
    queryFn: () => storiesApi.get(storyId),
    enabled: Boolean(storyId),
  });

  const { data: civilizationOptions } = useStoryCivilizations();
  const { data: eraOptions } = useStoryEras();

  const favoriteQuery = useQuery({
    queryKey: ["story", storyId, "favorite"],
    queryFn: () => favouritesApi.status(storyId),
    enabled: Boolean(isAuthenticated && storyId),
  });

  const favoriteMutation = useMutation({
    mutationFn: (favoritedNow: boolean) =>
      favoritedNow ? favouritesApi.remove(storyId) : favouritesApi.add(storyId),
    onMutate: async (favoritedNow) => {
      await queryClient.cancelQueries({
        queryKey: ["story", storyId, "favorite"],
      });
      queryClient.setQueryData(["story", storyId, "favorite"], {
        favorited: !favoritedNow,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["favourites"] });
    },
    onError: (err) => {
      void queryClient.invalidateQueries({
        queryKey: ["story", storyId, "favorite"],
      });
      toast.error(getErrorMessage(err) ?? t.common.error);
    },
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
    onSuccess: async () => {
      toast.success(t.create.generationStarted);
      await queryClient.invalidateQueries({
        queryKey: ["story", storyId, "illustration-status"],
      });
      await queryClient.invalidateQueries({ queryKey: ["story", storyId] });
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const illustrateRemainingMutation = useMutation({
    mutationFn: () => illustrationApi.illustrateRemaining(storyId),
    onSuccess: async (data) => {
      toast.success(
        data.pagesQueued > 0
          ? t.reader.illustrateRemainingStarted
          : t.reader.allPagesIllustrated,
      );
      await queryClient.invalidateQueries({
        queryKey: ["story", storyId, "illustration-status"],
      });
      await queryClient.invalidateQueries({ queryKey: ["story", storyId] });
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const regenerateCoverMutation = useMutation({
    mutationFn: (overrides: VisualContextOverrides) =>
      illustrationApi.regenerateCover(storyId, overrides),
    onSuccess: async () => {
      toast.success("Cover regeneration queued");
      await queryClient.invalidateQueries({
        queryKey: ["story", storyId, "illustration-status"],
      });
      await queryClient.invalidateQueries({ queryKey: ["story", storyId] });
      setRegenerationTarget(null);
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const regeneratePageMutation = useMutation({
    mutationFn: ({
      pageId,
      overrides,
    }: {
      pageId: string;
      overrides: VisualContextOverrides;
    }) => illustrationApi.regeneratePage(storyId, pageId, overrides),
    onSuccess: async () => {
      toast.success("Page regeneration queued");
      await queryClient.invalidateQueries({
        queryKey: ["story", storyId, "illustration-status"],
      });
      await queryClient.invalidateQueries({ queryKey: ["story", storyId] });
      setRegenerationTarget(null);
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

  const appendMutation = useMutation({
    mutationFn: () =>
      storiesApi.append(storyId, {
        content: appendText.trim() || undefined,
        file: appendFile ?? undefined,
      }),
    onSuccess: async () => {
      toast.success("Story continuation added");
      setAppendText("");
      setAppendFile(null);
      setAppendOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["story", storyId] });
      await queryClient.invalidateQueries({
        queryKey: ["story", storyId, "illustration-status"],
      });
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const isGenerating =
    statusQuery.data?.status === "GENERATING" ||
    statusQuery.data?.status === "QUEUED";
  const illustrationCompleted = statusQuery.data?.status === "COMPLETED";
  const canIllustrateRemaining =
    !isGenerating &&
    !illustrationCompleted &&
    Boolean(statusQuery.data) &&
    (statusQuery.data?.failed ?? 0) > 0;
  const generationProgress = Math.min(
    100,
    Math.max(0, statusQuery.data?.progress ?? 0),
  );

  useEffect(() => {
    const status = statusQuery.data?.status;
    if (!status || status === "GENERATING" || status === "QUEUED") {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: ["story", storyId] });
  }, [queryClient, storyId, statusQuery.data?.status]);

  const sections = useMemo(() => query.data?.sections ?? [], [query.data]);
  const pages = useMemo(() => query.data?.pages ?? [], [query.data]);
  const totalPages = Math.max(sections.length, 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const current = sections[safePage - 1];
  const currentPageEntity = pages.find((item) => item.pageNumber === safePage);
  const currentPageRegenerating =
    current?.imageStatus === "GENERATING" ||
    current?.imageStatus === "QUEUED" ||
    current?.imageStatus === "UPLOADING";
  const preloadedSrcs = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!pages.length) return;
    [safePage - 1, safePage, safePage + 1].forEach((index) => {
      const p = pages.find((item) => item.pageNumber === index);
      const url = p?.imageUrl;
      if (!url) return;
      const stamp = p.updatedAt || url;
      const src = withImageCacheBust(url, stamp);
      if (!src) return;
      if (preloadedSrcs.current.has(src)) return;
      preloadedSrcs.current.add(src);
      const img = new Image();
      img.src = src;
    });
  }, [safePage, pages]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const items = rootRef.current?.querySelectorAll("[data-page-reveal]");
      if (!items?.length) return;
      gsap.fromTo(
        items,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: revealEase },
      );
    },
    {
      scope: rootRef,
      dependencies: [storyId, safePage],
    },
  );

  useContentLoading(query.isLoading);

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
    ? withImageCacheBust(
        story.cover.imageUrl,
        story.updatedAt,
      )
    : null;
  const pageImageStamp =
    currentPageEntity?.updatedAt || current?.imageUrl;
  const currentImageSrc = current?.imageUrl
    ? withImageCacheBust(current.imageUrl, pageImageStamp)
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
    <div ref={rootRef as any} className="min-h-screen bg-surface-2 text-fg">
      <Helmet>
        <title>{story ? `${story.title} | Story` : "Story"}</title>
      </Helmet>

      {/* Dynamic Header */}
      <header className="sticky top-0 z-20 border-b border-border/80 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-1.5 text-fg-muted hover:text-fg"
            >
              <ArrowLeft className="size-4" aria-hidden />
              <span className="hidden sm:inline">{t.common.back}</span>
            </Button>
            <div className="h-4 w-px bg-border" />
            <h2 className="line-clamp-1 max-w-xs font-display text-sm font-semibold text-fg sm:max-w-md">
              {story.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && story.status === "READY" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  favoriteMutation.mutate(
                    favoriteQuery.data?.favorited ?? false,
                  )
                }
                disabled={favoriteMutation.isPending}
                className="gap-1.5 text-fg-muted hover:text-fg"
                aria-label={
                  favoriteQuery.data?.favorited
                    ? t.favourites.remove
                    : t.favourites.add
                }
              >
                <Heart
                  className={`size-4 ${
                    favoriteQuery.data?.favorited
                      ? "fill-brand-600 text-brand-600 dark:fill-brand-400 dark:text-brand-400"
                      : ""
                  }`}
                  aria-hidden
                />
                <span className="hidden sm:inline">
                  {favoriteQuery.data?.favorited
                    ? t.favourites.favourited
                    : t.favourites.add}
                </span>
              </Button>
            )}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShareOpen(true)}
                className="gap-1.5 text-fg-muted hover:text-fg"
              >
                <Share2 className="size-4" aria-hidden />
                <span className="hidden sm:inline">{t.reader.share}</span>
              </Button>
            )}
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAppendOpen(true)}
                className="gap-1.5"
              >
                <ListPlus className="size-4" aria-hidden />
                <span className="hidden sm:inline">Append text</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/60 bg-surface/40 p-6 backdrop-blur-sm sm:p-8">
          {/* Top metadata grid */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            <div data-page-reveal className="w-full shrink-0 lg:w-72">
              <div className="story-book-figure group relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-xl">
                {storyCoverSrc ? (
                  <div className="relative size-full">
                    <img
                      src={storyCoverSrc}
                      alt={story.title}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {isOwner && (
                      <div className="absolute bottom-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setRegenerationTarget("cover")}
                          loading={regenerateCoverMutation.isPending}
                          disabled={
                            regenerateCoverMutation.isPending || isGenerating
                          }
                        >
                          <Wand2 className="size-3.5" aria-hidden />
                          Regenerate cover
                        </Button>
                      </div>
                    )}
                  </div>
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
              <RegenerationProgress
                label="Regenerating cover"
                status={story.cover.imageStatus}
                pending={regenerateCoverMutation.isPending}
              />
            </div>

            <div data-page-reveal className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  tone={
                    story.visibility === "PUBLIC"
                      ? "brand"
                      : story.visibility === "SHARED" ||
                          story.visibility === "MEMBERS"
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
                        | "members"
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

              <h1 className="font-display mt-4 text-3xl font-bold leading-tight text-display-tight text-fg sm:text-4xl">
                {story.title}
              </h1>

              {story.description && (
                <p className="mt-3 text-base text-copy-rhythm text-fg-muted">
                  {story.description}
                </p>
              )}

              <p className="mt-3 text-sm text-fg-faint">
                {t.reader.by}{" "}
                <Link
                  to={`/author/${story.author.id}`}
                  className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  {story.author.name}
                </Link>
              </p>

              <div className="mt-6 grid max-w-md grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                {Boolean(story.era || story.eraId || story.eraName) && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-fg-faint">
                      {t.create.era}
                    </p>
                    <p className="font-medium text-fg">
                      {story.eraName ??
                        eraOptions?.find((e) => e.id === story.eraId)?.name ??
                        (story.era && story.era !== "UNSPECIFIED"
                          ? humanize(story.era)
                          : "—")}
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
                {Boolean(
                  story.civilization ||
                    story.civilizationId ||
                    story.civilizationName ||
                    story.customCivilization,
                ) && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-fg-faint">
                      {t.create.civilization}
                    </p>
                    <p className="font-medium text-fg">
                      {story.civilizationName ||
                        story.customCivilization ||
                        (story.civilization &&
                        story.civilization !== "UNSPECIFIED"
                          ? getCivilizationLabel(story.civilization) ||
                            story.civilization
                          : civilizationOptions?.find(
                              (c) => c.id === story.civilizationId,
                            )?.name) ||
                        "—"}
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
                    onClick={() => setAppendOpen(true)}
                  >
                    <ListPlus className="size-4" aria-hidden />
                    Append text
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
                    disabled={isGenerating || illustrationCompleted}
                    className="border-brand-500/40 text-brand-600 hover:bg-brand-500/10 dark:text-brand-400"
                  >
                    {isGenerating ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : illustrationCompleted ? (
                      <Sparkles className="size-4" aria-hidden />
                    ) : (
                      <Wand2 className="size-4" aria-hidden />
                    )}
                    {isGenerating
                      ? t.create.generating
                      : illustrationCompleted
                        ? t.reader.illustrationStatus.COMPLETED
                        : t.create.generateNow}
                  </Button>
                  {canIllustrateRemaining && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => illustrateRemainingMutation.mutate()}
                      loading={illustrateRemainingMutation.isPending}
                      disabled={isGenerating}
                      className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
                    >
                      <ListPlus className="size-4" aria-hidden />
                      {t.reader.illustrateRemaining}
                    </Button>
                  )}
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
              {((statusQuery.data?.totalPages ?? 0) > 0 ||
                generateMutation.isPending) && (
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
                      {generationProgress}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-fg-faint">
                    {statusQuery.data?.completed ?? 0}/
                    {statusQuery.data?.totalPages ?? 0}{" "}
                    {dir === "rtl" ? "صفحات مصوّرة" : "illustrated"} ·{" "}
                    {statusQuery.data?.failed ?? 0}{" "}
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
                  disabled={isGenerating || illustrationCompleted}
                >
                  {illustrationCompleted
                    ? t.reader.illustrationStatus.COMPLETED
                    : t.create.generateNow}
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
                        <div className="space-y-3">
                          <StoryPageIllustration
                            key={currentImageSrc}
                            src={currentImageSrc}
                            imageStatus={current.imageStatus}
                            statusLabel={statusLabel}
                            onExpand={setExpandedImage}
                            loadingLabel={t.common.loading}
                            generatingLabel={t.create.generating}
                          />
                          {isOwner && (
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (!currentPageEntity?.id) return;
                                  setRegenerationTarget("page");
                                }}
                                loading={regeneratePageMutation.isPending}
                                disabled={
                                  regeneratePageMutation.isPending ||
                                  currentPageRegenerating ||
                                  !currentPageEntity?.id
                                }
                              >
                                <Wand2 className="size-4" aria-hidden />
                                Regenerate page illustration
                              </Button>
                            </div>
                          )}
                          <RegenerationProgress
                            label="Regenerating page illustration"
                            status={currentPageEntity?.imageStatus}
                            pending={regeneratePageMutation.isPending}
                          />
                        </div>
                      ) : (
                        <div className="story-book-figure story-book-placeholder">
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

                      <p className="story-book-text whitespace-pre-line text-lg text-reading-rhythm text-fg">
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
      </main>

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
        open={appendOpen}
        onClose={() => setAppendOpen(false)}
        title="Append new text"
        description="Continue this story with text or a PDF. The server will split it into pages automatically."
        size="lg"
      >
        <div className="space-y-4">
          <Textarea
            label="Continuation text"
            rows={8}
            maxLength={100000}
            value={appendText}
            onChange={(event) => setAppendText(event.target.value)}
            disabled={Boolean(appendFile)}
            placeholder="Write what happens next..."
          />
          <div className="space-y-2">
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setAppendFile(file);
                if (file) setAppendText("");
              }}
              className="block w-full text-sm text-fg-muted file:me-3 file:rounded-md file:border-0 file:bg-brand-500/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-500/15 dark:file:text-brand-300"
              aria-label="Upload continuation PDF"
            />
            <p className="text-xs text-fg-muted">
              Choose text or a PDF, not both.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => setAppendOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              loading={appendMutation.isPending}
              disabled={
                (!appendText.trim() && !appendFile) ||
                (Boolean(appendText.trim()) && Boolean(appendFile))
              }
              onClick={() => appendMutation.mutate()}
            >
              Append continuation
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={regenerationTarget !== null}
        onClose={() => setRegenerationTarget(null)}
        title={
          regenerationTarget === "cover"
            ? "Regenerate cover"
            : "Regenerate page illustration"
        }
        description="Adjust the visual context for this regeneration only."
        size="lg"
      >
        <VisualContextOverrideForm
          loading={
            regenerateCoverMutation.isPending ||
            regeneratePageMutation.isPending
          }
          onCancel={() => setRegenerationTarget(null)}
          onSubmit={(overrides) => {
            setRegenerationTarget(null);
            if (regenerationTarget === "cover") {
              regenerateCoverMutation.mutate(overrides);
              return;
            }
            if (currentPageEntity?.id) {
              regeneratePageMutation.mutate({
                pageId: currentPageEntity.id,
                overrides,
              });
            }
          }}
        />
      </Modal>

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
    </div>
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
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const sharesQuery = useQuery({
    queryKey: ["story", storyId, "shares"],
    queryFn: () => storiesApi.shareEntries(storyId),
    enabled: open,
  });

  const shareMutation = useMutation({
    mutationFn: (email: string) => storiesApi.share(storyId, email),
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
      setRevokeTarget(null);
      void queryClient.invalidateQueries({
        queryKey: ["story", storyId, "shares"],
      });
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  return (
    <>
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
                if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
                  setError(t.validation.emailInvalid);
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
                      onClick={() => setRevokeTarget(share.userId)}
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

      <ConfirmDialog
        open={Boolean(revokeTarget)}
        title={t.share.revoke}
        message={t.share.confirmRevoke}
        loading={revokeMutation.isPending}
        onConfirm={() => revokeTarget && revokeMutation.mutate(revokeTarget)}
        onCancel={() => setRevokeTarget(null)}
      />
    </>
  );
}
