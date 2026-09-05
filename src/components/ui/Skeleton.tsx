import { cn } from "../../lib/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent", className)}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-fg-muted">
      <Spinner className="text-brand-500 size-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-surface-3", className)} aria-hidden />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-5 space-y-3", className)}>
      <Skeleton className="aspect-[3/2] w-full rounded-xl" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}