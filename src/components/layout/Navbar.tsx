import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu as MenuIcon,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { Logo } from "../ui/Logo";
import { Button } from "../ui/Button";
import { Dropdown, MenuItem } from "../ui/Dropdown";
import { Avatar } from "../ui/Avatar";
import { LanguageSwitcher, ThemeToggle } from "./themeControls";
import { useAuth, useIsAdmin } from "../../hooks/useAuth";
import { useUnreadCount } from "../../hooks/useNotifications";
import { toast } from "react-toastify";
import { cn } from "../../lib/cn";
import { useLanguage } from "../../i18n";
import { closeMobileNav, openMobileNav } from "../../store/uiSlice";
import { useAppDispatch, useAppSelector } from "../../store";

interface NavLinkDef {
  to: string;
  key: string;
}

function guestLinks(t: ReturnType<typeof useLanguage>["t"]): NavLinkDef[] {
  return [
    { to: "/", key: t.nav.home },
    { to: "/explore", key: t.nav.explore },
    { to: "/how-it-works", key: t.nav.howItWorks },
    { to: "/#features", key: t.nav.features },
  ];
}

function userLinks(t: ReturnType<typeof useLanguage>["t"]): NavLinkDef[] {
  return [
    { to: "/dashboard", key: t.nav.dashboard },
    { to: "/library", key: t.nav.myStories },
    { to: "/create", key: t.nav.createStory },
  ];
}

export function Navbar() {
  const { t } = useLanguage();
  const { isAuthenticated, user, logout, loggedIn } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const mobileOpen = useAppSelector((s) => s.ui.mobileNavOpen);
  const { data: unreadCount } = useUnreadCount();

  const isLandingPage = location.pathname === "/";
  const guestNavLinks = guestLinks(t);
  const links = loggedIn
    ? userLinks(t)
    : isLandingPage
      ? guestNavLinks
      : guestNavLinks.filter((link) => link.to !== "/#features");
  const isHomeActive = isLandingPage && !location.hash;
  const isFeaturesActive = isLandingPage && location.hash === "#features";
  const isExploreActive = location.pathname === "/explore";
  const isHowItWorksActive = location.pathname === "/how-it-works";
  const showAdminGlobalControls = loggedIn && isAdmin;

  const handleLogout = async () => {
    dispatch(closeMobileNav());
    await logout();
    toast.success(t.auth.logoutSuccess);
    navigate("/");
  };

  const go = (to: string) => {
    dispatch(closeMobileNav());
    navigate(to);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-canvas/72 backdrop-blur-2xl">
      <div className="mx-auto flex h-[4.5rem] w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center justify-start gap-3 lg:gap-4">
          <div className="shrink-0">
            <Logo />
          </div>

          {showAdminGlobalControls && (
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-brand-200 bg-brand-500/8 px-3 py-1.5 text-sm font-semibold text-brand-700 shadow-sm dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
              <ShieldCheck className="size-3.5" aria-hidden />
              {t.nav.admin}
            </span>
          )}

          <nav
            className="hidden min-w-0 items-center gap-1 lg:flex"
            aria-label="Primary"
          >
            {links.map((link) => {
              const isActive =
                link.to === "/"
                  ? isHomeActive
                  : link.to === "/explore"
                    ? isExploreActive
                    : link.to === "/how-it-works"
                      ? isHowItWorksActive
                      : link.to === "/#features"
                        ? isFeaturesActive
                        : false;

              return (
                <NavLink
                  key={link.key}
                  to={link.to}
                  end={
                    link.to === "/" ||
                    link.to === "/explore" ||
                    link.to === "/how-it-works"
                  }
                  onClick={(event) => {
                    if (link.to === "/#features") {
                      event.preventDefault();
                      const target = document.getElementById("features");
                      if (window.location.pathname === "/" && target) {
                        target.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                        return;
                      }
                      navigate("/");
                      requestAnimationFrame(() => {
                        document.getElementById("features")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      });
                    }
                  }}
                  className={() =>
                    cn(
                      "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-500/12 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                        : "text-fg-muted hover:bg-surface-3/80 hover:text-fg",
                    )
                  }
                >
                  {link.key}
                </NavLink>
              );
            })}
            {/* {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-brand-600 dark:text-brand-400 bg-brand-500/10"
                      : "text-fg-muted hover:bg-surface-3 hover:text-fg",
                  )
                }
              >
                {t.nav.admin}
              </NavLink>
            )} */}
          </nav>
        </div>

        {/* <div className="hidden flex-1 items-center justify-start px-4 lg:flex">
          {showAdminGlobalControls && (
            <label className="flex w-full max-w-xl items-center gap-3 rounded-[22px] border border-border bg-surface px-4 py-3 text-fg-muted shadow-sm">
              <Search className="size-4" aria-hidden />
              <input
                aria-label="Platform overview search"
                className="w-full border-0 bg-transparent text-sm text-fg placeholder:text-fg-muted focus:outline-none"
                placeholder="Platform Overview"
              />
            </label>
          )}
        </div> */}

        <div className="hidden shrink-0 items-center justify-end gap-2 lg:flex">
          <LanguageSwitcher />
          <ThemeToggle compact />
          {!loggedIn && (
            <>
              <Button variant="ghost" onClick={() => go("/login")}>
                {t.nav.login}
              </Button>
              <Button onClick={() => go("/register")}>{t.nav.register}</Button>
            </>
          )}
          {isAuthenticated && (
            <>
              {showAdminGlobalControls && (
                <button
                  type="button"
                  onClick={() => go("/notifications")}
                  aria-label={t.nav.notifications}
                  className="relative inline-flex size-11 items-center justify-center rounded-xl border border-border bg-surface text-fg transition-colors hover:border-brand-500/40"
                >
                  <Bell className="size-4" aria-hidden />
                  {unreadCount && unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </button>
              )}
              <Dropdown
                ariaLabel={t.nav.profile}
                trigger={
                  <span className="flex items-center gap-2 rounded-xl border border-border bg-surface px-2 py-1.5">
                    <Avatar
                      src={user?.avatarUrl ?? undefined}
                      name={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
                      size="md"
                    />
                    <span className="hidden min-w-0 sm:block">
                      <span className="block truncate text-sm font-semibold text-fg">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <span className="block text-[11px] uppercase tracking-[0.15em] text-fg-muted">
                        {user?.role ?? "ADMIN"}
                      </span>
                    </span>
                    <ChevronDown className="size-4 text-fg-muted" />
                  </span>
                }
              >
                {(close) => (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar
                        src={user?.avatarUrl ?? undefined}
                        name={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
                        size="lg"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-fg">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="truncate text-xs text-fg-muted">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="my-1 h-px bg-border" />
                    <MenuItem
                      onClick={() => {
                        close();
                        go("/settings");
                      }}
                    >
                      <Settings className="size-4" /> {t.nav.settings}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        close();
                        void handleLogout();
                      }}
                      danger
                    >
                      <LogOut className="size-4" /> {t.nav.logout}
                    </MenuItem>
                  </>
                )}
              </Dropdown>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          {loggedIn ? (
            <NavLink
              to="/notifications"
              className="relative rounded-lg p-2 text-fg-muted hover:text-fg"
              aria-label={t.nav.notifications}
            >
              <Bell className="size-5" />
              {unreadCount ? (
                <span className="absolute -top-0.5 -end-0.5 flex size-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </NavLink>
          ) : null}
          <button
            onClick={() =>
              dispatch(mobileOpen ? closeMobileNav() : openMobileNav())
            }
            aria-label={t.nav.menu}
            aria-expanded={mobileOpen}
            className="rounded-lg p-2 text-fg-muted hover:bg-surface-3 hover:text-fg"
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {!loggedIn && mobileOpen && (
        <div className="sf-slide-down border-t border-border bg-surface lg:hidden">
          <nav
            className="mx-auto max-w-7xl space-y-1 px-4 py-4"
            aria-label={t.nav.menu}
          >
            {links.map((link) => (
              <NavLink
                key={link.key}
                to={link.to}
                end={link.to === "/"}
                onClick={(event) => {
                  if (link.to === "/#features") {
                    event.preventDefault();
                    dispatch(closeMobileNav());
                    const target = document.getElementById("features");
                    if (window.location.pathname === "/" && target) {
                      target.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                      return;
                    }
                    navigate("/");
                    requestAnimationFrame(() => {
                      document.getElementById("features")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    });
                    return;
                  }
                  dispatch(closeMobileNav());
                }}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted hover:bg-surface-2 hover:text-fg"
              >
                {link.key}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => dispatch(closeMobileNav())}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted hover:bg-surface-2 hover:text-fg"
              >
                {t.nav.admin}
              </NavLink>
            )}
            {isAuthenticated && (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => dispatch(closeMobileNav())}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted hover:bg-surface-2 hover:text-fg"
                >
                  {t.nav.profile}
                </NavLink>
                <button
                  onClick={() => {
                    void handleLogout();
                  }}
                  className="block w-full rounded-lg px-3 py-2.5 text-start text-sm font-medium text-red-600 hover:bg-red-500/10 dark:text-red-400"
                >
                  {t.nav.logout}
                </button>
              </>
            )}
            <div className="flex items-center gap-3 pt-3">
              <LanguageSwitcher />
              <ThemeToggle compact />
            </div>
            {!loggedIn && (
              <div className="flex gap-3 pt-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => go("/login")}
                >
                  {t.nav.login}
                </Button>
                <Button fullWidth onClick={() => go("/register")}>
                  {t.nav.register}
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
