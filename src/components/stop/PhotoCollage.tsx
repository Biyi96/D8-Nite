"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import PhotoFrame from "./PhotoFrame";

// Layout slots for up to five layered photos: position, size, speed, tilt and
// stacking. Large and deliberately overlapping, like prints spread on a table.
const SLOTS = [
  { cls: "left-[1%] top-[1%] z-[1] w-[70%] md:left-[8%] md:w-[38%] aspect-[4/5]", speed: -0.1, rotate: -4 },
  { cls: "right-[0%] top-[17%] z-[2] w-[62%] md:right-[10%] md:top-[6%] md:w-[33%] aspect-square", speed: 0.2, rotate: 3 },
  { cls: "left-[4%] top-[39%] z-[3] w-[66%] md:left-[30%] md:top-[36%] md:w-[32%] aspect-[3/4]", speed: -0.24, rotate: -2 },
  { cls: "right-[1%] top-[57%] z-[2] w-[60%] md:right-[5%] md:top-[48%] md:w-[31%] aspect-[4/5]", speed: 0.14, rotate: 5 },
  { cls: "left-[0%] top-[73%] z-[1] w-[58%] md:left-[3%] md:top-[58%] md:w-[30%] aspect-square", speed: 0.28, rotate: -3 },
];

function Layer({
  progress,
  slot,
  reduced,
  children,
}: {
  progress: MotionValue<number>;
  slot: (typeof SLOTS)[number];
  reduced: boolean;
  children: React.ReactNode;
}) {
  const y = useTransform(progress, [0, 1], reduced ? ["0%", "0%"] : [`${slot.speed * 100}%`, `${-slot.speed * 100}%`]);
  const rotate = useTransform(progress, [0, 1], reduced ? [slot.rotate, slot.rotate] : [slot.rotate * 1.6, slot.rotate * 0.4]);
  const scale = useTransform(progress, [0, 0.5, 1], reduced ? [1, 1, 1] : [0.92, 1, 1.04]);
  return (
    <motion.div style={{ y, rotate, scale }} className={`absolute overflow-hidden rounded-[2px] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.45)] ${slot.cls}`}>
      {children}
    </motion.div>
  );
}

/** Venue photos in layered parallax, each layer at its own speed, with the vibe line drifting between them. */
export default function PhotoCollage({
  photos,
  stopId,
  name,
  blurb,
  reduced,
}: {
  photos: string[];
  stopId: string;
  name: string;
  blurb: string;
  reduced: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["40%", "-40%"]);

  // Photo 1 is the full-bleed background above; the collage uses the rest.
  // With no photos yet, show four placeholders.
  const rest = photos.slice(1);
  const items: (string | undefined)[] = photos.length ? rest.slice(0, 5) : [undefined, undefined, undefined, undefined];
  if (photos.length === 1) items.push(photos[0]);

  return (
    <section ref={ref} className="relative h-[165svh] overflow-hidden md:h-[140svh]" aria-label={`Photos of ${name}`}>
      {items.map((src, i) => (
        <Layer key={i} progress={scrollYProgress} slot={SLOTS[i]} reduced={reduced}>
          <PhotoFrame src={src} alt={`${name}, photo ${i + 2}`} sizes="(min-width: 768px) 30vw, 60vw" stopId={stopId} n={i + 2} />
        </Layer>
      ))}
      <motion.p
        style={{ y: textY }}
        className="font-display absolute inset-x-6 top-[42%] z-10 mx-auto max-w-[18ch] text-center text-[7.4vw] italic leading-[1.08] [text-shadow:0_2px_24px_var(--stop-bg)] md:text-[3.6vw]"
      >
        {blurb}
      </motion.p>
    </section>
  );
}
