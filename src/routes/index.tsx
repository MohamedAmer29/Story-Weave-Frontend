import { Route, Routes } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { AdminRoute, GuestRoute, ProtectedRoute } from "../components/layout/guards";
import { HomePage } from "../pages/HomePage";
import { ExplorePage } from "../pages/ExplorePage";
import { HowItWorksPage } from "../pages/HowItWorksPage";
import { LoginPage, RegisterPage } from "../pages/AuthPages";
import { VerifyEmailPage } from "../pages/auth/VerifyEmailPage";
import { DashboardPage } from "../pages/DashboardPage";
import { LibraryPage } from "../pages/LibraryPage";
import { CreateStoryPage } from "../pages/CreateStoryPage";
import { EditStoryPage } from "../pages/EditStoryPage";
import { StoryReaderPage } from "../pages/StoryReaderPage";
import { NotificationsPage } from "../pages/NotificationsPage";
import { ProfilePage } from "../pages/ProfilePage";
import { SettingsPage } from "../pages/SettingsPage";
import { AdminPage } from "../pages/AdminPage";
import { AdminNotificationsPage } from "../pages/admin/AdminNotificationsPage";
import { NotFoundPage } from "../pages/errors/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/verify-email" element={<GuestRoute><VerifyEmailPage /></GuestRoute>} />
        <Route path="/stories/:id" element={<StoryReaderPage />} />

        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/library"
          element={<ProtectedRoute><LibraryPage /></ProtectedRoute>}
        />
        <Route
          path="/create"
          element={<ProtectedRoute><CreateStoryPage /></ProtectedRoute>}
        />
        <Route
          path="/stories/:id/edit"
          element={<ProtectedRoute><EditStoryPage /></ProtectedRoute>}
        />
        <Route
          path="/notifications"
          element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
        />

        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}