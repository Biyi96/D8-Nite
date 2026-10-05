"use client";

import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";
import PhotoFrame from "./PhotoFrame";

const char: Variants = {
  hidden: { y: "110%", opacity: 0 },
  show: (i: number) => ({
    y: "0%",
    opacity: 1,
    transition: { duration: 0.9, delay: i * 0.045, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Numerals({ value, offset }: { value: string; offset: number }) {
  return (
    <span className="inline-flex overflow-hidden pb-[0.06em]">
      <span className="sr-only">{value}</span>
      {value.split("").map((c, i) => (
        <motion.span key={i} custom={offset + i} variants={char} className="inline-block" aria-hidden>
          {c}
        </motion.span>
      ))}
    </span>
  );
}

/**
 * Full-bleed background-image parallax (technique from olivierlarose/
 * background-image-parallax, reimplemented): a clip-path window over a fixed,
 * scroll-shifted image, with the arrive/leave times moving at their own speed.
 */
export default function ParallaxTimes({
  arrive,
  leave,
  photo,
  stopId,
  name,
  reduced,
}: {
  arrive: string;
  leave: string;
  photo?: string;
  stopId: string;
  name: string;
  reduced: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-10%", "10%"]);
  const textY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["22%", "-22%"]);

  return (
    <section
      ref={ref}
      className="relative h-[110svh] overflow-hidden"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      aria-label="Arrive and leave times"
    >
      <div className="fixed left-0 top-[-10vh] h-[120vh] w-full">
        <motion.div style={{ y: imageY }} className="relative h-full w-full">
          <PhotoFrame src={photo} alt={name} sizes="100vw" stopId={stopId} n={1} />
          <div className="absolute inset-0 opacity-50" style={{ background: "var(--stop-bg)" }} />
        </motion.div>
      </div>

      <motion.div
        style={{ y: textY }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        className="font-display relative z-10 flex h-full flex-col items-center justify-center gap-2 text-center leading-[0.9] md:flex-row md:gap-[3vw]"
      >
        <div className="flex flex-col items-center">
          <span className="mb-2 font-sans text-[11px] font-medium uppercase tracking-[0.35em] text-white/85">Arrive</span>
          <span className="text-[30vw] md:text-[14vw]">
            <Numerals value={arrive} offset={0} />
          </span>
        </div>
        <motion.span
          variants={{ hidden: { opacity: 0, scale: 0.6 }, show: { opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.8 } } }}
          className="text-[12vw] leading-none md:mt-6 md:text-[6vw]"
        >
          <span className="sr-only">to</span>
          <span aria-hidden className="inline-block rotate-90 md:rotate-0">→</span>
        </motion.span>
        <div className="flex flex-col items-center">
          <span className="mb-2 font-sans text-[11px] font-medium uppercase tracking-[0.35em] text-white/85">Leave</span>
          <span className="text-[30vw] md:text-[14vw]">
            <Numerals value={leave} offset={6} />
          </span>
        </div>
      </motion.div>
    </section>
  );
}
