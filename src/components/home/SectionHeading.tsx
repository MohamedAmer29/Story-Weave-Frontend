import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-start",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/8 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-300">
          <span className="size-1.5 rounded-full bg-brand-500" aria-hidden />
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-[2.4rem] font-semibold leading-[0.95] tracking-[-0.045em] text-fg sm:text-5xl lg:text-[3.6rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-white/70 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-700 shadow-sm shadow-brand-500/5 backdrop-blur-sm dark:border-brand-400/30 dark:bg-white/5">
      <span className="size-2 rounded-full bg-brand-500" aria-hidden />
      {children}
    </p>
  );
}
