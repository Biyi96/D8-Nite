"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import Scene, { type SceneProps } from "./Scene";
import { MAX_DPR } from "@/lib/iso";
import { createRenderer, preloadNeighbours } from "./renderer";

/** Main-thread renderer: the fallback where OffscreenCanvas workers aren't available. */
export default function SceneCanvas({ active, ...props }: SceneProps & { active: boolean }) {
  const { stops, index } = props;
  useEffect(() => preloadNeighbours(stops, index), [stops, index]);

  return (
    <Canvas
      dpr={[1, MAX_DPR]}
      gl={({ canvas }) => createRenderer(canvas)}
      frameloop={active ? "always" : "never"}
      style={{ touchAction: "pan-y" }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
