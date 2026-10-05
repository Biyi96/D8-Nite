"use client";

import { motion, useMotionValueEvent, useScroll, useTransform, type Variants } from "framer-motion";
import { useEffect, useRef } from "react";
import type { PlanItem, ResolvedStop, Summary } from "@content/types";
import Hero from "../stop/Hero";

const rise: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

const KIND_LABEL: Record<PlanItem["kind"], string> = {
  arrive: "Arrive",
  stay: "Stay",
  travel: "On the move",
  booking: "Reservation",
};

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/** "15:00" → "21:00" and the hours between, for the at-a-glance strip. */
function glance(items: PlanItem[], stopCount: number) {
  const start = items[0]?.time ?? "";
  const end = items.reduce((latest, i) => {
    const t = i.until ?? i.time;
    return toMinutes(t) > toMinutes(latest) ? t : latest;
  }, start);
  const hours = (toMinutes(end) - toMinutes(start)) / 60;
  return [
    { label: "Starts", value: start },
    { label: "Ends", value: end },
    { label: "Stops", value: String(stopCount) },
    { label: "Hours", value: Number.isInteger(hours) ? String(hours) : hours.toFixed(1) },
  ];
}

/** Three overlapping hexagons in the stops' colours: the dioramas, abstracted. */
function HexTrio({ stops }: { stops: ResolvedStop[] }) {
  const spots = [
    { x: 50, y: 34 },
    { x: 31, y: 66 },
    { x: 69, y: 66 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 100 100" className="float-slow aspect-square h-[min(64svh,96vw)] opacity-80">
        {stops.slice(0, 3).map((s, i) => {
          const { x, y } = spots[i];
          const r = 24;
          const pts = Array.from({ length: 6 }, (_, k) => {
            const a = (Math.PI / 3) * k - Math.PI / 2;
            return `${(x + r * Math.cos(a)).toFixed(2)},${(y + r * Math.sin(a)).toFixed(2)}`;
          }).join(" ");
          return (
            <g key={s.id}>
              <polygon points={pts} fill={s.bg} fillOpacity="0.55" />
              <polygon points={pts} fill="none" stroke={s.accent} strokeOpacity="0.7" strokeWidth="0.35" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Node({ item, accent }: { item: PlanItem; accent: string }) {
  if (item.kind === "travel") {
    return <span className="block h-2.5 w-2.5 rounded-full border border-white/70 bg-transparent" />;
  }
  const filled = item.kind !== "arrive";
  return (
    <span
      className="hex block h-[18px] w-4"
      style={{ background: filled ? accent : "transparent", boxShadow: filled ? `0 0 18px ${accent}` : undefined, outline: filled ? undefined : `1px solid ${accent}` }}
    />
  );
}

function Row({ item, accent, last }: { item: PlanItem; accent: string; last: boolean }) {
  const travel = item.kind === "travel";
  return (
    <motion.li
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      className="relative grid grid-cols-[4.75rem_1.5rem_minmax(0,1fr)] gap-x-3 md:grid-cols-[9rem_2rem_minmax(0,1fr)] md:gap-x-6"
    >
      {/* Time */}
      <div className="pt-0.5 text-right">
        <p className={`font-display tabular-nums leading-none ${travel ? "text-[26px] text-white/70 md:text-[40px]" : "text-[34px] md:text-[56px]"}`}>{item.time}</p>
        {item.until && (
          <p className="mt-2 text-[11px] font-medium tabular-nums tracking-[0.25em] text-white/70">→ {item.until}</p>
        )}
      </div>

      {/* Rail */}
      <div className="relative flex justify-center">
        <div className="relative z-10 mt-2.5 grid h-5 place-items-center">
          <Node item={item} accent={accent} />
        </div>
        {!last && (
          <span
            aria-hidden
            className={`absolute bottom-[-1px] top-8 left-1/2 w-px -translate-x-1/2 ${travel ? "border-l border-dashed border-white/45" : "bg-white/35"}`}
          >
            {travel && <span className="rail-dot absolute -left-[3px] block h-[5px] w-[5px] rounded-full bg-white" />}
          </span>
        )}
      </div>

      {/* What */}
      <div className={`min-w-0 ${last ? "pb-2" : "pb-14 md:pb-20"}`}>
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/65">{KIND_LABEL[item.kind]}</p>
        <h3 className={`font-display mt-2 leading-[1.02] text-balance ${travel ? "text-[22px] italic text-white/85 md:text-[32px]" : "text-[28px] md:text-[44px]"}`}>
          {item.title}
        </h3>
        {item.detail && <p className="mt-2 text-[15px] leading-[1.55] text-white/75 md:text-[17px]">{item.detail}</p>}
      </div>
    </motion.li>
  );
}

/**
 * The closing page: the whole night as one timeline, no 3D. The page colour
 * moves through each stop's colour as you scroll, like the evening passing.
 */
export default function SummaryPage({
  summary,
  stops,
  dateLabel,
  onRestart,
  onPrev,
  reduced,
  scrollToTimeline,
}: {
  summary: Summary;
  stops: ResolvedStop[];
  dateLabel: string;
  onRestart: () => void;
  onPrev: () => void;
  reduced: boolean;
  scrollToTimeline: () => void;
}) {
  const evening = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: evening, offset: ["start center", "end end"] });

  const byId = new Map(stops.map((s) => [s.id, s]));
  // The sky follows the rows: each stop's colour as you reach it (travel legs
  // keep the colour you're leaving), back to midnight for the closing line.
  const rowColours = summary.items.reduce<string[]>((acc, item) => {
    const own = item.stopId ? byId.get(item.stopId)?.bg : undefined;
    return [...acc, own ?? acc[acc.length - 1] ?? summary.bg];
  }, []);
  const sky = [summary.bg, ...rowColours, summary.bg];
  const skyStops = sky.map((_, i) => i / (sky.length - 1));
  const backgroundColor = useTransform(scrollYProgress, skyStops, reduced ? sky.map(() => summary.bg) : sky);

  // Let the top-bar fade follow the sky.
  useMotionValueEvent(backgroundColor, "change", (c) => document.documentElement.style.setProperty("--scrim", c));
  useEffect(
    () => () => {
      document.documentElement.style.removeProperty("--scrim");
    },
    [],
  );

  return (
    <div className="relative">
      <motion.div aria-hidden className="pointer-events-none fixed inset-0 -z-[5]" style={{ backgroundColor }} />

      <div className="relative">
        <HexTrio stops={stops} />
        <Hero
          eyebrow={dateLabel}
          lines={summary.headline}
          intro={summary.intro ?? ""}
          primaryLabel="See the timeline"
          onPrimary={scrollToTimeline}
          secondaryLabel="Prev"
          onSecondary={onPrev}
          onScrollCue={scrollToTimeline}
        />
      </div>

      <div ref={evening}>
        <section id="plan-timeline" className="relative z-10 mx-auto max-w-3xl px-4 pt-16 md:px-10 md:pt-28">
          {/* At a glance */}
          <motion.dl
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="mb-16 grid grid-cols-4 border-y border-white/20 md:mb-24"
          >
            {glance(summary.items, stops.length).map((g) => (
              <motion.div key={g.label} variants={rise} className="flex flex-col items-center gap-1 py-5">
                <dt className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/60">{g.label}</dt>
                <dd className="font-display text-[26px] tabular-nums leading-none md:text-[40px]">{g.value}</dd>
              </motion.div>
            ))}
          </motion.dl>

          <div>
            <ol>
              {summary.items.map((item, i) => (
                <Row
                  key={`${item.time}-${item.title}`}
                  item={item}
                  accent={(item.stopId && byId.get(item.stopId)?.accent) || summary.accent}
                  last={i === summary.items.length - 1}
                />
              ))}
            </ol>
          </div>
        </section>

        <motion.footer
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="relative z-10 flex min-h-[85svh] flex-col items-center justify-center px-6 pb-[calc(env(safe-area-inset-bottom,0px)+6rem)] text-center"
        >
          <motion.p variants={rise} className="font-display max-w-[10ch] text-[18vw] italic leading-[0.92] text-balance md:text-[9vw]">
            {summary.closing}
          </motion.p>
          <motion.div variants={rise} className="mt-12 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={onRestart}
              className="rounded-full bg-white px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-neutral-900 transition-transform hover:scale-[1.04] active:scale-95"
            >
              Back to the start
            </button>
            <button type="button" onClick={onPrev} className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/80 underline-offset-[6px] hover:underline">
              Prev
            </button>
          </motion.div>
        </motion.footer>
      </div>
    </div>
  );
}
