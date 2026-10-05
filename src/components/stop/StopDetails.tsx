"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import type { ResolvedStop } from "@content/types";
import ParallaxTimes from "./ParallaxTimes";
import PhotoCollage from "./PhotoCollage";

const rise: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = (s: number): Variants => ({ show: { transition: { staggerChildren: s } } });

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
      <path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

/** Section B: the scroll-down reveal under each hero. */
export type UpNext = { eyebrow: string; title: string; button: string };

export default function StopDetails({
  stop,
  upNext,
  isFirst,
  onNext,
  onPrev,
  reduced,
}: {
  stop: ResolvedStop;
  upNext: UpNext;
  isFirst: boolean;
  onNext: () => void;
  onPrev: () => void;
  reduced: boolean;
}) {
  const inView = { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.3 } } as const;

  return (
    <div id={`${stop.id}-details`} className="relative z-10">
      {/* Who / what / where */}
      <motion.header {...inView} variants={stagger(0.1)} className="mx-auto flex min-h-[80svh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
        <motion.p variants={rise} className="text-[11px] font-medium uppercase tracking-[0.35em] text-white/80">
          {stop.eyebrow}
        </motion.p>
        <motion.h2 variants={rise} className="font-display mt-5 text-[15vw] uppercase leading-[0.9] md:text-[7vw]">
          {stop.name}
        </motion.h2>
        <motion.p variants={rise} className="mt-5 text-[13px] font-medium uppercase tracking-[0.3em] text-white/80">
          {stop.venue}
        </motion.p>
        <motion.p variants={rise} className="mt-8 text-[11px] font-medium uppercase tracking-[0.35em] text-white/70">
          {stop.arrive} – {stop.leave}
        </motion.p>
      </motion.header>

      <ParallaxTimes arrive={stop.arrive} leave={stop.leave} photo={stop.photos[0]} stopId={stop.id} name={stop.name} reduced={reduced} />

      <PhotoCollage photos={stop.photos} stopId={stop.id} name={stop.name} blurb={stop.blurb} reduced={reduced} />

      {/* Menu + map */}
      <motion.div {...inView} variants={stagger(0.12)} className="mx-auto grid max-w-5xl gap-5 px-5 py-24 md:grid-cols-2 md:gap-8 md:px-10">
        <motion.a
          variants={rise}
          href={stop.menuUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[28px] border border-white/20 bg-white/[0.06] p-7 transition-colors hover:bg-white/[0.1]"
        >
          {stop.menuImage && (
            <Image src={stop.menuImage} alt="" fill sizes="(min-width: 768px) 40vw, 90vw" className="object-cover opacity-30 transition-opacity group-hover:opacity-45" />
          )}
          <span className="relative text-[11px] font-medium uppercase tracking-[0.35em] text-white/75">
            {stop.menuLabel ?? "The menu"}
          </span>
          <span className="font-display relative mt-10 text-[44px] leading-none md:text-[56px]">{stop.name}</span>
          <span className="relative mt-6 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em]">
            Have a look <Arrow />
          </span>
        </motion.a>

        <motion.div
          variants={rise}
          className="flex min-h-[260px] flex-col justify-between rounded-[28px] p-7 text-[var(--stop-bg)]"
          style={{ background: "var(--stop-accent)" }}
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.35em] opacity-75">Location</span>
          <address className="mt-8 text-[17px] not-italic leading-[1.55]">{stop.address}</address>
          <div className="mt-8">
            <a
              href={stop.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--stop-bg)] px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-white transition-transform hover:scale-[1.04] active:scale-95"
            >
              Open in Maps <Arrow />
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* Up next */}
      <motion.footer {...inView} variants={stagger(0.1)} className="flex min-h-[70svh] flex-col items-center justify-center px-6 pb-28 pt-10 text-center">
        <motion.p variants={rise} className="text-[11px] font-medium uppercase tracking-[0.35em] text-white/75">
          {upNext.eyebrow}
        </motion.p>
        <motion.p variants={rise} className="font-display mt-4 max-w-[14ch] text-[12vw] uppercase leading-[0.9] md:text-[5.5vw]">
          {upNext.title}
        </motion.p>
        <motion.div variants={rise} className="mt-10 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-white px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-neutral-900 transition-transform hover:scale-[1.04] active:scale-95"
          >
            {upNext.button}
          </button>
          {!isFirst && (
            <button type="button" onClick={onPrev} className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/80 underline-offset-[6px] hover:underline">
              Prev
            </button>
          )}
        </motion.div>
      </motion.footer>
    </div>
  );
}
