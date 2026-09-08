import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
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
  placeholder?: string;
  /** Overrides the label rendered on the closed trigger. */
  displayLabel?: ReactNode;
}

interface SelectOptionSource {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
}

function collectOptions(children: ReactNode): SelectOptionSource[] {
  const options: SelectOptionSource[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const type = (child.type as string | undefined) ?? "";
    if (type === "optgroup") {
      const groupChildren = (child.props as { children?: ReactNode }).children;
      Children.forEach(groupChildren, (oc) => {
        if (!isValidElement(oc) || (oc.type as string) !== "option") return;
        const p = oc.props as {
          value?: string | number;
          children?: ReactNode;
          disabled?: boolean;
        };
        options.push({
          value: p.value ?? "",
          label: p.children ?? "",
          disabled: p.disabled,
        });
      });
    } else if (type === "option") {
      const p = child.props as {
        value?: string | number;
        children?: ReactNode;
        disabled?: boolean;
      };
      options.push({
        value: p.value ?? "",
        label: p.children ?? "",
        disabled: p.disabled,
      });
    }
  });
  return options;
}

function optionText(label: ReactNode): string {
  return typeof label === "string"
    ? label
    : typeof label === "number"
      ? String(label)
      : "";
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(function Select(
  {
    label,
    error,
    hint,
    id,
    required,
    className,
    children,
    value,
    onChange,
    disabled,
    placeholder,
    displayLabel: displayLabelProp,
    ...rest
  },
  ref
) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const listboxId = id ? `${id}-listbox` : undefined;

  const options = useMemo(() => collectOptions(children), [children]);

  const selectedIndex = options.findIndex(
    (o) => String(o.value) === String(value),
  );
  const selected =
    selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const displayLabel =
    typeof displayLabelProp !== "undefined" && displayLabelProp !== null
      ? displayLabelProp
      : selected
        ? selected.label
        : options[0]
          ? options[0].label
          : (placeholder ?? "");

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const choose = (option: SelectOptionSource) => {
    onChange?.({
      target: { value: option.value },
    } as unknown as ChangeEvent<HTMLSelectElement>);
    close();
  };

  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const list = listRef.current;
    if (!trigger || !list) return;
    const rect = trigger.getBoundingClientRect();
    const listHeight = list.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const flip = spaceBelow < listHeight + 16 && rect.top > spaceBelow;
    const available = flip ? rect.top : spaceBelow;
    Object.assign(list.style, {
      position: "fixed",
      top: `${flip ? Math.max(8, rect.top - listHeight - 6) : rect.bottom + 6}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      maxHeight: `${Math.max(120, Math.min(240, available - 12))}px`,
      zIndex: "100",
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      close();
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && listRef.current?.contains(event.target)) {
        return;
      }
      close();
    };
    const onResize = () => close();
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  const moveActive = (direction: 1 | -1) => {
    if (options.length === 0) return;
    setActiveIndex((prev) => {
      const start =
        prev >= 0 ? prev : selectedIndex >= 0 ? selectedIndex : 0;
      let next = start;
      for (let step = 1; step <= options.length; step++) {
        next =
          (start + direction * step + options.length) % options.length;
        if (!options[next].disabled) break;
      }
      return next;
    });
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (activeIndex >= 0 && !options[activeIndex]?.disabled) {
        choose(options[activeIndex]);
      }
    } else if (event.key === "Tab" || event.key === "Escape") {
      close();
    }
  };

  return (
    <Field label={label} error={error} hint={hint} id={id} required={required}>
      <div
        ref={(node) => {
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className="relative"
      >
        <button
          ref={triggerRef}
          type="button"
          id={id}
          role="combobox"
          aria-invalid={Boolean(error)}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          disabled={disabled}
          onClick={() => {
            setOpen((v) => !v);
            setActiveIndex(selectedIndex);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              moveActive(event.key === "ArrowDown" ? 1 : -1);
            }
          }}
          className={cn(
            baseField,
            "appearance-none pe-10 text-start",
            error && invalidField,
            className
          )}
          {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          <span className="block truncate ps-1">{displayLabel}</span>
          <svg
            className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-fg-faint"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
      {open &&
        createPortal(
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            onKeyDown={handleListKeyDown}
            className="overflow-y-auto rounded-lg border border-border bg-elevated p-1 shadow-xl"
          >
              {options.length === 0 && (
                <li className="px-3 py-2 text-sm text-fg-faint">
                  {placeholder ?? ""}
                </li>
              )}
              {options.map((option, index) => {
                const isSelected = String(option.value) === String(value);
                const isActive = index === activeIndex;
                return (
                  <li key={`${option.value}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      onClick={() => choose(option)}
                      onMouseMove={() => setActiveIndex(index)}
                      className={cn(
                        "block w-full rounded-md px-3 py-2 text-start text-sm transition-colors",
                        isSelected
                          ? "bg-brand-500/15 font-medium text-brand-700 dark:text-brand-300"
                          : isActive
                            ? "bg-surface-2 text-fg"
                            : "text-fg hover:bg-surface-2",
                        option.disabled && "cursor-not-allowed opacity-50"
                      )}
                    >
                      {optionText(option.label)}
                    </button>
                  </li>
                );
              })}
            </ul>,
          document.body
        )}
    </Field>
  );
});