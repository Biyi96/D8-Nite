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
import StopDetails, { type UpNext } from "./stop/StopDetails";
import SummaryPage from "./summary/SummaryPage";

const PLAN_ID = "plan";

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

  const { stops, summary } = date;
  const { index } = nav;
  // Pages: one per stop, then the summary ("the plan") if the date has one.
  const pageIds = [...stops.map((s) => s.id), ...(summary ? [PLAN_ID] : [])];
  const isSummary = !!summary && index === stops.length;
  const stop = stops[Math.min(index, stops.length - 1)];
  const isLastPage = index === pageIds.length - 1;
  const colours = isSummary && summary ? summary : stop;

  const go = useCallback(
    (to: number) => {
      if (to === index || to < 0 || to >= pageIds.length) return;
      scrollTo(0, { immediate: true });
      setNav((n) => ({ index: to, step: n.step + 1, direction: to > n.index ? 1 : -1 }));
      const hash = to === 0 ? "" : `#${pageIds[to]}`;
      history.replaceState(null, "", `${location.pathname}${location.search}${hash}`);
    },
    // pageIds is derived from stops/summary on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index, stops, summary, scrollTo],
  );

  const next = () => go(isLastPage ? 0 : index + 1);
  const prev = () => go(index - 1);
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) scrollTo(el);
  };
  const toDetails = () => scrollToId(`${stop.id}-details`);

  const nextStop = stops[index + 1];
  const upNext: UpNext = nextStop
    ? { eyebrow: `Up next · ${nextStop.arrive}`, title: nextStop.name, button: "Next stop" }
    : summary
      ? { eyebrow: "Up next", title: summary.headline.join(" "), button: "See the plan" }
      : { eyebrow: "That's the night", title: "♥", button: "Back to the start" };

  // Deep link: /dates/<slug>#barbarella (or #plan) opens on that page.
  useEffect(() => {
    const fromHash = pageIds.indexOf(location.hash.slice(1));
    if (fromHash > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL once after hydration
      setNav({ index: fromHash, step: 1, direction: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, summary]);

  // Expose the page colours to CSS and the mobile browser chrome.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--stop-bg", colours.bg);
    root.style.setProperty("--stop-accent", colours.accent);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", colours.bg);
  }, [colours.bg, colours.accent]);

  return (
    <>
      <Backdrop bg={colours.bg} step={nav.step} direction={nav.direction} reduced={reduced} />
      <Bubbles />
      <Chrome index={index} total={pageIds.length} />

      <main className="relative">
        <HeroStage stops={stops} index={Math.min(index, stops.length - 1)} visible={!isSummary} reduced={reduced} />

        <AnimatePresence mode="wait">
          <motion.div
            key={pageIds[index]}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.3, duration: 0.3 } }}
          >
            {isSummary && summary ? (
              <SummaryPage
                summary={summary}
                stops={stops}
                dateLabel={date.dateLabel}
                onRestart={() => go(0)}
                onPrev={prev}
                reduced={reduced}
                scrollToTimeline={() => scrollToId("plan-timeline")}
              />
            ) : index === 0 ? (
              <Hero
                eyebrow={date.dateLabel}
                lines={heroLines(date, stop, index)}
                intro={date.intro ?? stop.blurb}
                primaryLabel="Let's go"
                onPrimary={toDetails}
                secondaryLabel={stops.length > 1 ? "Next stop" : undefined}
                onSecondary={next}
                onScrollCue={toDetails}
                first={nav.step === 0}
              />
            ) : (
              <Hero
                eyebrow={stop.eyebrow}
                lines={heroLines(date, stop, index)}
                intro={`${stop.venue} · ${stop.arrive}`}
                primaryLabel={upNext.button}
                onPrimary={next}
                secondaryLabel="Prev"
                onSecondary={prev}
                onScrollCue={toDetails}
              />
            )}
            {!isSummary && (
              <StopDetails stop={stop} upNext={upNext} isFirst={index === 0} onNext={next} onPrev={prev} reduced={reduced} />
            )}
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
