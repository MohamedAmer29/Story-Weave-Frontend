import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  label?: ReactNode;
  error?: string;
  className?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, id, className, checked, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={inputId} className="inline-flex cursor-pointer items-start gap-2.5 select-none">
        <span className="relative inline-flex shrink-0">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className="peer sr-only"
            {...rest}
          />
          <span
            aria-hidden
            className={cn(
              "flex size-5 items-center justify-center rounded-md border transition-colors duration-150",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/40 peer-focus-visible:outline-none",
              checked
                ? "border-brand-600 bg-brand-600 dark:border-brand-500 dark:bg-brand-500"
                : "border-border-strong bg-surface",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
            )}
          >
            <Check
              strokeWidth={3}
              className={cn("size-3.5 text-white transition-opacity duration-150", checked ? "opacity-100" : "opacity-0")}
            />
          </span>
        </span>
        {label != null && <span className="pt-0.5 text-sm leading-5 text-fg">{label}</span>}
      </label>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
});

export { Checkbox };
export type { CheckboxProps };