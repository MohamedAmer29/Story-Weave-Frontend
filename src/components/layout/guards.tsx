import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { PageLoader } from "../ui/Skeleton";
import { useAuth } from "../../hooks/useAuth";
import { useContentLoading } from "../../layouts/PageLoading";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, user, status } = useAuth();
  const location = useLocation();
  const loading = status === "idle" || status === "loading" || Boolean(token && !user);
  useContentLoading(loading);

  if (loading) {
    return <PageLoader label="Loading" />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Unverified users cannot use the app until they confirm their email.
  if (!user.emailVerified) {
    return (
      <Navigate
        to={`/verify-email-otp?email=${encodeURIComponent(user.email)}`}
        replace
      />
    );
  }

  return <>{children}</>;
}

export function AuthorRoute({ children }: { children: ReactNode }) {
  const { token, user, status } = useAuth();
  const location = useLocation();
  const loading = status === "idle" || status === "loading" || Boolean(token && !user);
  useContentLoading(loading);

  if (loading) {
    return <PageLoader label="Loading" />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!user.emailVerified) {
    return (
      <Navigate
        to={`/verify-email-otp?email=${encodeURIComponent(user.email)}`}
        replace
      />
    );
  }

  // Only authors and admins write stories.
  if (user.role !== "AUTHOR" && user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { token, user, status } = useAuth();
  const location = useLocation();
  const loading = status === "idle" || status === "loading" || Boolean(token && !user);
  useContentLoading(loading);

  if (loading) {
    return <PageLoader label="Loading" />;
  }

  if (token && user) {
    return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function VerifyRoute({ children }: { children: ReactNode }) {
  const { token, user, status } = useAuth();
  const location = useLocation();
  const loading = status === "idle" || status === "loading" || Boolean(token && !user);
  useContentLoading(loading);

  if (loading) {
    return <PageLoader label="Loading" />;
  }

  // Verified users don't need the verification pages; let guests (registration
  // flow) and authenticated-but-unverified users through.
  if (token && user?.emailVerified) {
    return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { token, user, status } = useAuth();
  const location = useLocation();
  const loading = status === "idle" || status === "loading" || Boolean(token && !user);
  useContentLoading(loading);

  if (loading) {
    return <PageLoader label="Loading" />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}