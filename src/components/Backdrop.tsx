"use client";

import { AnimatePresence, motion } from "framer-motion";

/**
 * Full-screen stop colour. On Next the new colour wipes up from the bottom as
 * an expanding circle; on Prev it drops in from the top. The old layer stays
 * underneath until the wipe has covered it.
 */
export default function Backdrop({
  bg,
  step,
  direction,
  reduced,
}: {
  bg: string;
  /** Increments on every change so each wipe is a new layer. */
  step: number;
  direction: 1 | -1;
  reduced: boolean;
}) {
  const origin = direction > 0 ? "50% 110%" : "50% -10%";
  return (
    <div aria-hidden className="fixed inset-0 -z-10">
      <AnimatePresence initial={false}>
        <motion.div
          key={step}
          className="absolute inset-0"
          style={{ background: bg, zIndex: step }}
          initial={reduced ? { opacity: 0 } : { clipPath: `circle(0% at ${origin})` }}
          animate={reduced ? { opacity: 1 } : { clipPath: `circle(150% at ${origin})` }}
          exit={{ opacity: 0.999, transition: { duration: 1.2 } }}
          transition={{ duration: reduced ? 0.6 : 1.15, ease: [0.7, 0, 0.2, 1] }}
        />
      </AnimatePresence>
    </div>
  );
}
