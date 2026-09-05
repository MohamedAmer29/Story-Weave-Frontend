import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-surface-3 text-fg-muted border-border",
  brand: "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  info: "bg-sky-400/10 text-navy-900 dark:text-sky-300 border-sky-400/20",
};

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ tone = "neutral", children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}