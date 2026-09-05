import { useEffect, useRef, useState } from "react";

const CursorFollower = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [glyph, setGlyph] = useState<"arrow" | "bookmark">("arrow");
  const [storedCursor, setStoredCursor] = useState<string>("");

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const isReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (isReducedMotion) {
      cursor.style.display = "none";
      return;
    }

    cursor.style.display = "block";

    // Store original body cursor and reset on unmount
    setStoredCursor(document.body.style.cursor);

    // Set initial cursor to default (will be overridden when over interactive elements)
    document.body.style.cursor = "";

    let rafId: number = 0;
    const mouse = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Check if mouse is over an interactive element
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.hasAttribute("href") ||
        target.getAttribute("role") === "button";

      // Over interactive elements: show bookmark glyph + pointer cursor
      if (isInteractive) {
        setGlyph("bookmark");
        document.body.style.cursor = "pointer";
      } else {
        // Not over interactive: show arrow glyph, restore original cursor
        setGlyph("arrow");
        document.body.style.cursor = storedCursor || "";
      }
    };

    const handleMouseLeave = () => {
      setGlyph("arrow");
      // Restore the cursor that was active before we started (typically default for page)
      document.body.style.cursor = storedCursor || "";
    };

    cursor.addEventListener("mousemove", handleMouseMove);
    cursor.addEventListener("mouseleave", handleMouseLeave);

    const updatePosition = () => {
      if (!cursorRef.current) return;
      cursorRef.current.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`;
      rafId = requestAnimationFrame(updatePosition);
    };

    updatePosition();

    return () => {
      cursor.removeEventListener("mousemove", handleMouseMove);
      cursor.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafId);
      if (cursorRef.current) cursorRef.current.style.display = "none";
      document.body.style.cursor = storedCursor || "";
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        pointerEvents: "auto",
        zIndex: 9999,
        width: 32,
        height: 32,
        transform: "translate(0, 0)",
        transition: "transform 0.1s ease-out",
      }}
    >
      <svg
        width={32}
        height={32}
        viewBox="0 0 32 32"
      >
        {glyph === "bookmark" && (
          <path
            d="M4 14h8l4-4h4v12h-12v-5.5l-1.5 1.5L4 14z"
            fill="#8e4e38"
            opacity={0.8}
          />
        )}
        {glyph === "arrow" && (
          <polygon
            points="16 4 30 16 16 28 2 16"
            fill="#8e4e38"
            opacity={0.6}
          />
        )}
      </svg>
    </div>
  );
};

export default CursorFollower;