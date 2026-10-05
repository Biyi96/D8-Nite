"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { ResolvedDateNight, ResolvedStop } from "@content/types";
import Backdrop from "./Backdrop";
import Bubbles from "./Bubbles";
import Chrome from "./chrome/Chrome";
import HeroStage from "./HeroStage";
import SmoothScroll, { useSmoothScroll } from "./SmoothScroll";
import Hero from "./stop/Hero";
import StopDetails from "./stop/StopDetails";

/** "Date Night" → ["Date", "Night"]; longer titles split into two balanced lines. */
function splitLines(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 2) return words;
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (diff < bestDiff) [best, bestDiff] = [i, diff];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

function heroLines(date: ResolvedDateNight, stop: ResolvedStop, index: number) {
  if (index === 0) return splitLines(date.title);
  return stop.headline ?? splitLines(stop.name);
}

function Experience({ date }: { date: ResolvedDateNight }) {
  const reduced = !!useReducedMotion();
  const { scrollTo } = useSmoothScroll();
  const [nav, setNav] = useState({ index: 0, step: 0, direction: 1 as 1 | -1 });

  const { stops } = date;
  const { index } = nav;
  const stop = stops[index];
  const isLast = index === stops.length - 1;

  const go = useCallback(
    (to: number) => {
      if (to === index || !stops[to]) return;
      scrollTo(0, { immediate: true });
      setNav((n) => ({ index: to, step: n.step + 1, direction: to > n.index ? 1 : -1 }));
      const hash = to === 0 ? "" : `#${stops[to].id}`;
      history.replaceState(null, "", `${location.pathname}${location.search}${hash}`);
    },
    [index, stops, scrollTo],
  );

  const next = () => go(isLast ? 0 : index + 1);
  const prev = () => go(index - 1);
  const toDetails = () => {
    const el = document.getElementById(`${stop.id}-details`);
    if (el) scrollTo(el);
  };

  // Deep link: /dates/<slug>#barbarella opens on that stop.
  useEffect(() => {
    const fromHash = stops.findIndex((s) => `#${s.id}` === location.hash);
    if (fromHash > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL once after hydration
      setNav({ index: fromHash, step: 1, direction: 1 });
    }
  }, [stops]);

  // Expose the stop colours to CSS and the mobile browser chrome.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--stop-bg", stop.bg);
    root.style.setProperty("--stop-accent", stop.accent);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", stop.bg);
  }, [stop.bg, stop.accent]);

  return (
    <>
      <Backdrop bg={stop.bg} step={nav.step} direction={nav.direction} reduced={reduced} />
      <Bubbles />
      <Chrome credit={date.credit} index={index} total={stops.length} />

      <main className="relative">
        <HeroStage stops={stops} index={index} reduced={reduced} />

        <AnimatePresence mode="wait">
          <motion.div
            key={stop.id}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.3, duration: 0.3 } }}
          >
            {index === 0 ? (
              <Hero
                eyebrow={date.dateLabel}
                lines={heroLines(date, stop, index)}
                intro={date.intro ?? stop.blurb}
                primaryLabel="Let's go"
                onPrimary={toDetails}
                secondaryLabel={stops.length > 1 ? "Next stop" : undefined}
                onSecondary={next}
                credit={date.credit}
                onScrollCue={toDetails}
                first={nav.step === 0}
              />
            ) : (
              <Hero
                eyebrow={stop.eyebrow}
                lines={heroLines(date, stop, index)}
                intro={`${stop.venue} · ${stop.arrive}`}
                primaryLabel={isLast ? "Back to the start" : "Next stop"}
                onPrimary={next}
                secondaryLabel="Prev"
                onSecondary={prev}
                credit={date.credit}
                onScrollCue={toDetails}
              />
            )}
            <StopDetails
              stop={stop}
              next={stops[index + 1]}
              isFirst={index === 0}
              onNext={next}
              onPrev={prev}
              reduced={reduced}
            />
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}

export default function DateExperience({ date }: { date: ResolvedDateNight }) {
  return (
    <SmoothScroll>
      <Experience date={date} />
    </SmoothScroll>
  );
}
