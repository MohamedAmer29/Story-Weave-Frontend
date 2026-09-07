import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Image as ImageIcon } from "lucide-react";
import { Card } from "../ui/Card";
import { StatusBadge, VisibilityBadge } from "../ui/badgeHelpers";
import { useLanguage } from "../../i18n";
import { storiesApi } from "../../api/storiesApi";
import type { StoryLibraryItem, StoryResponse } from "../../api/types";
import {
  buildResponsiveSrcSet,
  resolveImageUrl,
  withImageCacheBust,
} from "../../utils/imageSrcSet";

interface StoryCardProps {
  story: StoryLibraryItem | StoryResponse;
  authorName?: string;
  authorId?: string;
  footer?: React.ReactNode;
}

function CoverPlaceholder({ isItem }: { isItem: boolean }) {
  return (
    <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand-600/15 to-navy-800/20 text-fg-faint transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">
      {isItem ? (
        <ImageIcon className="size-10" aria-hidden />
      ) : (
        <BookOpen className="size-10" aria-hidden />
      )}
    </div>
  );
}

function CardCover({
  src,
  alt,
  isItem,
}: {
  src: string;
  alt: string;
  isItem: boolean;
}) {
  const [broken, setBroken] = useState(false);

  if (broken) return <CoverPlaceholder isItem={isItem} />;

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      srcSet={buildResponsiveSrcSet(src) ?? undefined}
      onError={() => setBroken(true)}
      className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
    />
  );
}

export function StoryCard({ story, authorName, authorId, footer }: StoryCardProps) {
  const { t } = useLanguage();

  const anyStory = story as unknown as Record<string, unknown>;
  const coverField =
    anyStory.coverImageUrl ??
    (anyStory.cover as { imageUrl?: string } | undefined)?.imageUrl ??
    anyStory.coverImage ??
    anyStory.imageUrl ??
    anyStory.thumbnail;
  const cover = resolveImageUrl(coverField as string | undefined);
  const isItem = "illustratedPages" in story;
  const coverSrc = cover
    ? withImageCacheBust(cover, story.updatedAt as string | number)
    : null;

  const { data: fallbackCover } = useQuery({
    queryKey: ["story", "cover", story.id],
    queryFn: () =>
      storiesApi.get(story.id).then((d) => {
        const coverUrl = d.cover.imageUrl ?? null;
        return coverUrl
          ? withImageCacheBust(resolveImageUrl(coverUrl), d.updatedAt)
          : null;
      }),
    enabled: isItem && !coverSrc,
    staleTime: 5 * 60 * 1000,
  });

  const imageSrc = coverSrc ?? fallbackCover ?? null;
  const resolvedAuthorName = authorName ?? ("author" in story ? story.author?.name : undefined);
  const resolvedAuthorId = authorId ?? ("author" in story ? story.author?.id : undefined);

  return (
    <Card interactive className="story-card group flex flex-col overflow-hidden">
      <Link
        to={`/stories/${story.id}`}
        className="block"
        aria-label={story.title}
      >
        <div className="relative aspect-[3/2] overflow-hidden bg-surface-2">
          {imageSrc ? (
            <CardCover key={imageSrc} src={imageSrc} alt={story.title} isItem={isItem} />
          ) : (
            <CoverPlaceholder isItem={isItem} />
          )}
          <div className="absolute start-3 top-3 flex gap-2">
            <StatusBadge status={story.status} />
          </div>
          {story.visibility && (
            <div className="absolute end-3 top-3">
              <VisibilityBadge visibility={story.visibility} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 p-5">
          <h3 className="line-clamp-2 text-base font-bold text-fg transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">
            {story.title}
          </h3>
          {story.description && (
            <p className="line-clamp-2 text-sm text-fg-muted">
              {story.description}
            </p>
          )}
        </div>
      </Link>

      {resolvedAuthorName && resolvedAuthorId && (
        <div className="px-5 pb-4 text-xs text-fg-faint">
          <Link
            to={`/author/${resolvedAuthorId}`}
            className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            {t.explore.byAuthor.replace("{author}", resolvedAuthorName)}
          </Link>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-border px-5 py-3 text-xs text-fg-muted">
        <span className="inline-flex items-center gap-1.5">
          {isItem && (
            <>
              <ImageIcon className="size-3.5" aria-hidden />
              {story.illustratedPages}/{story.totalPages}{" "}
              {t.library.meritsLabel}
            </>
          )}
        </span>
        {footer}
      </div>
    </Card>
  );
}
