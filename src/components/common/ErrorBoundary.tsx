import { Component, type ErrorInfo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { TriangleAlert } from "lucide-react";
import { Button } from "../ui/Button";
import { useLanguage } from "../../i18n";

export interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function ErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6" role="alert">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-error-soft text-error">
          <TriangleAlert className="size-7" aria-hidden />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-fg">{t.errors.errorTitle}</h1>
        <p className="mt-2 text-sm text-fg-muted">{t.errors.errorMessage}</p>
        {error?.message && <p className="mt-1 text-xs text-fg-faint break-words">{error.message}</p>}
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <Button onClick={onRetry}>{t.common.retry}</Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            {t.errors.goHome}
          </Button>
        </div>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary:", error, info);
    this.props.onError?.(error, info);
  }

  handleRetry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}