import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 shadow-sm shadow-brand-700/20",
  secondary:
    "bg-navy-900 text-white hover:bg-navy-800 dark:bg-navy-700 dark:hover:bg-navy-600",
  ghost: "text-fg hover:bg-surface-3 bg-transparent",
  outline:
    "border border-border-strong bg-transparent text-fg hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-900/20",
  subtle: "bg-surface-2 text-fg hover:bg-surface-3 border border-border",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-6 py-3 gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, fullWidth, leadingIcon, trailingIcon, className, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-colors duration-200 whitespace-nowrap",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent ms-0.5" aria-hidden />
      ) : (
        leadingIcon
      )}
      <span className="inline-flex items-center gap-1.5">
        {children}
        {trailingIcon}
      </span>
    </button>
  );
});

export { Button };
export type { ButtonProps, Variant as ButtonVariant, Size as ButtonSize };