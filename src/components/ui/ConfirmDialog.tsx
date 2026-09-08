import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { useLanguage } from "../../i18n";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  loading,
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl">
        <h2 className="text-lg font-bold text-fg">{title}</h2>
        {message && <p className="mt-1.5 text-sm text-fg-muted">{message}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel ?? t.common.cancel}
          </Button>
          <Button variant={variant} loading={loading} onClick={onConfirm}>
            {confirmLabel ?? t.common.confirm}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}