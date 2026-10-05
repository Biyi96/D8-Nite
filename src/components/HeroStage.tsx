"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { ResolvedStop } from "@content/types";
import type { DragState } from "./three/Scene";
import type { WorkerCanvasApi } from "./three/WorkerCanvas";

const SceneCanvas = dynamic(() => import("./three/SceneCanvas"), { ssr: false });
const WorkerCanvas = dynamic(() => import("./three/WorkerCanvas"), { ssr: false });

type Mode = "pending" | "worker" | "main";

/**
 * Render in a worker where OffscreenCanvas WebGL is solid. Safari is left on
 * the main thread: three's GLTFLoader loads textures through the DOM there.
 */
function canUseWorker() {
  if (typeof OffscreenCanvas === "undefined" || !("transferControlToOffscreen" in HTMLCanvasElement.prototype)) return false;
  const ua = navigator.userAgent;
  const safari = /safari/i.test(ua) && !/chrome|chromium|crios|android|fxios|edg/i.test(ua);
  return !safari;
}

const DRAG_LIMIT = 0.9;

/**
 * The 3D layer behind the hero text: soft hexagon glow, the diorama canvas
 * and a light wash of the background colour so the type stays readable.
 * Lives outside the per-stop transition so the WebGL context is reused.
 */
export default function HeroStage({
  stops,
  index,
  reduced,
}: {
  stops: ResolvedStop[];
  index: number;
  reduced: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState>({ target: 0 });
  const pointer = useRef<{ id: number; x: number; start: number } | null>(null);
  const workerApi = useRef<WorkerCanvasApi | null>(null);
  const [mode, setMode] = useState<Mode>("pending");
  const [active, setActive] = useState(true);

  // Mount WebGL after first paint so the headline is the LCP and stays snappy.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => setMode(canUseWorker() ? "worker" : "main"), { timeout: 1200 });
    return () => cancel(id);
  }, []);

  // Stop rendering when the hero is scrolled out of view.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Drag-to-rotate (horizontal only, so vertical swipes still scroll on touch).
  const setDrag = (target: number) => {
    drag.current.target = target;
    workerApi.current?.setDrag(target);
  };
  const onDown = (e: PointerEvent) => {
    pointer.current = { id: e.pointerId, x: e.clientX, start: drag.current.target };
  };
  const onMove = (e: PointerEvent) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    const dx = (e.clientX - p.x) / Math.max(window.innerWidth, 1);
    setDrag(Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, p.start + dx * 3)));
  };
  const onUp = () => {
    if (!pointer.current) return;
    pointer.current = null;
    setDrag(0); // ease back to the open side facing us
  };

  const stop = stops[index];

  return (
    <div
      ref={wrap}
      data-cursor="grab"
      className="absolute inset-x-0 top-0 z-0 h-svh cursor-grab overflow-hidden touch-pan-y select-none active:cursor-grabbing"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerLeave={onUp}
    >
      {/* Soft glow behind the room, plus a thin hexagon rim. Gradients and
          strokes only (no CSS filters) so the first frame rasterises fast on phones. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
        <div
          className="aspect-square h-[min(78svh,130vw)] rounded-full opacity-50"
          style={{ background: `radial-gradient(closest-side, ${stop.accent} 0%, transparent 70%)` }}
        />
      </div>
      {/* Real models bring their own rim; the drawn hexagon frames the placeholder. */}
      <div aria-hidden className={`pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-700 ${stop.hasModel ? "opacity-0" : "opacity-100"}`}>
        <svg viewBox="-4 -4 94.6 108" className="aspect-[0.876] h-[min(70svh,106vw)] opacity-30">
          <polygon points="43.3,0 86.6,25 86.6,75 43.3,100 0,75 0,25" fill="none" stroke="var(--stop-accent)" strokeOpacity="0.25" strokeWidth="4" strokeLinejoin="round" />
          <polygon points="43.3,0 86.6,25 86.6,75 43.3,100 0,75 0,25" fill="none" stroke="var(--stop-accent)" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="absolute inset-0">
        {mode === "worker" && (
          <WorkerCanvas
            stops={stops}
            index={index}
            reduced={reduced}
            active={active}
            onReady={(api) => (workerApi.current = api)}
            onFail={(reason) => {
              console.warn("[date-night] worker renderer failed, using main thread:", reason);
              workerApi.current = null;
              setMode("main");
            }}
          />
        )}
        {mode === "main" && <SceneCanvas stops={stops} index={index} reduced={reduced} active={active} drag={drag} />}
      </div>

      {/* Tint the model slightly toward the background colour. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30" style={{ background: "var(--stop-bg)" }} />
    </div>
  );
}
