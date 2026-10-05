import Image from "next/image";

/**
 * A venue photo, or a tasteful accent-coloured placeholder telling you where
 * to drop the real one.
 */
export default function PhotoFrame({
  src,
  alt,
  sizes,
  stopId,
  n,
  priority,
}: {
  src?: string;
  alt: string;
  sizes: string;
  stopId: string;
  n: number;
  priority?: boolean;
}) {
  if (src) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />;
  }
  const angle = 115 + n * 37;
  return (
    <div
      role="img"
      aria-label={`${alt} (placeholder)`}
      className="absolute inset-0 flex items-end p-4"
      style={{
        background: `linear-gradient(${angle}deg, var(--stop-accent) 0%, color-mix(in oklab, var(--stop-accent) 70%, var(--stop-bg)) 100%)`,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18] mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--stop-bg) 0 1px, transparent 1px 14px)",
        }}
      />
      <span className="relative flex flex-col gap-1 text-[9px] font-medium uppercase tracking-[0.3em]" style={{ color: "var(--stop-bg)" }}>
        <span>Photo {String(n).padStart(2, "0")}</span>
        <span className="normal-case tracking-[0.12em] opacity-70">/photos/{stopId}/</span>
      </span>
    </div>
  );
}
