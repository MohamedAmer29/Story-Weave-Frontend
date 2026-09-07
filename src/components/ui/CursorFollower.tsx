import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap, prefersReducedMotion } from "../../lib/gsap";

const INTERACTIVE_SELECTOR =
  "a, button, input, textarea, select, [role='button'], [data-cursor-interactive='true'], .story-card, .interactive-card, [contenteditable='true']";

const CursorFollower = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const isTouchOrCoarse =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;

    if (prefersReducedMotion() || isTouchOrCoarse) {
      cursor.style.display = "none";
      return;
    }

    document.documentElement.classList.add("custom-cursor-active");

    let xTo: ((value: number) => void) | null = null;
    let yTo: ((value: number) => void) | null = null;
    let rotateTo: ((value: number) => void) | null = null;
    let scaleTo: ((value: number) => void) | null = null;

    try {
      xTo = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power2.out" });
      yTo = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power2.out" });
      rotateTo = gsap.quickTo(cursor, "rotation", {
        duration: 0.25,
        ease: "power2.out",
      });
      scaleTo = gsap.quickTo(cursor, "scale", {
        duration: 0.2,
        ease: "power2.out",
      });
    } catch {
      return;
    }

    gsap.set(cursor, {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      scale: 1,
      opacity: 0,
    });

    let hasMovedOnce = false;

    let currentTarget: Element | null = null;
    let isInteractive = false;

    const onPointerMove = (event: PointerEvent) => {
      xTo?.(event.clientX);
      yTo?.(event.clientY);

      if (!hasMovedOnce) {
        hasMovedOnce = true;
        gsap.to(cursor, { opacity: 0.8, duration: 0.3, ease: "power2.out" });
      }

      currentTarget = event.target as Element | null;
      if (currentTarget) {
        const nextInteractive = !!currentTarget.closest(INTERACTIVE_SELECTOR);
        if (nextInteractive !== isInteractive) {
          isInteractive = nextInteractive;
          cursor.dataset.mode = isInteractive ? "interactive" : "default";
          rotateTo?.(isInteractive ? -15 : 8);
          scaleTo?.(isInteractive ? 1.4 : 1);
        }
      }
    };

    const onPointerLeave = () => {
      gsap.to(cursor, { opacity: 0, duration: 0.2 });
    };

    const onPointerEnter = () => {
      gsap.to(cursor, { opacity: 0.8, duration: 0.2 });
    };

    const handlePointerDown = () => cursor.classList.add("is-pressed");
    const handlePointerUp = () => cursor.classList.remove("is-pressed");

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave, {
      passive: true,
    });
    document.addEventListener("pointerenter", onPointerEnter, {
      passive: true,
    });
    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, {
      passive: true,
    });
    window.addEventListener("blur", handlePointerUp, { passive: true });

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("pointerenter", onPointerEnter);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("blur", handlePointerUp);
    };
  }, []);

  const cursor = (
    <div
      ref={cursorRef}
      className="cursor-feather pointer-events-none fixed top-0 left-0 z-[9999] size-10 -ml-5 -mt-5 text-brand-500 opacity-80 will-change-transform drop-shadow-md"
      aria-hidden="true"
      data-mode="default"
    >
      <svg
        viewBox="0 0 64 64"
        className="size-full"
        role="presentation"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="peacock-feather-gradient"
            x1="0"
            y1="1"
            x2="1"
            y2="0"
          >
            <stop offset="0%" stopColor="#064e5b" />
            <stop offset="42%" stopColor="#087f83" />
            <stop offset="72%" stopColor="#176b9c" />
            <stop offset="100%" stopColor="#2c3f91" />
          </linearGradient>
        </defs>
        <path
          d="M10 56c2-13 8-26 18-37C38 9 49 4 59 4c0 12-5 24-15 34C34 48 21 54 10 56Z"
          fill="url(#peacock-feather-gradient)"
          opacity="0.9"
        />
        <ellipse
          cx="49"
          cy="13"
          rx="9"
          ry="12"
          transform="rotate(35 49 13)"
          fill="#176b9c"
          opacity="0.95"
        />
        <ellipse
          cx="50"
          cy="13"
          rx="7"
          ry="9"
          transform="rotate(35 50 13)"
          fill="#d6b45c"
        />
        <ellipse
          cx="50"
          cy="13"
          rx="5"
          ry="7"
          transform="rotate(35 50 13)"
          fill="#087f83"
        />
        <ellipse
          cx="51"
          cy="13"
          rx="2.8"
          ry="4.5"
          transform="rotate(35 51 13)"
          fill="#173d91"
        />
        <path
          d="M28 19c7-7 14-11 22-13M25 25c8-6 16-9 23-10M22 32c8-4 15-6 22-6"
          fill="none"
          stroke="#42b7ae"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M9 57c10-12 19-24 28-35C45 12 53 7 59 4"
          fill="none"
          stroke="#d6b45c"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6 61 10 50 15 56Z"
          fill="#111318"
          stroke="#050608"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d="M8 59 12 55"
          fill="none"
          stroke="#59616b"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <path
          d="M17 19c4 0 8 1 12 3M13 27c5 0 10 1 14 3M11 35c5 0 10 1 14 3M10 43c4 0 8 1 12 2M27 14c4 2 7 4 10 7M35 10c4 2 7 5 10 8M43 7c3 2 6 5 8 8M49 5c3 2 5 4 7 7"
          fill="none"
          stroke="rgba(17,13,11,0.5)"
          strokeWidth="1.35"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );

  return typeof document === "undefined"
    ? null
    : createPortal(cursor, document.body);
};

export default CursorFollower;
