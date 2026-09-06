import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_URL } from "../config/env";
import type { ApiError } from "./types";
import { store } from "../store";
import { clearCredentials, setToken } from "../store/authSlice";

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  headers: InternalAxiosRequestConfig["headers"] & { _retry?: boolean };
}

/** Single shared Axios instance for the whole app. */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<string | null> | null = null;

export async function requestRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await axios.post(
        `${API_URL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );
      const token: string | null = res.data?.accessToken ?? null;
      if (token) {
        store.dispatch(setToken(token));
      }
      return token;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
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
    const errorData = error.response?.data as any;
    const errorCode = errorData?.errorCode;

    if (errorCode === "ACCESS_TOKEN_INVALIDATED") {
      store.dispatch(clearCredentials());
      return Promise.reject(error);
    }

    if (status === 401 && original && !isAuthRefresh && !original.headers._retry) {
      original.headers._retry = true;
      const token = await requestRefresh();
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      store.dispatch(clearCredentials());
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
    if (Array.isArray(message)) return message[0] ?? null;
    if (typeof message === "string" && message.trim()) return message;
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