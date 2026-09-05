import { useState, type ReactNode } from "react";
import { cn } from "../../lib/cn";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: "start" | "end";
  className?: string;
  ariaLabel?: string;
  menuClassName?: string;
}

export function Dropdown({ trigger, children, align = "end", className, ariaLabel, menuClassName }: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        className="rounded-lg transition-colors hover:bg-surface-3"
      >
        {trigger}
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="menu"
            className={cn(
              "absolute z-40 mt-2 min-w-40 rounded-xl border border-border bg-elevated p-1.5 shadow-xl",
              align === "end" ? "end-0" : "start-0",
              menuClassName
            )}
          >
            {typeof children === "function" ? children(() => setOpen(false)) : children}
          </div>
        </>
      )}
    </div>
  );
}

interface MenuItemProps {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  danger?: boolean;
}

export function MenuItem({ onClick, children, className, danger }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors",
        danger ? "text-red-600 hover:bg-red-500/10 dark:text-red-400" : "text-fg hover:bg-surface-2",
        className
      )}
    >
      {children}
    </button>
  );
}