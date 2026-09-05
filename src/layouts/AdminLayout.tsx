import { Outlet, Link } from "react-router-dom";
import { ShieldCheck, Home } from "lucide-react";
import { useLanguage } from "../i18n";

export function AdminLayout() {
  const { t } = useLanguage();

  return (
    <>
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5 text-sm sm:px-6 lg:px-8">
          <ShieldCheck className="size-4 text-brand-600 dark:text-brand-400" aria-hidden />
          <span className="font-semibold text-fg">{t.nav.admin}</span>
          <span className="text-fg-faint">·</span>
          <span className="text-fg-muted">{t.admin.title}</span>
          <Link
            to="/dashboard"
            className="ms-auto inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted transition-colors hover:text-fg"
          >
            <Home className="size-3.5" aria-hidden />
            {t.nav.dashboard}
          </Link>
        </div>
      </div>
      <Outlet />
    </>
  );
}