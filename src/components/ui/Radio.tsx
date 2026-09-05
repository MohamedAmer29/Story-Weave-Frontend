import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  label?: ReactNode;
  className?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, id, className, checked, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label htmlFor={inputId} className={cn("inline-flex cursor-pointer items-start gap-2.5 select-none", className)}>
      <span className="relative inline-flex shrink-0">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          checked={checked}
          aria-checked={checked}
          className="peer sr-only"
          {...rest}
        />
        <span
          aria-hidden
          className={cn(
            "flex size-5 items-center justify-center rounded-full border transition-colors duration-150",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/40 peer-focus-visible:outline-none",
            checked
              ? "border-brand-600 dark:border-brand-500"
              : "border-border-strong bg-surface",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
          )}
        >
          <span
            className={cn(
              "size-2.5 rounded-full bg-brand-600 transition-opacity duration-150 dark:bg-brand-500",
              checked ? "opacity-100" : "opacity-0"
            )}
          />
        </span>
      </span>
      {label != null && <span className="pt-0.5 text-sm leading-5 text-fg">{label}</span>}
    </label>
  );
});

interface RadioGroupProps {
  label?: string;
  children: ReactNode;
  className?: string;
}

function RadioGroup({ label, children, className }: RadioGroupProps) {
  return (
    <fieldset className={cn("space-y-1.5", className)}>
      {label && <legend className="mb-0.5 text-sm font-medium text-fg">{label}</legend>}
      <div role="radiogroup" aria-label={label} className="space-y-1.5">
        {children}
      </div>
    </fieldset>
  );
}

export { Radio, RadioGroup };
export type { RadioProps, RadioGroupProps };