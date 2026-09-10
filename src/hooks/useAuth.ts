import { useCallback, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  authApi,
  type LoginPayload,
  type RegisterPayload,
} from "../api/authApi";
import { usersApi } from "../api/usersApi";
import {
  AUTH_QUERY_KEY,
  clearCredentials,
  readAuth,
  setCredentials,
  setStatus,
  setUser,
  updateLocalUser,
  type AuthState,
  type AuthenticatedUser,
} from "../lib/authStore";

import { requestRefresh, blockSessionRefresh, unblockSessionRefresh } from "../api/axios";
import { queryClient } from "../lib/queryClient";
import { persistSessionExpiry, readSessionExpiry } from "../lib/session";

function useAuthSnapshot(): AuthState {
  const { data } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => readAuth(),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  return data ?? readAuth();
}

export function useAuth() {
  const { token, user, status } = useAuthSnapshot();

  const hydrateUser = useCallback(async (authUser: AuthenticatedUser) => {
    try {
      const profile = await usersApi.me();
      setUser({
        ...authUser,
        avatarUrl: profile.data.avatarUrl,
      });
    } catch {
      setUser(authUser);
    }
  }, []);

  const clearSession = useCallback(() => {
    persistSessionExpiry(null);
    clearCredentials();
  }, []);

  useEffect(() => {
    if (!user && status === "idle") {
      setStatus("loading");
      if (token) {
        authApi
          .me()
          .then((u) => hydrateUser(u as AuthenticatedUser))
          .catch(() => {
            requestRefresh()
              .then((newToken) => {
                if (newToken) {
                  authApi
                    .me()
                    .then((u) => hydrateUser(u as AuthenticatedUser))
                    .catch(() => clearSession());
                } else {
                  clearSession();
                }
              })
              .catch(() => clearSession());
          });
      } else if (readSessionExpiry() != null) {
        requestRefresh()
          .then((newToken) => {
            if (newToken) {
              authApi
                .me()
                .then((u) => hydrateUser(u as AuthenticatedUser))
                .catch(() => clearSession());
            } else {
              clearSession();
            }
          })
          .catch(() => clearSession());
      } else {
        clearSession();
      }
    }
  }, [token, user, status, hydrateUser, clearSession]);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (res) => {
      unblockSessionRefresh();
      persistSessionExpiry(res.sessionExpiresAt);
      setCredentials(res.accessToken, res.user as AuthenticatedUser);
      usersApi
        .me()
        .then((userData) => {
          updateLocalUser({ avatarUrl: userData.data.avatarUrl });
        })
        .catch(() => {});
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    // Do not set credentials on registration so user is routed to OTP verification first
  });

  const logout = useCallback(async () => {
    // Block background refreshes first so a logged-out session can never be
    // resurrected by an in-flight request/refresh resolving after this.
    blockSessionRefresh();
    try {
      await authApi.logout();
    } catch {
      // ignore server errors on logout
    }
    clearSession();
    // Wipe all cached data for the next session, but keep the auth cache entry
    // so its unauthenticated state is not evicted into "idle".
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== AUTH_QUERY_KEY[0],
    });
    queryClient.getMutationCache().clear();
  }, [clearSession]);

  return {
    token,
    user,
    status,
    isAuthenticated: Boolean(token && user),
    loggedIn: Boolean(token),
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    loginPending: loginMutation.isPending,
    registerPending: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logout,
  };
}

export function useIsAdmin() {
  const { user } = useAuthSnapshot();
  return user?.role === "ADMIN";
}

export function useIsAuthenticated() {
  const { status } = useAuthSnapshot();
  return status === "authenticated";
}