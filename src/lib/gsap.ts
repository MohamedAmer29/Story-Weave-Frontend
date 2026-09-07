import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "./motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Configure buttery-smooth global defaults for all GSAP animations
gsap.defaults({
  ease: "power3.out",
  duration: 0.6,
  overwrite: "auto",
});

export { gsap, ScrollTrigger, prefersReducedMotion };

export const revealEase = "power3.out";
export const smoothEase = "power2.out";
export const springEase = "back.out(1.2)";
export const elasticEase = "elastic.out(1, 0.4)";
export const softEase = "sine.inOut";
