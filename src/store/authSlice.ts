import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

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

interface AuthState {
  token: string | null;
  tokenIssuedAt: number | null;
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
}

const initialState: AuthState = {
  token: null,
  tokenIssuedAt: null,
  user: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user: AuthenticatedUser }>,
    ) {
      const now = Date.now();
      state.token = action.payload.token;
      state.tokenIssuedAt = now;
      state.user = action.payload.user;
      state.status = "authenticated";
    },
    setToken(state, action: PayloadAction<string>) {
      const now = Date.now();
      state.token = action.payload;
      state.tokenIssuedAt = now;
    },
    setUser(state, action: PayloadAction<AuthenticatedUser>) {
      state.user = action.payload;
      state.status = "authenticated";
    },
    setStatus(state, action: PayloadAction<AuthState["status"]>) {
      state.status = action.payload;
    },
    clearCredentials(state) {
      state.token = null;
      state.tokenIssuedAt = null;
      state.user = null;
      state.status = "unauthenticated";
    },
    updateLocalUser(state, action: PayloadAction<Partial<AuthenticatedUser>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export type AuthenticatedUser = User & {
  name: string | null;
};

export const {
  setCredentials,
  setToken,
  setUser,
  setStatus,
  clearCredentials,
  updateLocalUser,
} = authSlice.actions;

export default authSlice.reducer;
