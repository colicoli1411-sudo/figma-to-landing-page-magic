// Shared CTA button system — single source of truth so every call-to-action
// across the site reads as one consistent set. Two variants only:
//   • Primary   — solid brand violet, with a diagonal "glare" light streak
//                 that sweeps across on hover (React Bits "Glare Hover").
//   • Secondary — quiet glass/ghost outline, no hover glare.
// The glare is deliberately reserved for the primary button so it stays a
// special accent instead of noise.
//
// Each variant exports only its *identity* classes (colour, radius, hover,
// focus). Call sites append their own sizing/width so existing layouts are
// preserved. Compose with `cn(...)`.
import { cn } from "@/lib/utils";

/** Diagonal light "glare" that sweeps across the button on hover — the React
 *  Bits GlareHover effect, applied as an overlay. Drop inside any primary CTA
 *  (which provides `group relative overflow-hidden`). See `.btn-glare` in
 *  styles.css for the sweep. */
export function GlareHover({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("btn-glare pointer-events-none absolute inset-0", className)}
    />
  );
}

/** Primary CTA — solid brand violet + hover glare sweep. Requires a <GlareHover />
 *  child. Append sizing (e.g. "px-6 py-3.5 text-[15px]") per call site. */
export const CTA_PRIMARY =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[12px] " +
  "bg-[#6E56CF] font-semibold text-white " +
  "drop-shadow-[0_0_10px_rgba(170,153,236,0.3)] " +
  "transition-[transform,filter] duration-200 " +
  "hover:scale-[1.02] hover:drop-shadow-[0_0_16px_rgba(170,153,236,0.45)] active:scale-[0.98] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2";

/** Secondary CTA on a light background — glass ghost with a quiet hover: the
 *  border brightens to violet and the glass lifts slightly (no shadow halo, so
 *  it stays calm in dense areas). Uniform with the dark variant + Pricing outline. */
export const CTA_SECONDARY_LIGHT =
  "group relative inline-flex items-center justify-center gap-2 rounded-[12px] " +
  "border border-[color:var(--color-stroke-brand)] bg-white/40 font-semibold text-[#1d1d23] backdrop-blur-md " +
  "transition-[transform,background-color,border-color,box-shadow] duration-300 " +
  "hover:scale-[1.02] hover:border-[#8B79E6] hover:bg-white/60 active:scale-[0.98] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2";

/** Glass CTA on a dark background — quiet hover: border brightens to violet and
 *  the glass lifts slightly (no shadow halo, no solid fill, so it never competes
 *  with the solid primary/featured button). Uniform with Pricing outline + Hero. */
export const CTA_SECONDARY_DARK =
  "group relative inline-flex items-center justify-center gap-2 rounded-[12px] " +
  "border border-white/25 bg-white/10 font-semibold text-white backdrop-blur-md " +
  "transition-[transform,background-color,border-color,box-shadow] duration-300 " +
  "hover:scale-[1.02] hover:border-[#8B79E6] hover:bg-white/20 active:scale-[0.98] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2";
