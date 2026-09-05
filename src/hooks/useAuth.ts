import { useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi, type LoginPayload, type RegisterPayload } from "../api/authApi";
import { useAppDispatch, useAppSelector } from "../store";
import {
  clearCredentials,
  setCredentials,
  setStatus,
  setUser,
  type AuthenticatedUser,
} from "../store/authSlice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { token, user, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user && status === "idle") {
      dispatch(setStatus("loading"));
      authApi
        .me()
        .then((u) => dispatch(setUser(u as AuthenticatedUser)))
        .catch(() => dispatch(clearCredentials()))
        .finally(() => {
          // status handled in reducers
        });
    }
  }, [token, user, status, dispatch]);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (res) => {
      dispatch(
        setCredentials({
          token: res.accessToken,
          user: res.user as AuthenticatedUser,
        })
      );
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (res) => {
      dispatch(
        setCredentials({
          token: res.accessToken,
          user: res.user as AuthenticatedUser,
        })
      );
    },
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