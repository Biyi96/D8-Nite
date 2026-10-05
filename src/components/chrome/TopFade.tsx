"use client";

import { useEffect, useRef } from "react";

/**
 * A soft fade behind the fixed top bar so text scrolling underneath doesn't
 * collide with the logo and page counter. Hidden over the hero, where the
 * page is open; tinted with the current page colour (`--scrim`).
 */
export default function TopFade() {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      node.style.opacity = window.scrollY > window.innerHeight * 0.6 ? "1" : "0";
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={el}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-30 h-[calc(env(safe-area-inset-top,0px)+6.5rem)] opacity-0 transition-opacity duration-500"
      style={{ background: "linear-gradient(to bottom, var(--scrim, var(--stop-bg)) 35%, transparent)" }}
    />
  );
}
