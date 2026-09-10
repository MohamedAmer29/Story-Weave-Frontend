import { useEffect } from "react";

const IDLE_TIMEOUT_MS = 5000;

export function IdleCursor() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let hidden = false;

    const show = () => {
      if (timer) {
        clearTimeout(timer);
      }
      if (hidden) {
        hidden = false;
        document.documentElement.classList.remove("cursor-hidden");
      }
      timer = setTimeout(hide, IDLE_TIMEOUT_MS);
    };

    const hide = () => {
      if (!hidden) {
        hidden = true;
        document.documentElement.classList.add("cursor-hidden");
      }
    };

    const onTouchStart = () => {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
      if (hidden) {
        hidden = false;
        document.documentElement.classList.remove("cursor-hidden");
      }
    };

    document.addEventListener("mousemove", show);
    document.addEventListener("mousedown", show);
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    show();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      document.removeEventListener("mousemove", show);
      document.removeEventListener("mousedown", show);
      document.removeEventListener("touchstart", onTouchStart);
    };
  }, []);

  return null;
}
