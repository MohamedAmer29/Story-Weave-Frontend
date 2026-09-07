import { api } from "./axios";
import type { UserProfile } from "./types";

export interface LoginResponse {
  user: UserProfile;
  accessToken: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "AUTHOR" | "USER";
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface MessageResponse {
  message: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: UserProfile;
  accessToken: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>("/auth/login", payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<LoginResponse>("/auth/register", payload).then((r) => r.data),

  me: () => api.get<UserProfile>("/auth/me").then((r) => r.data),

  refreshToken: () =>
    api.post<{ accessToken: string }>("/auth/refresh-token").then((r) => r.data),

  logout: () => api.post<MessageResponse>("/auth/logout").then((r) => r.data),

  logoutAll: () => api.post<MessageResponse>("/auth/logout-all").then((r) => r.data),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.post<MessageResponse>("/auth/change-password", payload).then((r) => r.data),

  sessions: () => api.get<SessionInfo[]>("/auth/sessions").then((r) => r.data),

  revokeSession: (sessionId: string) =>
    api.delete<MessageResponse>(`/auth/sessions/${sessionId}`).then((r) => r.data),

  revokeOtherSessions: () =>
    api.delete<MessageResponse>("/auth/sessions/others").then((r) => r.data),

  verifyEmail: (payload: { email: string; otp: string }) =>
    api.post<VerifyEmailResponse>("/auth/verify-email", payload).then((r) => r.data),

  resendVerification: (payload: { email: string }) =>
    api.post<MessageResponse>("/auth/resend-verification", payload).then((r) => r.data),

  forgotPassword: (payload: { email: string }) =>
    api.post<MessageResponse>("/auth/forgot-password", payload).then((r) => r.data),

  verifyResetOtp: (payload: { email: string; otp: string }) =>
    api.post<{ resetToken: string }>("/auth/verify-reset-otp", payload).then((r) => r.data),

  resetPassword: (payload: { resetToken: string; newPassword: string }) =>
    api.post<MessageResponse>("/auth/reset-password", payload).then((r) => r.data),
};

export interface SessionInfo {
  id: string;
  device: string;
  ipAddress: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
  current: boolean;
}
