import { useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi, type LoginPayload, type RegisterPayload } from "../api/authApi";
import { usersApi } from "../api/usersApi";
import { useAppDispatch, useAppSelector } from "../store";
import {
  clearCredentials,
  setCredentials,
  setToken,
  setStatus,
  setUser,
  updateLocalUser,
  type AuthenticatedUser,
} from "../store/authSlice";

import { requestRefresh } from "../api/axios";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { token, user, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user && status === "idle") {
      dispatch(setStatus("loading"));
      if (token) {
        authApi
          .me()
          .then((u) => {
            usersApi
              .me()
              .then((userData) => {
                dispatch(
                  setUser({
                    ...u,
                    avatarUrl: userData.data.avatarUrl,
                  } as AuthenticatedUser),
                );
              })
              .catch(() => {
                dispatch(setUser(u as AuthenticatedUser));
              });
          })
          .catch(() => {
            requestRefresh()
              .then((newToken) => {
                if (newToken) {
                  authApi
                    .me()
                    .then((u) => dispatch(setUser(u as AuthenticatedUser)))
                    .catch(() => dispatch(clearCredentials()));
                } else {
                  dispatch(clearCredentials());
                }
              })
              .catch(() => dispatch(clearCredentials()));
          });
      } else {
        requestRefresh()
          .then((newToken) => {
            if (newToken) {
              authApi
                .me()
                .then((u) => dispatch(setUser(u as AuthenticatedUser)))
                .catch(() => dispatch(clearCredentials()));
            } else {
              dispatch(clearCredentials());
            }
          })
          .catch(() => dispatch(clearCredentials()));
      }
    }
  }, [token, user, status, dispatch]);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (res) => {
      dispatch(
        setCredentials({
          token: res.accessToken,
          user: res.user as AuthenticatedUser,
        }),
      );
      usersApi
        .me()
        .then((userData) => {
          dispatch(updateLocalUser({ avatarUrl: userData.data.avatarUrl }));
        })
        .catch(() => {});
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  });

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore server errors on logout
    }
    dispatch(clearCredentials());
  }, [dispatch]);

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
  const user = useAppSelector((state) => state.auth.user);
  return user?.role === "ADMIN";
}

export function useIsAuthenticated() {
  return useAppSelector((state) => state.auth.status === "authenticated");
}