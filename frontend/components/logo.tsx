import { cn } from "@/lib/utils";

/**
 * The Rono brand mark — an "hourglass" rono graph (four corner nodes + a
 * center hub, joined by a top bar, a bottom bar, and two crossing diagonals).
 *
 * This is the SINGLE in-app vector source: the same geometry the raster app
 * icons are rendered from (scripts/generate-icons.mjs) and that iOS draws in
 * SwiftUI (BrandMark). Uses `currentColor` so callers set the tint via text
 * color. Keep node coordinates in sync with those two if the mark is retuned.
 */
export function LogoMark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-7", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <g
        stroke="currentColor"
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
      >
        {/* edges: top bar, bottom bar, two diagonals through the hub */}
        <line x1={22} y1={24} x2={78} y2={24} />
        <line x1={22} y1={76} x2={78} y2={76} />
        <line x1={22} y1={24} x2={78} y2={76} />
        <line x1={78} y1={24} x2={22} y2={76} />
        {/* nodes */}
        <circle cx={22} cy={24} r={7} />
        <circle cx={78} cy={24} r={7} />
        <circle cx={22} cy={76} r={7} />
        <circle cx={78} cy={76} r={7} />
        <circle cx={50} cy={50} r={6.5} />
      </g>
    </svg>
  );
}

/**
 * Mark + "Rono" wordmark lockup. The mark inherits the wordmark's color via
 * `currentColor` unless `markClassName` overrides it.
 */
export function Logo({
  className,
  markClassName,
  wordClassName,
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={cn("size-7", markClassName)} />
      <span className={cn("font-semibold tracking-tight", wordClassName)}>
        Rono
      </span>
    </div>
  );
}
