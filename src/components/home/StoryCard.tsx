import { Link } from "react-router-dom";
import { BookOpen, Image as ImageIcon } from "lucide-react";
import { Card } from "../ui/Card";
import { StatusBadge, VisibilityBadge } from "../ui/badgeHelpers";
import { useLanguage } from "../../i18n";
import type { StoryLibraryItem, StoryResponse } from "../../api/types";
import { buildResponsiveSrcSet } from "../../utils/imageSrcSet";

interface StoryCardProps {
  story: StoryLibraryItem | StoryResponse;
  authorName?: string;
  footer?: React.ReactNode;
}

export function StoryCard({ story, authorName, footer }: StoryCardProps) {
  const { t } = useLanguage();

  const cover = (story as StoryLibraryItem).coverImageUrl;
  const isItem = "coverImageUrl" in story;

  return (
    <Card interactive className="group flex flex-col overflow-hidden">
      <Link
        to={`/stories/${story.id}`}
        className="block"
        aria-label={story.title}
      >
        <div className="relative aspect-[3/2] overflow-hidden bg-surface-2">
          {cover ? (
            <img
              src={cover}
              alt={story.title}
              loading="lazy"
              srcSet={buildResponsiveSrcSet(cover) ?? undefined}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand-600/15 to-navy-800/20 text-fg-faint">
              {isItem ? (
                <ImageIcon className="size-10" aria-hidden />
              ) : (
                <BookOpen className="size-10" aria-hidden />
              )}
            </div>
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
          {authorName && (
            <p className="text-xs text-fg-faint">
              {t.explore.byAuthor.replace("{author}", authorName)}
            </p>
          )}
        </div>
      </Link>

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
