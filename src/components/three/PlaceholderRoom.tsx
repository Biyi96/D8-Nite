"use client";

import { useMemo } from "react";
import { Color } from "three";

/**
 * Stand-in diorama while a GLB loads or when it's missing: an isometric box
 * room (floor + two walls) in the stop's accent colour, open side facing us.
 * Fits the unit cube, like normalised GLBs.
 */
export default function PlaceholderRoom({ accent }: { accent: string }) {
  const c = useMemo(() => {
    const base = new Color(accent);
    return {
      floor: base.clone().multiplyScalar(0.7).getStyle(),
      wallL: base.clone().multiplyScalar(0.82).getStyle(),
      wallR: base.clone().multiplyScalar(0.92).getStyle(),
      detail: base.clone().lerp(new Color("#ffffff"), 0.35).getStyle(),
      deep: base.clone().multiplyScalar(0.5).getStyle(),
    };
  }, [accent]);

  const t = 0.05; // wall thickness

  return (
    <group>
      {/* floor */}
      <mesh position={[0, -0.5 + t / 2, 0]} receiveShadow>
        <boxGeometry args={[1, t, 1]} />
        <meshStandardMaterial color={c.floor} roughness={0.8} />
      </mesh>
      {/* left wall */}
      <mesh position={[-0.5 + t / 2, 0, 0]}>
        <boxGeometry args={[t, 1, 1]} />
        <meshStandardMaterial color={c.wallL} roughness={0.75} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, 0, -0.5 + t / 2]}>
        <boxGeometry args={[1, 1, t]} />
        <meshStandardMaterial color={c.wallR} roughness={0.75} />
      </mesh>

      {/* A few soft details so the light has something to catch. */}
      <mesh position={[0.05, -0.5 + t + 0.004, 0.05]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.28, 48]} />
        <meshStandardMaterial color={c.detail} roughness={0.95} />
      </mesh>
      <mesh position={[0.05, -0.5 + t + 0.09, 0.05]}>
        <cylinderGeometry args={[0.1, 0.12, 0.18, 32]} />
        <meshStandardMaterial color={c.deep} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[-0.12, 0.08, -0.5 + t + 0.01]}>
        <boxGeometry args={[0.34, 0.42, 0.02]} />
        <meshStandardMaterial color={c.deep} roughness={0.5} />
      </mesh>
      <mesh position={[-0.12, 0.08, -0.5 + t + 0.022]}>
        <boxGeometry args={[0.28, 0.36, 0.01]} />
        <meshStandardMaterial color={c.detail} roughness={0.6} />
      </mesh>
      <mesh position={[-0.5 + t + 0.01, 0.12, 0.18]}>
        <boxGeometry args={[0.02, 0.5, 0.26]} />
        <meshStandardMaterial color={c.detail} roughness={0.3} emissive={c.detail} emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}
