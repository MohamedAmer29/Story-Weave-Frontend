import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useLanguage } from "../../i18n";

export function NotFoundPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>
          {t.errors.notFoundTitle} · {t.brand.name}
        </title>
      </Helmet>
      <section className="hero-aurora flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-surface-2 text-fg-faint">
            <FileQuestion className="size-8" aria-hidden />
          </div>
          <h1 className="font-display mt-6 text-3xl font-bold text-fg sm:text-4xl">
            {t.errors.notFoundTitle}
          </h1>
          <p className="mt-3 text-fg-muted">{t.errors.notFoundMessage}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              {t.errors.goBack}
            </Button>
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