"use client";

import { useState } from "react";
import { startAmbient, stopAmbient } from "@/lib/ambient";

/** Bottom-left sound bars. Ambient sound is off until tapped. */
export default function SoundToggle() {
  const [on, setOn] = useState(false);

  const toggle = () => {
    if (on) stopAmbient();
    else startAmbient();
    setOn(!on);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Mute ambient sound" : "Play ambient sound"}
      className={`fixed bottom-5 left-4 z-40 flex h-10 w-10 items-end justify-center gap-[3px] pb-3 md:bottom-8 md:left-8 ${on ? "sound-on" : ""}`}
    >
      {[0, 0.25, 0.1, 0.4].map((delay, i) => (
        <span
          key={i}
          className="sound-bar block h-4 w-[2px] rounded-full bg-white/90"
          style={{ animationDelay: `${-delay}s`, transform: on ? undefined : `scaleY(${[0.35, 0.6, 0.45, 0.25][i]})` }}
        />
      ))}
    </button>
  );
}
