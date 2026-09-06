import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../../lib/gsap";

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "[role='button']",
  "[data-cursor-interactive='true']",
  ".story-card",
  ".interactive-card",
  "[contenteditable='true']",
].join(", ");

const CursorFollower = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    
    if (prefersReducedMotion()) {
      cursor.style.display = "none";
      return;
    }

    let xTo: ((value: number) => void) | null = null;
    let yTo: ((value: number) => void) | null = null;
    let rotateTo: ((value: number) => void) | null = null;
    let scaleTo: ((value: number) => void) | null = null;

    try {
      xTo = gsap.quickTo(cursor, "x", { duration: 0.28, ease: "power3.out" });
      yTo = gsap.quickTo(cursor, "y", { duration: 0.28, ease: "power3.out" });
      rotateTo = gsap.quickTo(cursor, "rotation", {
        duration: 0.35,
        ease: "power3.out",
      });
      scaleTo = gsap.quickTo(cursor, "scale", {
        duration: 0.28,
        ease: "power3.out",
      });
    } catch {
      // GSAP not available, show default cursor
      document.body.style.cursor = "";
      document.documentElement.style.cursor = "";
      return;
    }

    // Start with cursor visible at center
    gsap.set(cursor, {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      opacity: 1,
      display: "block",
    });

    const applyMode = (isInteractive: boolean) => {
      cursor.dataset.mode = isInteractive ? "interactive" : "default";
      rotateTo?.(isInteractive ? -24 : 12);
      scaleTo?.(isInteractive ? 1.18 : 1);
      gsap.to(cursor, {
        width: isInteractive ? 38 : 30,
        height: isInteractive ? 38 : 30,
        duration: 0.2,
        overwrite: "auto",
      });
    };

    const onMove = (event: PointerEvent) => {
      xTo?.(event.clientX);
      yTo?.(event.clientY);
      gsap.to(cursor, { opacity: 1, duration: 0.2, overwrite: "auto" });
      const target = event.target as Element | null;
      applyMode(!!target?.closest?.(INTERACTIVE_SELECTOR));
    };

    const onLeave = () => {
      gsap.to(cursor, { opacity: 0.35, duration: 0.2, overwrite: "auto" });
    };

    const handlePointerDown = () => cursor.classList.add("is-pressed");
    const handlePointerUp = () => cursor.classList.remove("is-pressed");

    document.body.style.cursor = "none";
    document.documentElement.style.cursor = "none";
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.body.style.cursor = "";
      document.documentElement.style.cursor = "";
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      cursor.style.display = "none";
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="cursor-feather"
      aria-hidden="true"
      data-mode="default"
    >
      <svg viewBox="0 0 52 52" role="presentation" aria-hidden="true">
        <path
          d="M12 4c4 9 10 17 16 24 5 5 11 10 18 13-7 1-16-1-24-7-8-6-13-16-16-30Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M18 27c5 2 11 6 16 10-4 1-8 2-12 2-3 0-6-1-10-3 2-3 4-7 6-9Z"
          fill="rgba(255,255,255,0.22)"
        />
        <path
          d="M20 14c3 4 6 9 9 13"
          stroke="rgba(17,13,11,0.4)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default CursorFollower;
