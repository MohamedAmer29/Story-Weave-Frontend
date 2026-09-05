import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";

type IconButtonVariant = "primary" | "outline" | "ghost" | "danger" | "subtle";
type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  icon: ReactNode;
  ariaLabel: string;
  title?: string;
  loading?: boolean;
  className?: string;
}

const variantClasses: Record<IconButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 shadow-sm shadow-brand-700/20",
  outline:
    "border border-border-strong bg-transparent text-fg hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400",
  ghost: "text-fg hover:bg-surface-3 bg-transparent",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-900/20",
  subtle: "bg-surface-2 text-fg hover:bg-surface-3 border border-border",
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "size-8",
  md: "size-9",
  lg: "size-10",
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = "outline", size = "md", icon, ariaLabel, title, loading, className, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      title={title}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-colors duration-200 shrink-0",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      ) : (
        icon
      )}
    </button>
  );
});

export { IconButton };
export type { IconButtonProps, IconButtonVariant, IconButtonSize };