import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import { API_URL } from "../config/env";
import type { ApiError } from "./types";
import {
  clearCredentials,
  readAuth,
  setToken,
} from "../lib/authStore";
import { persistSessionExpiry, readSessionExpiry } from "../lib/session";
import { getActiveTranslation } from "../i18n";

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  headers: InternalAxiosRequestConfig["headers"] & { _retry?: boolean };
}

interface ApiErrorPayload {
  errorCode?: string;
  message?: string | string[];
}

/** Single shared Axios instance for the whole app. */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<string | null> | null = null;
let refreshAbortController: AbortController | null = null;

let sessionRefreshBlocked = false;

/** Prevent any background token refresh from resurrecting a session during/after an explicit logout. */
export function blockSessionRefresh() {
  sessionRefreshBlocked = true;
  if (refreshAbortController) {
    refreshAbortController.abort();
    refreshAbortController = null;
  }
  refreshPromise = null;
}

/** Re-allow token refresh (called when a new login is established). */
export function unblockSessionRefresh() {
  sessionRefreshBlocked = false;
}

export async function requestRefresh(): Promise<string | null> {
  if (sessionRefreshBlocked) return null;
  // No stored session expiry means there is no active session to refresh.
  const deadline = readSessionExpiry();
  if (deadline == null) return null;
  // The session has a hard absolute deadline. Never renew past it.
  if (Date.now() >= deadline) return null;
  if (refreshPromise) return refreshPromise;
  refreshAbortController = new AbortController();
  refreshPromise = (async () => {
    try {
      const res = await axios.post(
        `${API_URL}/auth/refresh-token`,
        {},
        { withCredentials: true, signal: refreshAbortController.signal }
      );
      const token: string | null = res.data?.accessToken ?? null;
      if (token) {
        setToken(token);
        const sessionExpiresAt: unknown = res.data?.sessionExpiresAt;
        if (typeof sessionExpiresAt === "number") {
          persistSessionExpiry(sessionExpiresAt);
        }
      }
      return token;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
      refreshAbortController = null;
    }
  })();
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const { token } = readAuth();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequestConfig | undefined;
    const isAuthRefresh = original?.url?.includes("/auth/refresh-token");
    const status = error.response?.status;
    const errorData = error.response?.data as ApiErrorPayload | undefined;
    const errorCode = errorData?.errorCode;

    const hadToken = Boolean(original?.headers?.Authorization);
    const notYetRetried =
      Boolean(original) && !isAuthRefresh && !original!.headers._retry;
    const authProblem =
      status === 401 || errorCode === "ACCESS_TOKEN_INVALIDATED";

    // Sliding session: an expired access token, or an older-version token that
    // was superseded by a refresh, is not a real logout — refresh once and
    // replay the request with the new token.
    if (hadToken && notYetRetried && authProblem && !sessionRefreshBlocked) {
      original!.headers._retry = true;
      const token = await requestRefresh();
      if (token) {
        original!.headers.Authorization = `Bearer ${token}`;
        return api(original!);
      }
    }

    // Only a session that cannot be renewed (refresh token revoked/expired, or
    // a second rejection right after being reissued) ends the session.
    // Skip during an explicit logout — logout handles its own cleanup.
    if (
      !sessionRefreshBlocked &&
      (errorCode === "ACCESS_TOKEN_INVALIDATED" ||
        (status === 401 && original?.headers._retry))
    ) {
      persistSessionExpiry(null);
      clearCredentials();
      toast.warn(getActiveTranslation().session.expiredToast);
    }
    return Promise.reject(error);
  }
);

/** Extract a safe, user-facing message from an API/network error. */
export function getErrorMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;

  const status = error.response?.status;
  const data = error.response?.data as ApiError | string | undefined;

  if (typeof data === "string" && data.trim()) return data;

  if (typeof data === "object" && data) {
    const message = data.message;
    if (message && Array.isArray(message)) return message[0] ?? null;
    if (typeof message === "string" && message.trim()) return message;
    if (data.errorCode === "EMAIL_NOT_VERIFIED") {
      return "Your email is not verified yet. Please verify your email to continue.";
    }
  }
  if (error.code === "ERR_NETWORK") return "Network error. Check your connection.";

  switch (status) {
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return "The requested resource could not be found.";
    case 429:
      return "Too many requests. Please try again shortly.";
    case 500:
      return "Something went wrong on our end. Please try again.";
    default:
      return null;
  }
}

export { AxiosError };
export type { ApiError };