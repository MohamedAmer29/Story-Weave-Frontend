import { Helmet } from "react-helmet-async";
import { Link, useRouteError } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "../../i18n";

export function ErrorPage() {
  const { t } = useLanguage();
  const error = useRouteError();
  const message = error instanceof Error ? error.message : undefined;

  return (
    <>
      <Helmet>
        <title>
          {t.errors.errorTitle} · {t.brand.name}
        </title>
      </Helmet>
      <section className="hero-aurora flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
            <AlertTriangle className="size-8" aria-hidden />
          </div>
          <h1 className="font-display mt-6 text-3xl font-bold text-fg sm:text-4xl">
            {t.errors.errorTitle}
          </h1>
          <p className="mt-3 text-fg-muted">{t.errors.errorMessage}</p>
          {message && (
            <p className="mt-4 break-words rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-fg-faint">
              {message}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-700"
            >
              {t.errors.goHome}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}