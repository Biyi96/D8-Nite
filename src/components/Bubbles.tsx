import type { CSSProperties } from "react";

// Deterministic pseudo-random so server and client markup match.
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const BUBBLES = Array.from({ length: 16 }, (_, i) => {
  const size = 4 + Math.round(rand(i + 1) * 18);
  return {
    left: `${(rand(i + 101) * 100).toFixed(2)}%`,
    size,
    dur: 16 + rand(i + 201) * 18,
    delay: -rand(i + 301) * 30,
    sway: 6 + rand(i + 401) * 16,
    swayDur: 4 + rand(i + 501) * 5,
    opacity: 0.18 + (1 - size / 22) * 0.35,
  };
});

/** Slow-rising champagne bubbles behind everything. Hidden for reduced motion (CSS). */
export default function Bubbles() {
  return (
    <div aria-hidden className="bubble-field pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {BUBBLES.map((b, i) => (
        <div
          key={i}
          className="bubble"
          style={
            {
              left: b.left,
              "--dur": `${b.dur.toFixed(1)}s`,
              "--delay": `${b.delay.toFixed(1)}s`,
              "--sway": `${b.sway.toFixed(1)}px`,
              "--sway-dur": `${b.swayDur.toFixed(1)}s`,
              "--bubble-opacity": b.opacity.toFixed(2),
            } as CSSProperties
          }
        >
          <span style={{ width: b.size, height: b.size }} />
        </div>
      ))}
    </div>
  );
}
