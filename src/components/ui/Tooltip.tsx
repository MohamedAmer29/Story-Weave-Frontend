import { cloneElement, useId, type ReactElement, type ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  placement?: "top" | "bottom";
  className?: string;
}

export function Tooltip({ content, children, placement = "top", className }: TooltipProps) {
  const id = useId();

  return (
    <span className={cn("group relative inline-flex", className)}>
      {cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
        "aria-describedby": id,
      })}
      <span
        id={id}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 w-max max-w-xs -translate-x-1/2 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-fg opacity-0 shadow-lg",
          "transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
          placement === "top"
            ? "bottom-full mb-2"
            : "top-full mt-2"
        )}
      >
        {content}
      </span>
    </span>
  );
}