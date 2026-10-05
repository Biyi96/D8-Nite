import SoundToggle from "./SoundToggle";
import CursorFollower from "./CursorFollower";

/** Fixed corner UI shared by every stop. */
export default function Chrome({
  credit,
  index,
  total,
}: {
  credit?: string;
  index: number;
  total: number;
}) {
  return (
    <>
      {/* Top-left monogram: a hexagon (the isometric room silhouette) holding "D8". */}
      <div className="fixed left-4 top-4 z-40 flex items-center gap-3 md:left-8 md:top-7">
        <div className="relative grid h-11 w-10 place-items-center">
          <svg viewBox="0 0 40 44" className="absolute inset-0 h-full w-full" aria-hidden>
            <polygon points="20,1 39,11.5 39,32.5 20,43 1,32.5 1,11.5" fill="none" stroke="white" strokeOpacity="0.8" />
          </svg>
          <span className="font-display text-[15px] leading-none tracking-tight">D8</span>
        </div>
        <span className="flex flex-col text-[9px] font-medium uppercase leading-[1.25] tracking-[0.3em] text-white/85">
          <span>Date</span>
          <span>Night</span>
        </span>
      </div>

      {/* Stop indicator: hexagon pips + 01 / 03 */}
      <div className="float-slow fixed right-4 top-6 z-40 flex items-center gap-3 md:right-8 md:top-9">
        <div className="flex gap-1.5" aria-hidden>
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`hex block h-[11px] w-[10px] transition-colors duration-700 ${i === index ? "bg-white" : "bg-white/25"}`}
            />
          ))}
        </div>
        <span className="text-[10px] font-medium tabular-nums tracking-[0.3em] text-white/85">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Left-edge vertical credit (desktop). Mobile shows it in the hero instead. */}
      {credit && (
        <p className="fixed left-8 top-1/2 z-40 hidden origin-center -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.35em] text-white/70 md:block md:left-[2.6rem]">
          {credit}
        </p>
      )}

      <SoundToggle />
      <CursorFollower />
    </>
  );
}
