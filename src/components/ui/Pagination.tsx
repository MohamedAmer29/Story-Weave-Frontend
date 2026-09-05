import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { useLanguage } from "../../i18n";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const { t } = useLanguage();
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    }
  }

  const items: Array<number | "…"> = [];
  let last = 0;
  for (const p of pages) {
    if (p - last > 1) items.push("…");
    items.push(p);
    last = p;
  }

  return (
    <nav className={cn("flex items-center justify-center gap-1", className)} aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={t.common.previous}
      >
        <ChevronLeft className="size-4 rtl:rotate-180" />
      </button>
      {items.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-1 text-fg-faint">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
              p === page
                ? "bg-brand-600 text-white"
                : "border border-border text-fg-muted hover:bg-surface-2 hover:text-fg"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={t.common.next}
      >
        <ChevronRight className="size-4 rtl:rotate-180" />
      </button>
    </nav>
  );
}