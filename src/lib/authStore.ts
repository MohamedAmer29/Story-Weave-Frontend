import { queryClient } from "./queryClient";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name?: string | null;
  email: string;
  role: "USER" | "AUTHOR" | "ADMIN";
  emailVerified: boolean;
  avatarUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

export type AuthenticatedUser = User & {
  name: string | null;
};

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  token: string | null;
  tokenIssuedAt: number | null;
  user: AuthenticatedUser | null;
  status: AuthStatus;
}

export const AUTH_QUERY_KEY = ["auth"];

const DEFAULT_AUTH: AuthState = {
  token: null,
  tokenIssuedAt: null,
  user: null,
  status: "idle",
};

export function readAuth(): AuthState {
  return queryClient.getQueryData<AuthState>(AUTH_QUERY_KEY) ?? DEFAULT_AUTH;
}

function writeAuth(patch: Partial<AuthState>) {
  queryClient.setQueryData<AuthState>(AUTH_QUERY_KEY, {
    ...readAuth(),
    ...patch,
  });
}

export function setCredentials(token: string, user: AuthenticatedUser) {
  writeAuth({ token, tokenIssuedAt: Date.now(), user, status: "authenticated" });
}

export function setToken(token: string) {
  // A token issued by a background refresh must never resurrect a session
  // that was explicitly ended (logout / session revoked).
  if (readAuth().status === "unauthenticated") return;
  writeAuth({ token, tokenIssuedAt: Date.now() });
}

export function setUser(user: AuthenticatedUser) {
  writeAuth({ user, status: "authenticated" });
}

export function setStatus(status: AuthStatus) {
  writeAuth({ status });
}

export function clearCredentials() {
  writeAuth({
    token: null,
    tokenIssuedAt: null,
    user: null,
    status: "unauthenticated",
  });
}

export function updateLocalUser(patch: Partial<AuthenticatedUser>) {
  const current = readAuth();
  if (current.user) {
    writeAuth({ user: { ...current.user, ...patch } });
  }
}