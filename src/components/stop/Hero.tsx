"use client";

import { motion, type Variants } from "framer-motion";
import type { CSSProperties } from "react";

const line: Variants = {
  hidden: { y: "105%" },
  show: { y: "0%", transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } },
  exit: { y: "-105%", transition: { duration: 0.5, ease: [0.7, 0, 0.2, 1] } },
};

const fade: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.35 } },
};

export default function Hero({
  eyebrow,
  lines,
  intro,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  credit,
  onScrollCue,
  first,
}: {
  eyebrow: string;
  lines: string[];
  intro: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  credit?: string;
  onScrollCue: () => void;
  /** First paint of the page: render visible from the server and animate in with CSS, so the headline doesn't wait for hydration. */
  first?: boolean;
}) {
  const chars = Math.max(...lines.map((l) => l.length), 4);

  return (
    <motion.section
      initial={first ? false : "hidden"}
      animate="show"
      exit="exit"
      variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
      className={`pointer-events-none relative z-10 flex h-svh flex-col items-center justify-center px-4 text-center ${first ? "css-intro" : ""}`}
    >
      <motion.p variants={fade} style={{ "--i": 0 } as CSSProperties} className="intro-fade mb-4 text-[11px] font-medium uppercase tracking-[0.35em] text-white/85 md:mb-6">
        <span className="float inline-block">{eyebrow}</span>
      </motion.p>

      <h1
        className="font-display hero-title uppercase leading-[0.86] tracking-[-0.01em] text-white"
        style={{ "--chars": chars } as CSSProperties}
      >
        {lines.map((l, i) => (
          <span key={l} className="block overflow-hidden pb-[0.04em]">
            <motion.span variants={line} style={{ "--i": i + 1 } as CSSProperties} className="intro-line block">
              {l}
            </motion.span>
          </span>
        ))}
      </h1>

      <motion.p
        variants={fade}
        style={{ "--i": lines.length + 1 } as CSSProperties}
        className="intro-fade mt-5 max-w-[22rem] text-[17px] leading-[1.6] text-white/90 md:mt-7 md:max-w-[30rem] md:text-[19px]"
      >
        {intro}
      </motion.p>

      <motion.div variants={fade} style={{ "--i": lines.length + 2 } as CSSProperties} className="intro-fade pointer-events-auto mt-7 flex flex-col items-center gap-4 md:mt-9">
        <button
          type="button"
          onClick={onPrimary}
          className="rounded-full bg-white px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-neutral-900 transition-transform duration-300 hover:scale-[1.04] active:scale-95"
        >
          {primaryLabel}
        </button>
        {secondaryLabel && onSecondary && (
          <button
            type="button"
            onClick={onSecondary}
            className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/85 underline-offset-[6px] hover:underline"
          >
            {secondaryLabel}
          </button>
        )}
      </motion.div>

      <motion.div variants={fade} style={{ "--i": lines.length + 3 } as CSSProperties} className="intro-fade absolute inset-x-0 bottom-5 flex flex-col items-center gap-3 md:bottom-8">
        <button
          type="button"
          onClick={onScrollCue}
          className="pointer-events-auto flex flex-col items-center gap-2 text-[9px] font-medium uppercase tracking-[0.4em] text-white/70"
          aria-label="Scroll to the details"
        >
          <span className="float">Scroll</span>
          <span className="relative block h-8 w-px overflow-hidden bg-white/20">
            <span className="cue-line absolute inset-0 bg-white" />
          </span>
        </button>
        {credit && (
          <p className="text-[9px] font-medium uppercase tracking-[0.35em] text-white/60 md:hidden">{credit}</p>
        )}
      </motion.div>
    </motion.section>
  );
}
