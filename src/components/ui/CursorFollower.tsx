import { useEffect, useRef } from "react";

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
  const pointerRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
  });

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = media.matches;

    if (reducedMotion) {
      cursor.style.display = "none";
      return;
    }

    const setCursorVisibility = () => {
      const target = document.elementFromPoint(
        pointerRef.current.x,
        pointerRef.current.y,
      ) as Element | null;
      const isInteractive = !!target?.closest?.(INTERACTIVE_SELECTOR);

      cursor.style.display = "block";
      cursor.dataset.mode = isInteractive ? "interactive" : "default";
      const rotation = isInteractive ? -24 : 12;
      document.documentElement.style.setProperty(
        "--cursor-tilt",
        `${rotation}deg`,
      );
      cursor.style.opacity = "1";
      cursor.style.width = isInteractive ? "38px" : "30px";
      cursor.style.height = isInteractive ? "38px" : "30px";
      cursor.style.transform = `translate(${pointerRef.current.x}px, ${pointerRef.current.y}px) rotate(${rotation}deg) scale(${isInteractive ? 1.15 : 1})`;
    };

    const updatePointerFromEvent = (event: PointerEvent) => {
      pointerRef.current.targetX = event.clientX;
      pointerRef.current.targetY = event.clientY;

      const target = event.target as Element | null;
      const isInteractive = !!target?.closest?.(INTERACTIVE_SELECTOR);
      cursor.dataset.mode = isInteractive ? "interactive" : "default";
      cursor.style.opacity = "1";
      cursor.style.width = isInteractive ? "38px" : "30px";
      cursor.style.height = isInteractive ? "38px" : "30px";
    };

    const handlePointerLeave = () => {
      cursor.style.opacity = "0.35";
    };

    const handlePointerDown = () => {
      cursor.classList.add("is-pressed");
    };

    const handlePointerUp = () => {
      cursor.classList.remove("is-pressed");
    };

    const updateCursorState = (event: Event) => {
      const target = event.target as Element | null;
      const isInteractive = !!target?.closest?.(INTERACTIVE_SELECTOR);
      cursor.dataset.mode = isInteractive ? "interactive" : "default";
    };

    document.body.style.cursor = "none";
    document.documentElement.style.cursor = "none";
    setCursorVisibility();
    document.addEventListener("pointermove", updatePointerFromEvent);
    document.addEventListener("pointerover", updateCursorState);
    document.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);

    let rafId = 0;

    const animate = () => {
      const { x, y, targetX, targetY } = pointerRef.current;
      pointerRef.current.x += (targetX - x) * 0.22;
      pointerRef.current.y += (targetY - y) * 0.22;

      const isInteractive = cursor.dataset.mode === "interactive";
      const rotation = isInteractive ? -24 : 12;
      const scale = isInteractive ? 1.15 : 1;
      document.documentElement.style.setProperty(
        "--cursor-tilt",
        `${rotation}deg`,
      );
      cursor.style.transform = `translate(${pointerRef.current.x}px, ${pointerRef.current.y}px) rotate(${rotation}deg) scale(${scale})`;
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.cursor = "";
      document.documentElement.style.cursor = "";
      document.documentElement.style.removeProperty("--cursor-tilt");
      document.removeEventListener("pointermove", updatePointerFromEvent);
      document.removeEventListener("pointerover", updateCursorState);
      document.removeEventListener("pointerleave", handlePointerLeave);
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
