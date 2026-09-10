const SESSION_EXPIRY_KEY = "session.expiresAt";

/** Persists the absolute session deadline (epoch ms) returned by the backend. */
export function persistSessionExpiry(expiresAt: number | null | undefined): void {
  if (expiresAt == null) {
    localStorage.removeItem(SESSION_EXPIRY_KEY);
  } else {
    localStorage.setItem(SESSION_EXPIRY_KEY, String(expiresAt));
  }
}

/** Reads the absolute session deadline (epoch ms), or null when no deadline is set. */
export function readSessionExpiry(): number | null {
  const raw = localStorage.getItem(SESSION_EXPIRY_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}