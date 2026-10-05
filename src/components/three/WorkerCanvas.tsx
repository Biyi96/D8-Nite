"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import type { SceneStop } from "./Scene";
import type { FromWorker, ToWorker } from "./scene.worker";
import { MAX_DPR } from "@/lib/iso";

export type WorkerCanvasApi = { setDrag: (target: number) => void };

/**
 * Hands a <canvas> to a web worker (OffscreenCanvas) that runs the R3F scene.
 * Calls `onFail` if the worker can't start, so the caller can fall back to
 * rendering on the main thread.
 */
export default function WorkerCanvas({
  stops,
  index,
  reduced,
  active,
  onReady,
  onFail,
}: {
  stops: SceneStop[];
  index: number;
  reduced: boolean;
  active: boolean;
  onReady: (api: WorkerCanvasApi) => void;
  onFail: (reason: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const worker = useRef<Worker | null>(null);

  const initial = useEffectEvent(() => ({ stops, index, reduced, active }));
  const ready = useEffectEvent((api: WorkerCanvasApi) => onReady(api));
  const failed = useEffectEvent((reason: string) => onFail(reason));

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    // Created here rather than in JSX: a canvas can only be transferred once,
    // and Strict Mode mounts effects twice.
    const canvas = document.createElement("canvas");
    canvas.className = "block h-full w-full";
    canvas.style.touchAction = "pan-y";
    host.appendChild(canvas);
    const w = new Worker(new URL("./scene.worker.tsx", import.meta.url), { type: "module" });
    worker.current = w;
    const send = (msg: ToWorker, transfer: Transferable[] = []) => w.postMessage(msg, transfer);

    w.onmessage = (e: MessageEvent<FromWorker>) => {
      if (e.data.type === "ready") ready({ setDrag: (target) => send({ type: "drag", target }) });
      else failed(e.data.message);
    };
    w.onerror = (e) => failed(e.message || "worker error");

    const offscreen = canvas.transferControlToOffscreen();
    const { width, height } = canvas.getBoundingClientRect();
    send(
      {
        type: "init",
        canvas: offscreen,
        width,
        height,
        dpr: Math.min(window.devicePixelRatio || 1, MAX_DPR),
        ...initial(),
      },
      [offscreen],
    );

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      send({ type: "resize", width, height });
    });
    ro.observe(canvas);

    return () => {
      ro.disconnect();
      w.terminate();
      worker.current = null;
      canvas.remove();
    };
  }, []);

  useEffect(() => {
    worker.current?.postMessage({ type: "props", index, reduced, active } satisfies ToWorker);
  }, [index, reduced, active]);

  return <div ref={container} className="h-full w-full" />;
}
