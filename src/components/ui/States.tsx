import type { ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface-2/60 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-3 text-fg-muted">
        {icon ?? <Inbox className="size-7" />}
      </div>
      <h3 className="text-lg font-semibold text-fg">{title}</h3>
      {description && <p className="max-w-md text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ title, message, onRetry, retryLabel = "Retry" }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
        <AlertTriangle className="size-7" />
      </div>
      <h3 className="text-lg font-semibold text-fg">{title}</h3>
      {message && <p className="max-w-md text-sm text-fg-muted">{message}</p>}
      {onRetry && (
        <div className="mt-2">
          <Button variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}