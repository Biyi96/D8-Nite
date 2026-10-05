"use client";

import { useGLTF } from "@react-three/drei";
import { Component, Suspense, useMemo, type ReactNode } from "react";
import { Box3, Vector3 } from "three";
import PlaceholderRoom from "./PlaceholderRoom";

export const DRACO_PATH = "/draco/";

/** Loads a (Draco-compressed) GLB, centres it and scales it to the unit cube. */
function Glb({ url }: { url: string }) {
  const { scene } = useGLTF(url, DRACO_PATH);
  const { object, scale, offset } = useMemo(() => {
    const object = scene.clone(true);
    const box = new Box3().setFromObject(object);
    const size = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    const scale = 1 / Math.max(size.x, size.y, size.z, 1e-6);
    return { object, scale, offset: centre.multiplyScalar(-1) };
  }, [scene]);

  return (
    <group scale={scale}>
      <primitive object={object} position={offset} />
    </group>
  );
}

class ModelErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[date-night] GLB failed to load, showing placeholder room.", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** The venue diorama, falling back to the placeholder room while loading or if missing/broken. */
export default function VenueModel({
  url,
  hasModel,
  accent,
}: {
  url: string;
  hasModel: boolean;
  accent: string;
}) {
  const placeholder = <PlaceholderRoom accent={accent} />;
  if (!hasModel) return placeholder;
  return (
    <ModelErrorBoundary key={url} fallback={placeholder}>
      <Suspense fallback={placeholder}>
        <Glb url={url} />
      </Suspense>
    </ModelErrorBoundary>
  );
}
