import { useRef, type HTMLAttributes, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { cn } from "../../lib/cn";
import { gsap, prefersReducedMotion, revealEase } from "../../lib/gsap";

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 30,
  duration = 0.8,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      gsap.fromTo(
        el,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          delay,
          ease: revealEase,
          clearProps: "transform",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            once: true,
          },
        }
      );
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={cn("will-change-transform", className)} {...rest}>
      {children}
    </div>
  );
}

interface RevealStaggerProps {
  children: ReactNode;
  className?: string;
  itemSelector?: string;
  y?: number;
  stagger?: number;
}

export function RevealStagger({
  children,
  className,
  itemSelector = ":scope > *",
  y = 28,
  stagger = 0.07,
}: RevealStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const items = el.querySelectorAll(itemSelector);
      if (!items.length) return;

      gsap.fromTo(
        items,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger,
          ease: revealEase,
          clearProps: "transform",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        }
      );
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

export function Magnetic({
  children,
  className,
  strength = 16,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      
      const xTo = gsap.quickTo(el, "x", { duration: 0.25, ease: "power2.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.25, ease: "power2.out" });

      const onMove = (event: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const relX = event.clientX - (rect.left + rect.width / 2);
        const relY = event.clientY - (rect.top + rect.height / 2);
        xTo((relX / rect.width) * strength);
        yTo((relY / rect.height) * strength);
      };

      const onLeave = () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "back.out(1.5)",
          overwrite: "auto",
        });
      };

      el.addEventListener("mousemove", onMove, { passive: true });
      el.addEventListener("mouseleave", onLeave, { passive: true });

      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={cn("inline-flex will-change-transform", className)}>
      {children}
    </div>
  );
}
