import { Route, Routes } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import {
  AdminRoute,
  GuestRoute,
  ProtectedRoute,
} from "../components/layout/guards";
import { HomePage } from "../pages/HomePage";
import { ExplorePage } from "../pages/ExplorePage";
import { HowItWorksPage } from "../pages/HowItWorksPage";
import { LoginPage, RegisterPage } from "../pages/AuthPages";
import {
  SendVerifyEmailPage,
  VerifyEmailOtpPage,
} from "../pages/auth/VerifyEmailPage";
import {
  ForgotPasswordPage,
  ForgotPasswordOtpPage,
  ResetPasswordPage,
} from "../pages/auth/ForgotPasswordPage";
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
import { AdminHealthPage } from "../pages/admin/AdminHealthPage";
import { AdminQueuePage } from "../pages/admin/AdminQueuePage";
import { AdminAuditPage } from "../pages/admin/AdminAuditPage";
import { NotFoundPage } from "../pages/errors/NotFoundPage";
import { AuthorProfilePage } from "../pages/AuthorProfilePage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route
          path="/"
          element={
            <GuestRoute>
              <HomePage />
            </GuestRoute>
          }
        />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route path="/verify-email" element={<SendVerifyEmailPage />} />
        <Route path="/verify-email-otp" element={<VerifyEmailOtpPage />} />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPasswordPage />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password-otp"
          element={
            <GuestRoute>
              <ForgotPasswordOtpPage />
            </GuestRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <GuestRoute>
              <ResetPasswordPage />
            </GuestRoute>
          }
        />
        <Route path="/stories/:id" element={<StoryReaderPage />} />
        <Route path="/author/:userId" element={<AuthorProfilePage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <LibraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateStoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stories/:id/edit"
          element={
            <ProtectedRoute>
              <EditStoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminPage />} />
          <Route
            path="/admin/notifications"
            element={<AdminNotificationsPage />}
          />
          <Route
            path="/admin/health"
            element={<AdminHealthPage />}
          />
          <Route
            path="/admin/queue"
            element={<AdminQueuePage />}
          />
          <Route
            path="/admin/audit"
            element={<AdminAuditPage />}
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
