"use client";

import Lenis from "lenis";
import { useReducedMotion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

type ScrollApi = {
  scrollTo: (target: number | HTMLElement, opts?: { immediate?: boolean }) => void;
};

const ScrollContext = createContext<ScrollApi>({
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(ScrollContext);

/** Lenis smooth scrolling (same pairing as the parallax reference: Lenis + Framer Motion). */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;
    const instance = new Lenis({ autoRaf: true, lerp: 0.09 });
    lenis.current = instance;
    return () => {
      instance.destroy();
      lenis.current = null;
    };
  }, [reduced]);

  const scrollTo = useCallback<ScrollApi["scrollTo"]>((target, opts) => {
    if (lenis.current) {
      lenis.current.scrollTo(target, { immediate: opts?.immediate, duration: 1.4 });
      return;
    }
    const top = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: opts?.immediate ? "instant" : "smooth" });
  }, []);

  return <ScrollContext.Provider value={{ scrollTo }}>{children}</ScrollContext.Provider>;
}
