import { Link } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { LanguageSwitcher, ThemeToggle } from "./themeControls";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../i18n";

export function Footer() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <footer className="border-t  border-border bg-surface/60">
        <div className="mx-auto mt-4 max-w-7xl px-4 py-3 text-center text-xs text-fg-faint sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {t.brand.name} — {t.footer.rights}
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-fg-muted">
              {t.footer.tagline}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle compact />
            </div>
          </div>

          <nav aria-label={t.footer.exploreTitle}>
            <h3 className="text-sm font-semibold text-fg">
              {t.footer.exploreTitle}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-fg-muted transition-colors hover:text-brand-600"
                >
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link
                  to="/explore"
                  className="text-fg-muted transition-colors hover:text-brand-600"
                >
                  {t.nav.explore}
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-fg-muted transition-colors hover:text-brand-600"
                >
                  {t.nav.howItWorks}
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link
                    to="/create"
                    className="text-fg-muted transition-colors hover:text-brand-600"
                  >
                    {t.footer.createStory}
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <nav aria-label={t.footer.resourceTitle}>
            <h3 className="text-sm font-semibold text-fg">
              {t.footer.resourceTitle}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <span className="cursor-default text-fg-muted">
                  {t.footer.about}
                </span>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (window.location.pathname === "/") {
                      document.getElementById("features")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                      return;
                    }
                    window.location.href = "/#features";
                  }}
                  className="text-fg-muted transition-colors hover:text-brand-600"
                >
                  {t.nav.features}
                </button>
              </li>
              <li>
                <span className="cursor-default text-fg-muted">
                  {t.footer.contact}
                </span>
              </li>
            </ul>
          </nav>

          <nav aria-label={t.footer.legalTitle}>
            <h3 className="text-sm font-semibold text-fg">
              {t.footer.legalTitle}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <span className="cursor-default text-fg-muted">
                  {t.footer.privacy}
                </span>
              </li>
              <li>
                <span className="cursor-default text-fg-muted">
                  {t.footer.terms}
                </span>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-fg-faint sm:flex-row">
          <p>
            © {new Date().getFullYear()} {t.brand.name} — {t.footer.rights}
          </p>
          <p>{t.brand.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
