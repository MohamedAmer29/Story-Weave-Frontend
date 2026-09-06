import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  Compass,
  LayoutDashboard,
  Library,
  LogOut,
  Plus,
  Sparkles,
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
  const { loggedIn, logout } = useAuth();
  const isAdmin = useIsAdmin();
  const location = useLocation();
  const dispatch = useAppDispatch();

  if (!loggedIn) return null;

  const navItems = [
    { to: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { to: "/library", label: t.nav.myStories, icon: Library },
    { to: "/explore", label: t.nav.explore, icon: Compass },
    { to: "/create", label: t.nav.createStory, icon: Plus },
    { to: "/notifications", label: t.nav.notifications, icon: Bell },
    { to: "/profile", label: t.nav.profile, icon: User },
  ];

  const closeDrawer = () => dispatch(closeMobileNav());

  return (
    <>
      {/* {user && (
        <div
          className={cn(
            " mb-4 rounded-2xl  border border-border bg-surface shadow-sm",
            collapsed ? "p-1" : "p-3",
          )}
        >
          <div
            className={cn(
              "flex items-center",
              collapsed ? "justify-center" : "gap-3",
            )}
          >
            <Avatar
              src={user.avatarUrl ?? undefined}
              name={`${user.firstName ?? ""} ${user.lastName ?? ""}`}
              size="md"
            />
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-fg">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-xs text-fg-muted">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      )} */}

      <nav className="flex-1 space-y-1" aria-label={t.nav.menu}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={closeDrawer}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                isActive ||
                  (to === "/dashboard" && location.pathname === "/dashboard")
                  ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                  : "text-fg-muted hover:bg-surface-2 hover:text-fg",
              )
            }
          >
            <Icon
              className={cn("size-4 shrink-0", collapsed && "size-5")}
              aria-hidden
            />
            {!collapsed && label}
          </NavLink>
        ))}

        {isAdmin && (
          <div className="space-y-1.5">
            <NavLink
              to="/admin"
              onClick={closeDrawer}
              title={collapsed ? t.nav.admin : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-0",
                  isActive || location.pathname.startsWith("/admin")
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                    : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                )
              }
            >
              <Sparkles
                className={cn("size-4 shrink-0", collapsed && "size-5")}
                aria-hidden
              />
              {!collapsed && t.nav.admin}
            </NavLink>
          </div>
        )}
      </nav>
      <div className=" mt-3 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => {
            void logout();
          }}
          title={collapsed ? t.nav.logout : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut
            className={cn("size-4 shrink-0", collapsed && "size-5")}
            aria-hidden
          />
          {!collapsed && t.nav.logout}
        </button>
      </div>
    </>
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
        "sticky top-[4.6rem] hidden h-[90vh] shrink-0 self-start border-r border-border/80 bg-surface/70 backdrop-blur-xl transition-[width] duration-200 lg:block",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div
        className={cn(
          "flex h-full flex-col overflow-y-auto p-3",
          collapsed && "overflow-x-hidden px-2",
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </div>
      <button
        type="button"
        onClick={() => dispatch(toggleSidebarCollapsed())}
        aria-label={collapsed ? t.nav.expand : t.nav.collapse}
        title={collapsed ? t.nav.expand : t.nav.collapse}
        className="absolute end-[-13px] top-8 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-surface text-fg-muted shadow-sm transition-colors hover:text-fg"
      >
        {collapsed ? (
          <ChevronsRight className="size-4" aria-hidden />
        ) : (
          <ChevronsLeft className="size-4" aria-hidden />
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
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => dispatch(closeMobileNav())}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 w-72 max-w-[80vw] transform border-e border-border bg-surface transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="flex h-full flex-col overflow-y-auto p-4 ">
          <div className="mb-4 flex items-center justify-between pr-1">
            <Logo />
            <button
              type="button"
              onClick={() => dispatch(closeMobileNav())}
              aria-label={t.nav.close}
              className="rounded-lg p-2 text-fg-muted transition-colors hover:bg-surface-3 hover:text-fg"
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
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-2 text-sm flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <AlertTriangle
          className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden
        />
        <span>{t.verifyEmail.bannerMessage}</span>
      </div>
      <Link
        to={`/verify-email-otp?email=${encodeURIComponent(user.email)}`}
        className="font-medium underline hover:text-amber-800 dark:hover:text-amber-100 shrink-0"
      >
        {t.verifyEmail.verifyNow}
      </Link>
    </div>
  );
}

function LayoutFrame({ dir, theme }: { dir: string; theme: string }) {
  const { loggedIn } = useAuth();
  const isLoading = useContentLoading();

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-fg">
      <ScrollToTop />
      <Navbar />
      <UnverifiedEmailBanner />
      <SessionExtensionBanner />
      <div className="mx-auto flex w-full max-w-[1800px] flex-1 ">
        {loggedIn && <AuthenticatedSidebar />}
        <main className="relative min-w-0 flex-1">
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

      <SidebarDrawer />

      {!isLoading && !loggedIn && <Footer />}
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
