"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import PhotoFrame from "./PhotoFrame";

// Layout slots for up to five layered photos: position, size, speed and tilt.
const SLOTS = [
  { cls: "left-[4%] top-[4%] w-[56%] md:left-[8%] md:w-[30%] aspect-[4/5]", speed: -0.12, rotate: -4 },
  { cls: "right-[4%] top-[18%] w-[46%] md:right-[10%] md:top-[6%] md:w-[24%] aspect-square", speed: 0.28, rotate: 3 },
  { cls: "left-[10%] top-[52%] w-[48%] md:left-[34%] md:top-[46%] md:w-[24%] aspect-[3/4]", speed: -0.32, rotate: -2 },
  { cls: "right-[6%] top-[66%] w-[42%] md:right-[6%] md:top-[54%] md:w-[22%] aspect-[4/5]", speed: 0.18, rotate: 5 },
  { cls: "left-[2%] top-[80%] w-[38%] md:left-[4%] md:top-[64%] md:w-[20%] aspect-square", speed: 0.36, rotate: -3 },
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
    <section ref={ref} className="relative h-[150svh] overflow-hidden md:h-[130svh]" aria-label={`Photos of ${name}`}>
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
