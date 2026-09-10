import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { toast } from "react-toastify";
import { useLanguage } from "../../i18n";
import { useAuth } from "../../hooks/useAuth";
import { readSessionExpiry } from "../../lib/session";

const WARNING_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes warning

/** Decodes the actual `exp` claim of a JWT into epoch milliseconds. */
function getTokenExpiryMs(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const decoded = JSON.parse(json);
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function SessionExtensionBanner() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { logout } = useAuth();

  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const loggedOutRef = useRef(false);

  const expiresAt = useMemo(() => {
    const stored = readSessionExpiry();
    if (stored != null) return stored;
    return token ? getTokenExpiryMs(token) : null;
  }, [token]);

  useEffect(() => {
    loggedOutRef.current = false;
    if (!user || !token || !expiresAt) {
      // Clear remaining countdown when logged out or when the expiry is unknown.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRemainingMs(null);
      return;
    }

    const checkTime = () => {
      const left = expiresAt - Date.now();
      if (left > 0) {
        setRemainingMs(left);
        return;
      }

      // Hard timeout: the session cannot be renewed past this point, so log the
      // user out instead of silently extending it.
      setRemainingMs(0);
      if (!loggedOutRef.current) {
        loggedOutRef.current = true;
        toast.warn(t.session.expiredToast);
        void logout().then(() => navigate("/login", { replace: true }));
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [user, token, expiresAt, logout, navigate, t]);

  if (
    remainingMs === null ||
    remainingMs > WARNING_THRESHOLD_MS ||
    remainingMs <= 0
  ) {
    return null;
  }

  const secondsTotal = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(secondsTotal / 60);
  const seconds = secondsTotal % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div
      role="alert"
      className="sticky top-16 z-30 flex flex-col items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-500/15 px-4 py-2.5 text-amber-900 shadow-sm dark:text-amber-100 sm:flex-row"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <Clock
          className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden
        />
        <span>{t.session.expiringDesc.replace("{time}", timeFormatted)}</span>
      </div>
    </div>
  );
}