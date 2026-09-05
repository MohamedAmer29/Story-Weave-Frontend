import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name?: string | null;
  email: string;
  role: "USER" | "ADMIN" | "MANAGER";
  emailVerified: boolean;
  avatarUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
}

const initialToken = (() => {
  try {
    return window.localStorage.getItem("storyforge_token");
  } catch {
    return null;
  }
})();

const initialState: AuthState = {
  token: initialToken,
  user: null,
  status: initialToken ? "idle" : "unauthenticated",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user: AuthenticatedUser }>
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.status = "authenticated";
      window.localStorage.setItem("storyforge_token", action.payload.token);
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      window.localStorage.setItem("storyforge_token", action.payload);
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
      state.user = null;
      state.status = "unauthenticated";
      window.localStorage.removeItem("storyforge_token");
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