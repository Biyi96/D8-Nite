import { useFrame, useThree } from "@react-three/fiber";
import { Float, OrthographicCamera } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { CanvasTexture, MathUtils, type Group, type OrthographicCamera as OrthoCam } from "three";
import type { ResolvedStop } from "@content/types";
import { isoZoom } from "@/lib/iso";
import VenueModel from "./VenueModel";

/**
 * The 3D scene graph. Renders either on the main thread (<Canvas>) or inside
 * a web worker on an OffscreenCanvas, so it must not touch the DOM.
 */

/** Drag-to-rotate target (radians), written by the DOM layer, eased here. */
export type DragState = { target: number };

export type SceneStop = Pick<ResolvedStop, "id" | "model" | "hasModel" | "accent">;

export type SceneProps = {
  stops: SceneStop[];
  index: number;
  reduced: boolean;
  drag: { readonly current: DragState };
};

/** True isometric camera: looking down the (1,1,1) diagonal, zoomed to the viewport. */
function IsoCamera() {
  const camera = useRef<OrthoCam>(null);
  const size = useThree((s) => s.size);
  useLayoutEffect(() => {
    const cam = camera.current;
    if (!cam) return;
    cam.lookAt(0, 0, 0);
    cam.zoom = isoZoom(size.width, size.height);
    cam.updateProjectionMatrix();
  }, [size]);
  return <OrthographicCamera ref={camera} makeDefault position={[10, 10, 10]} near={0.1} far={50} />;
}

/**
 * Soft contact shadow under the room: a baked radial gradient rather than
 * drei's ContactShadows. Same look for a floating box, a fraction of the
 * startup and per-frame cost on phones.
 */
function BlobShadow() {
  const texture = useMemo(() => {
    const size = 128;
    const canvas =
      typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(size, size) : Object.assign(document.createElement("canvas"), { width: size, height: size });
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(26,0,16,0.55)");
    g.addColorStop(0.55, "rgba(26,0,16,0.25)");
    g.addColorStop(1, "rgba(26,0,16,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new CanvasTexture(canvas);
  }, []);
  return (
    <mesh position={[0.08, -0.62, 0.08]} rotation-x={-Math.PI / 2} renderOrder={-1}>
      <planeGeometry args={[2.1, 2.1]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

/** Holds the current diorama; shrinks the old one away and pops the next one in on stop change. */
function Diorama({ stops, index, reduced, drag }: SceneProps) {
  const [shown, setShown] = useState(index);
  const group = useRef<Group>(null);
  const scale = useRef(reduced ? 1 : 0);
  const spin = useRef(0);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const leaving = shown !== index;
    scale.current = MathUtils.damp(scale.current, leaving ? 0 : 1, leaving ? 10 : 4.5, dt);
    if (leaving && scale.current < 0.03) setShown(index);

    spin.current = MathUtils.damp(spin.current, drag.current.target, 7, dt);
    const sway = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.35) * 0.14;
    const settle = reduced ? 0 : (1 - scale.current) * 0.9;

    g.scale.setScalar(Math.max(scale.current, 0.0001));
    g.rotation.y = sway + spin.current + settle;
  });

  const stop = stops[shown];
  return (
    <group ref={group}>
      <Float enabled={!reduced} speed={1.1} rotationIntensity={0.12} floatIntensity={0.6} floatingRange={[-0.035, 0.035]}>
        <VenueModel url={stop.model} hasModel={stop.hasModel} accent={stop.accent} />
      </Float>
      <BlobShadow />
    </group>
  );
}

export default function Scene(props: SceneProps) {
  const accent = props.stops[props.index]?.accent ?? "#ffffff";
  return (
    <>
      <IsoCamera />
      <hemisphereLight args={["#fff6f4", accent, 0.9]} />
      <directionalLight position={[2.5, 6, 4]} intensity={2} color="#fff3f0" />
      <directionalLight position={[-5, 2, -1]} intensity={0.6} color={accent} />
      <Diorama {...props} />
    </>
  );
}
