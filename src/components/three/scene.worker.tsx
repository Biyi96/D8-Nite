/// <reference lib="webworker" />
/**
 * Renders the diorama on an OffscreenCanvas in a worker, so three.js startup,
 * shader compilation and every frame stay off the main thread (smooth scroll
 * and fast first interaction on phones).
 */
import "./workerShims";
import { createRoot, extend, type ReconcilerRoot } from "@react-three/fiber";
import * as THREE from "three";
import Scene, { type DragState, type SceneStop } from "./Scene";
import { createRenderer, preloadNeighbours } from "./renderer";

export type ToWorker =
  | {
      type: "init";
      canvas: OffscreenCanvas;
      width: number;
      height: number;
      dpr: number;
      stops: SceneStop[];
      index: number;
      reduced: boolean;
      active: boolean;
    }
  | { type: "props"; index: number; reduced: boolean; active: boolean }
  | { type: "resize"; width: number; height: number }
  | { type: "drag"; target: number };

export type FromWorker = { type: "ready" } | { type: "error"; message: string };

// <Canvas> registers three's classes as JSX elements; createRoot alone doesn't.
extend(THREE as unknown as Parameters<typeof extend>[0]);

const post = (msg: FromWorker) => self.postMessage(msg);

let root: ReconcilerRoot<OffscreenCanvas> | null = null;
let state: Omit<Extract<ToWorker, { type: "init" }>, "type" | "canvas"> | null = null;
const drag: { current: DragState } = { current: { target: 0 } };

async function update() {
  if (!root || !state) return;
  const { width, height, dpr, active, stops, index, reduced } = state;
  await root.configure({
    gl: ({ canvas }) => createRenderer(canvas),
    size: { width, height, top: 0, left: 0 },
    dpr,
    frameloop: active ? "always" : "never",
  });
  root.render(<Scene stops={stops} index={index} reduced={reduced} drag={drag} />);
  preloadNeighbours(stops, index);
}

self.onmessage = (e: MessageEvent<ToWorker>) => {
  const msg = e.data;
  try {
    switch (msg.type) {
      case "init": {
        const { canvas, ...rest } = msg;
        state = rest;
        root = createRoot(canvas);
        update().then(() => post({ type: "ready" }), fail);
        break;
      }
      case "props":
        if (state) state = { ...state, ...msg };
        void update().catch(fail);
        break;
      case "resize":
        if (state) state = { ...state, width: msg.width, height: msg.height };
        void update().catch(fail);
        break;
      case "drag":
        drag.current.target = msg.target;
        break;
    }
  } catch (err) {
    fail(err);
  }
};

function fail(err: unknown) {
  post({ type: "error", message: err instanceof Error ? err.message : String(err) });
}

self.addEventListener("error", (e) => fail(e.message));
self.addEventListener("unhandledrejection", (e) => fail(e.reason));
