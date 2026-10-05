import { useGLTF } from "@react-three/drei";
import { WebGLRenderer, type WebGLRendererParameters } from "three";
import type { SceneStop } from "./Scene";
import { DRACO_PATH } from "./VenueModel";

/** Shared WebGL renderer setup for the main-thread canvas and the worker. */
export function createRenderer(canvas: WebGLRendererParameters["canvas"]) {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  // Synchronous shader status checks stall the first frame; keep them for development only.
  renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
  return renderer;
}

/** Warm the cache for the neighbouring stops' GLBs. */
export function preloadNeighbours(stops: SceneStop[], index: number) {
  for (const i of [index + 1, index - 1]) {
    const s = stops[i];
    if (s?.hasModel) useGLTF.preload(s.model, DRACO_PATH);
  }
}
