import CursorFollower from "./CursorFollower";
import TopFade from "./TopFade";

/** Fixed corner UI shared by every page. */
export default function Chrome({ index, total }: { index: number; total: number }) {
  return (
    <>
      <TopFade />

      {/* Top-left: hexagon mark (the isometric room silhouette) + wordmark. */}
      <div className="fixed left-4 top-[calc(env(safe-area-inset-top,0px)+1rem)] z-40 flex items-center gap-3 md:left-8 md:top-7">
        <div className="relative grid h-11 w-10 place-items-center">
          <svg viewBox="0 0 40 44" className="absolute inset-0 h-full w-full" aria-hidden>
            <polygon points="20,1 39,11.5 39,32.5 20,43 1,32.5 1,11.5" fill="none" stroke="white" strokeOpacity="0.8" />
          </svg>
          <span className="font-display text-[15px] leading-none tracking-tight">D8</span>
        </div>
        <span className="font-display text-[19px] leading-none tracking-[0.02em] text-white/90">D8Nite</span>
      </div>

      {/* Page indicator: hexagon pips + 01 / 04 */}
      <div className="float-slow fixed right-4 top-[calc(env(safe-area-inset-top,0px)+1.5rem)] z-40 flex items-center gap-3 md:right-8 md:top-9">
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

      <CursorFollower />
    </>
  );
}
