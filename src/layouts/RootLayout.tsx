import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Compass,
  LayoutDashboard,
  Library,
  LogOut,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Tags,
  User,
  X,
} from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navbar } from "../components/layout/Navbar";
import { SessionExtensionBanner } from "../components/layout/SessionExtensionBanner";
import { Footer } from "../components/layout/Footer";
import { Avatar } from "../components/ui/Avatar";
import { Logo } from "../components/ui/Logo";
import { Skeleton } from "../components/ui/Skeleton";
import { useLanguage } from "../i18n";
import { useTheme } from "../theme";
import { useAuth, useIsAdmin } from "../hooks/useAuth";
import { useUnreadCount } from "../hooks/useNotifications";
import { PageLoadingProvider, useContentLoading } from "./PageLoading";
import {
  closeMobileNav,
  toggleSidebarCollapsed,
  SIDEBAR_COLLAPSED_STORAGE_KEY,
} from "../store/uiSlice";
import { useAppDispatch, useAppSelector } from "../store";
import { cn } from "../lib/cn";

function SidebarContent({ collapsed = false }: { collapsed?: boolean }) {
  const { t } = useLanguage();
  const { user, loggedIn, logout } = useAuth();
  const isAdmin = useIsAdmin();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { data: unreadCount } = useUnreadCount();

  if (!loggedIn) return null;

  const mainNavItems = [
    { to: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { to: "/library", label: t.nav.myStories, icon: Library },
    { to: "/explore", label: t.nav.explore, icon: Compass },
    { to: "/create", label: t.nav.createStory, icon: PlusCircle },
    { to: "/story-options", label: t.nav.storyOptions, icon: Tags },
    {
      to: "/notifications",
      label: t.nav.notifications,
      icon: Bell,
      badge:
        unreadCount && unreadCount > 0
          ? unreadCount > 9
            ? "9+"
            : unreadCount
          : null,
    },
    { to: "/profile", label: t.nav.profile, icon: User },
  ];

  const closeDrawer = () => dispatch(closeMobileNav());

  const userName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "User";

  return (
    <div className="flex h-full flex-col justify-between py-2">
      <div className="space-y-5">
        {/* User Card */}
        {user && (
          <Link
            to="/profile"
            onClick={closeDrawer}
            title={collapsed ? userName : undefined}
            className={cn(
              "group relative flex items-center rounded-2xl border border-border/80 bg-surface/60 p-2.5 transition-all duration-200 hover:border-brand-500/40 hover:bg-brand-500/5 hover:shadow-sm",
              collapsed ? "justify-center px-2 py-2.5" : "gap-3",
            )}
          >
            <div className="relative shrink-0">
              <Avatar
                src={user.avatarUrl ?? undefined}
                name={userName}
                size={collapsed ? "md" : "md"}
              />
              <span
                className="absolute bottom-0 end-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-surface"
                aria-hidden
              />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-fg group-hover:text-brand-600 dark:group-hover:text-brand-400">
                  {userName}
                </p>
                <p className="truncate text-[11px] text-fg-muted font-medium">
                  {user.email}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                  {user.role ?? "USER"}
                </span>
              </div>
            )}

            {!collapsed && (
              <ChevronRight className="size-4 text-fg-faint transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 group-hover:text-fg-muted" />
            )}
          </Link>
        )}

        {/* Main Navigation */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-fg-faint">
              Navigation
            </p>
          )}
          <nav className="space-y-1" aria-label={t.nav.menu}>
            {mainNavItems.map(({ to, label, icon: Icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                onClick={closeDrawer}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "bg-brand-500/12 text-brand-600 dark:text-brand-400 font-semibold shadow-2xs before:absolute before:inset-y-1.5 before:start-0 before:w-1 before:rounded-r-full before:bg-brand-500"
                      : "text-fg-muted hover:bg-surface-2/80 hover:text-fg hover:translate-x-0.5 rtl:hover:-translate-x-0.5",
                  )
                }
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-transform",
                    collapsed && "size-5",
                  )}
                  aria-hidden
                />
                {!collapsed && <span className="flex-1 truncate">{label}</span>}
                {!collapsed && badge != null && (
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow-xs">
                    {badge}
                  </span>
                )}
                {collapsed && badge != null && (
                  <span className="absolute top-1 end-1 size-2 rounded-full bg-brand-600 ring-2 ring-surface" />
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Admin Navigation Section */}
        {isAdmin && (
          <div className="space-y-1 pt-2 border-t border-border/50">
            {!collapsed && (
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-fg-faint flex items-center gap-1">
                <ShieldCheck className="size-3 text-brand-500" />
                Management
              </p>
            )}
            <NavLink
              to="/admin"
              onClick={closeDrawer}
              title={collapsed ? t.nav.admin : undefined}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  collapsed && "justify-center px-0",
                  isActive || location.pathname.startsWith("/admin")
                    ? "bg-brand-500/12 text-brand-600 dark:text-brand-400 font-semibold before:absolute before:inset-y-1.5 before:start-0 before:w-1 before:rounded-r-full before:bg-brand-500"
                    : "text-fg-muted hover:bg-surface-2/80 hover:text-fg hover:translate-x-0.5 rtl:hover:-translate-x-0.5",
                )
              }
            >
              <Sparkles
                className={cn(
                  "size-4 shrink-0 text-brand-500",
                  collapsed && "size-5",
                )}
                aria-hidden
              />
              {!collapsed && (
                <span className="flex-1 truncate">{t.nav.admin}</span>
              )}
            </NavLink>
          </div>
        )}
      </div>

      {/* Logout Action */}
      <div className="border-t border-border/80 pt-3">
        <button
          type="button"
          onClick={() => {
            closeDrawer();
            void logout();
          }}
          title={collapsed ? t.nav.logout : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-500/10 dark:text-red-400",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut
            className={cn(
              "size-4 shrink-0 transition-transform group-hover:scale-110",
              collapsed && "size-5",
            )}
            aria-hidden
          />
          {!collapsed && <span>{t.nav.logout}</span>}
        </button>
      </div>
    </div>
  );
}

function AuthenticatedSidebar() {
  const { t } = useLanguage();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const dispatch = useAppDispatch();

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_COLLAPSED_STORAGE_KEY,
      collapsed ? "1" : "0",
    );
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "sticky top-[4.5rem] hidden h-[calc(100vh-4.5rem)] shrink-0 self-start border-e border-border/70 bg-surface/75 backdrop-blur-2xl transition-[width] duration-300 ease-in-out lg:block z-20",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="h-full overflow-y-auto px-3 py-4">
        <SidebarContent collapsed={collapsed} />
      </div>

      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={() => dispatch(toggleSidebarCollapsed())}
        aria-label={collapsed ? t.nav.expand : t.nav.collapse}
        title={collapsed ? t.nav.expand : t.nav.collapse}
        className="absolute -end-3.5 top-7 z-30 flex size-7 items-center justify-center rounded-full border border-border/90 bg-surface text-fg-muted shadow-md ring-4 ring-canvas/50 transition-all duration-200 hover:bg-surface-2 hover:text-fg hover:scale-110"
      >
        {collapsed ? (
          <ChevronsRight className="size-4 rtl:rotate-180" aria-hidden />
        ) : (
          <ChevronsLeft className="size-4 rtl:rotate-180" aria-hidden />
        )}
      </button>
    </aside>
  );
}

function SidebarDrawer() {
  const { loggedIn } = useAuth();
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const mobileOpen = useAppSelector((s) => s.ui.mobileNavOpen);

  if (!loggedIn) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => dispatch(closeMobileNav())}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 w-72 max-w-[85vw] transform border-e border-border/80 bg-surface shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full rtl:translate-x-full",
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="flex h-full flex-col overflow-y-auto p-4">
          <div className="mb-4 flex items-center justify-between pb-3 border-b border-border/60">
            <Logo />
            <button
              type="button"
              onClick={() => dispatch(closeMobileNav())}
              aria-label={t.nav.close}
              className="rounded-xl p-2 text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function ContentSkeleton() {
  return (
    <div
      className="absolute inset-0 z-[100] overflow-y-auto bg-canvas p-4 sm:p-6 lg:p-8"
      aria-hidden
    >
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <Skeleton className="h-10 w-3/4 sm:w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function UnverifiedEmailBanner() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (
    !user ||
    user.emailVerified ||
    location.pathname.startsWith("/verify-email")
  ) {
    return null;
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-sm flex items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-2">
        <AlertTriangle
          className="size-4 shrink-0 text-amber-600 dark:text-amber-400 animate-pulse"
          aria-hidden
        />
        <span className="font-medium">{t.verifyEmail.bannerMessage}</span>
      </div>
      <Link
        to={`/verify-email-otp?email=${encodeURIComponent(user.email)}`}
        className="font-semibold underline hover:text-amber-800 dark:hover:text-amber-100 shrink-0"
      >
        {t.verifyEmail.verifyNow}
      </Link>
    </div>
  );
}

function LayoutFrame({ dir, theme }: { dir: string; theme: string }) {
  const { loggedIn } = useAuth();
  const isLoading = useContentLoading();
  const location = useLocation();

  const isVerifyEmailPage = location.pathname.startsWith("/verify-email");

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-fg selection:bg-brand-500/20 selection:text-brand-700 dark:selection:text-brand-300">
      <ScrollToTop />
      {!isVerifyEmailPage && <Navbar />}
      {!isVerifyEmailPage && <UnverifiedEmailBanner />}
      {!isVerifyEmailPage && <SessionExtensionBanner />}
      <div className="mx-auto flex w-full max-w-[1800px] flex-1">
        {!isVerifyEmailPage && loggedIn && <AuthenticatedSidebar />}
        <main className="relative min-w-0 flex-1 px-3 sm:px-6 lg:px-8">
          <Outlet />
          {isLoading && <ContentSkeleton />}
        </main>
      </div>

      <ToastContainer
        position={dir === "rtl" ? "bottom-left" : "bottom-right"}
        theme={theme}
        rtl={dir === "rtl"}
        autoClose={4000}
        newestOnTop
      />

      {!isVerifyEmailPage && <SidebarDrawer />}

      {!isVerifyEmailPage && !isLoading && !loggedIn && <Footer />}
    </div>
  );
}

export function RootLayout() {
  const { dir } = useLanguage();
  const { theme } = useTheme();

  return (
    <PageLoadingProvider>
      <LayoutFrame dir={dir} theme={theme} />
    </PageLoadingProvider>
  );
}
