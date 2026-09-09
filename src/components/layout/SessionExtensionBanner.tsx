import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { authApi } from "../../api/authApi";
import { requestRefresh } from "../../api/axios";
import { useAppDispatch, useAppSelector } from "../../store";
import { clearCredentials } from "../../store/authSlice";
import { useLanguage } from "../../i18n";
import { getErrorMessage } from "../../api/axios";

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
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { user, token } = useAppSelector((state) => state.auth);

  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const autoExtendedRef = useRef(false);

  const expiresAt = useMemo(
    () => (token ? getTokenExpiryMs(token) : null),
    [token]
  );

  useEffect(() => {
    autoExtendedRef.current = false;
    if (!user || !token || !expiresAt) {
      // Clear remaining countdown when logged out or when exp is unreadable.
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

      // Access token expired — silently renew the session instead of logging
      // the user out for not pressing "Extend".
      setRemainingMs(0);
      if (!autoExtendedRef.current) {
        autoExtendedRef.current = true;
        void (async () => {
          const newToken = await requestRefresh();
          if (!newToken) {
            void authApi.logout().catch(() => {});
            dispatch(clearCredentials());
            queryClient.clear();
            toast.warn(t.session.expiredToast);
          }
        })();
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [user, token, expiresAt, dispatch, queryClient, t]);

  const extendMutation = useMutation({
    mutationFn: () => requestRefresh(),
    onSuccess: (newToken) => {
      if (!newToken) {
        toast.error(t.common.error);
        void authApi.logout().catch(() => {});
        dispatch(clearCredentials());
        queryClient.clear();
        return;
      }
      void queryClient.invalidateQueries();
      toast.success(t.session.extendedSuccess);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) ?? t.common.error);
      void authApi.logout().catch(() => {});
      dispatch(clearCredentials());
      queryClient.clear();
    },
  });

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

      <button
        type="button"
        onClick={() => extendMutation.mutate()}
        disabled={extendMutation.isPending}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3.5 py-1.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-500/30 dark:text-amber-100 disabled:opacity-50"
      >
        <RefreshCw
          className={`size-3.5 ${extendMutation.isPending ? "animate-spin" : ""}`}
          aria-hidden
        />
        {extendMutation.isPending
          ? t.session.extending
          : t.session.extendAction}
      </button>
    </div>
  );
}
