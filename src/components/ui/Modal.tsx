import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { useLanguage } from "../../i18n";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative w-full rounded-2xl border border-border bg-surface shadow-2xl",
          sizeClasses[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 p-5 pb-0">
          <div>
            {title && <h2 className="text-lg font-bold text-fg">{title}</h2>}
            {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-fg-muted hover:bg-surface-3 hover:text-fg"
            aria-label={t.common.close}
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-border p-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}