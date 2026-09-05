import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  Library,
  LogOut,
  Plus,
  Sparkles,
  User,
} from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Avatar } from "../components/ui/Avatar";
import { useLanguage } from "../i18n";
import { useTheme } from "../theme";
import { useAuth, useIsAdmin } from "../hooks/useAuth";
import { cn } from "../lib/cn";

function AuthenticatedSidebar() {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = useIsAdmin();
  const location = useLocation();

  if (!isAuthenticated || !user) return null;

  const navItems = [
    { to: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { to: "/library", label: t.nav.myStories, icon: Library },
    { to: "/create", label: t.nav.createStory, icon: Plus },
    { to: "/notifications", label: t.nav.notifications, icon: Bell },
    { to: "/profile", label: t.nav.profile, icon: User },
  ];

  const adminSubItems = [
    { to: "/admin?tab=overview", label: t.admin.overview },
    { to: "/admin?tab=users", label: t.admin.users },
    { to: "/admin?tab=stories", label: t.admin.stories },
    { to: "/admin?tab=system", label: t.admin.system },
  ];

  const showAdminSubItems = isAdmin && location.pathname === "/admin";

  return (
    <aside className="hidden w-72 h-screen sticky top-0 bottom-0 shrink-0 border-r border-border bg-surface/80 lg:block">
      <div className="sticky top-20 p-4">
        <div className="mb-4 rounded-2xl border border-border bg-surface p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar
              src={user.avatarUrl ?? undefined}
              name={`${user.firstName ?? ""} ${user.lastName ?? ""}`}
              size="md"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-fg">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-fg-muted">{user.email}</p>
            </div>
          </div>
        </div>

        <nav
          className="space-y-1 justify-between flex flex-col"
          aria-label={t.nav.menu}
        >
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ||
                    (to === "/dashboard" && location.pathname === "/dashboard")
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                    : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                )
              }
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <div className="space-y-1.5">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive || location.pathname.startsWith("/admin")
                      ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                      : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                  )
                }
              >
                <Sparkles className="size-4" aria-hidden />
                {t.nav.admin}
              </NavLink>

              {showAdminSubItems && (
                <div className="ml-3 space-y-1 rounded-xl border border-border bg-surface p-1.5 shadow-sm">
                  {adminSubItems.map(({ to, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        cn(
                          "block rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                            : "text-fg hover:bg-surface-2",
                        )
                      }
                    >
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="my-3 h-px bg-border" />
          <button
            type="button"
            onClick={() => void logout()}
            className="flex  w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
          >
            <LogOut className="size-4" aria-hidden />
            {t.nav.logout}
          </button>
        </nav>
      </div>
    </aside>
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

export function RootLayout() {
  const { dir } = useLanguage();
  const { theme } = useTheme();

  const { isAuthenticated } = useAuth();

  const showGlobalNavbar = true;
  const showDashboardSidebar = isAuthenticated;

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-fg">
      <ScrollToTop />
      {showGlobalNavbar && <Navbar />}
      <div className="mx-auto flex w-full max-w-[1800px] flex-1 ">
        {showDashboardSidebar && <AuthenticatedSidebar />}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <ToastContainer
        position={dir === "rtl" ? "bottom-left" : "bottom-right"}
        theme={theme}
        rtl={dir === "rtl"}
        autoClose={4000}
        newestOnTop
      />

      <Footer />
    </div>
  );
}
