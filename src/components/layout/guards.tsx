import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { PageLoader } from "../ui/Skeleton";
import { useAppSelector } from "../../store";
import { useContentLoading } from "../../layouts/PageLoading";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, user, status } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const loading = status === "idle" || status === "loading" || Boolean(token && !user);
  useContentLoading(loading);

  if (loading) {
    return <PageLoader label="Loading" />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { token, user, status } = useAppSelector((state) => state.auth);
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

export function AdminRoute({ children }: { children: ReactNode }) {
  const { token, user, status } = useAppSelector((state) => state.auth);
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