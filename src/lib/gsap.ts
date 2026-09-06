import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "./motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export { gsap, ScrollTrigger, prefersReducedMotion };

export const revealEase = "power3.out";
