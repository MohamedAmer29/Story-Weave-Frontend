import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const baseField =
  "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-fg placeholder:text-fg-faint transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-surface-2";

const invalidField = "border-error focus:border-error focus:ring-error/20";

interface FieldWrapProps {
  label?: string;
  error?: string;
  hint?: string;
  id?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, error, hint, id, required, children }: FieldWrapProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-fg">
          {label}
          {required && <span className="ms-0.5 text-error">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-fg-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, required, className, startIcon, endIcon, ...rest },
  ref
) {
  return (
    <Field label={label} error={error} hint={hint} id={id} required={required}>
      <div className="relative">
        {startIcon && (
          <div className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-fg-faint">
            {startIcon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          className={cn(
            baseField,
            startIcon ? "ps-10" : "",
            endIcon ? "pe-10" : "",
            error ? invalidField : "",
            className
          )}
          {...rest}
        />
        {endIcon && (
          <div className="absolute end-3.5 top-1/2 -translate-y-1/2 flex items-center">
            {endIcon}
          </div>
        )}
      </div>
    </Field>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, id, required, className, ...rest },
  ref
) {
  return (
    <Field label={label} error={error} hint={hint} id={id} required={required}>
      <textarea
        ref={ref}
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(baseField, "min-h-32 resize-y leading-relaxed", error && invalidField, className)}
        {...rest}
      />
    </Field>
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, id, required, className, children, ...rest },
  ref
) {
  return (
    <Field label={label} error={error} hint={hint} id={id} required={required}>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          className={cn(baseField, "appearance-none pe-10", error && invalidField, className)}
          {...rest}
        >
          {children}
        </select>
        <svg
          className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-fg-faint"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </Field>
  );
});