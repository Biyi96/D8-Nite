"use client";

import { useEffect, useRef } from "react";

/** Thin outlined circle that trails the pointer. Desktop (fine pointer) only. */
export default function CursorFollower() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ring.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = -100, y = -100, tx = -100, ty = -100, scale = 1, targetScale = 1;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const interactive = (e.target as Element | null)?.closest("a, button, [data-cursor='grab']");
      targetScale = interactive ? 1.8 : 1;
      el.style.opacity = "1";
    };
    const onLeave = () => (el.style.opacity = "0");

    const tick = () => {
      const k = reduced ? 1 : 0.18;
      x += (tx - x) * k;
      y += (ty - y) * k;
      scale += (targetScale - scale) * 0.15;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ring}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-50 hidden h-9 w-9 rounded-full border border-white/70 opacity-0 transition-opacity duration-300 [@media(pointer:fine)]:block"
    />
  );
}
