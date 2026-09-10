const VERIFY_EMAIL_KEY = "verify_resend_email";
const VERIFY_COOLDOWN_KEY = "verify_resend_until";
const VERIFY_COUNT_KEY = "verify_resend_count";
const COOLDOWN_MS = 60_000;
const COOKIE_MAX_AGE_SECONDS = 600;

function readCookie(key: string): string | null {
  const prefix = `${key}=`;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return null;
}

function writeCookie(key: string, value: string, maxAgeSeconds: number): void {
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearCookie(key: string): void {
  document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
}

export interface VerifyCooldownState {
  remainingSeconds: number;
  resendCount: number;
}

/** Reads the persisted resend cooldown/attempt state for a given email. */
export function getVerifyCooldownState(email: string): VerifyCooldownState {
  if (!email || readCookie(VERIFY_EMAIL_KEY) !== email) {
    return { remainingSeconds: 0, resendCount: 0 };
  }
  const until = Number(readCookie(VERIFY_COOLDOWN_KEY) ?? 0);
  const remainingMs = until - Date.now();
  const count = Number(readCookie(VERIFY_COUNT_KEY) ?? 0);
  return {
    remainingSeconds: remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0,
    resendCount: Number.isFinite(count) ? count : 0,
  };
}

/** Persists a sent verification request and returns the new resend count. */
export function markVerificationSent(email: string): number {
  writeCookie(VERIFY_EMAIL_KEY, email, COOKIE_MAX_AGE_SECONDS);
  writeCookie(
    VERIFY_COOLDOWN_KEY,
    String(Date.now() + COOLDOWN_MS),
    COOKIE_MAX_AGE_SECONDS,
  );
  const prev = Number(readCookie(VERIFY_COUNT_KEY) ?? 0);
  const count = (Number.isFinite(prev) ? prev : 0) + 1;
  writeCookie(VERIFY_COUNT_KEY, String(count), COOKIE_MAX_AGE_SECONDS);
  return count;
}

/** Removes the resend lock once the cooldown has elapsed. */
export function clearVerifyCooldown(email: string): void {
  if (readCookie(VERIFY_EMAIL_KEY) === email) {
    clearCookie(VERIFY_COOLDOWN_KEY);
  }
}