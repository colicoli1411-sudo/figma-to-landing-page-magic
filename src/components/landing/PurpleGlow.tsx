import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Background purple glow — recreates the two large blurred shadows
 * from the Figma hero ("הצללה הירו" frames) using radial gradients + blur.
 * Pure CSS, no external SVG assets needed.
 *
 * Mobile renders the same washes WITHOUT `filter: blur()`: mobile GPUs
 * rasterize huge filtered layers lazily (tile by tile), so the off-screen
 * half of each glow only painted a beat after scrolling — the gradient
 * visibly completed itself mid-scroll. A plain radial-gradient with slightly
 * wider stops paints instantly and looks the same (blurring a radial
 * gradient ≈ a wider radial gradient).
 */
export function PurpleGlow() {
  const isMobile = useIsMobile();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* Top glow — behind the headline.
          Mobile uses its own compact, viewport-relative box: the desktop
          1900px width is ~5× a 375px phone, so the fixed-px washes spilled
          far past the (much shorter) mobile hero. These smaller boxes keep
          desktop's ~1.3× viewport-width coverage proportion but stay
          centered inside the hero. */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 opacity-70 ${
          isMobile ? "top-[60px] h-[520px] w-[460px]" : "top-[280px] h-[720px] w-[1900px] blur-[120px]"
        }`}
        style={{
          background: isMobile
            ? "radial-gradient(ellipse 62% 62% at 50% 50%, rgba(139, 121, 230, 0.55) 0%, rgba(110, 86, 207, 0.25) 38%, rgba(110, 86, 207, 0) 72%)"
            : "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(139, 121, 230, 0.55) 0%, rgba(110, 86, 207, 0.25) 35%, rgba(110, 86, 207, 0) 70%)",
        }}
      />
      {/* Bottom mirrored glow — behind the mockup. Strengthened so the mockup's
          own bottom fade-mask reveals this purple wash instead of the plain
          page background (a mask's gradient only ever affects alpha, never
          hue, so the "colour" of a fade has to come from what sits behind it). */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 opacity-80 ${
          isMobile ? "top-[540px] h-[520px] w-[520px]" : "top-[880px] h-[660px] w-[1900px] blur-[140px]"
        }`}
        style={{
          background: isMobile
            ? "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(139, 121, 230, 0.6) 0%, rgba(110, 86, 207, 0.32) 42%, rgba(110, 86, 207, 0) 78%)"
            : "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(139, 121, 230, 0.6) 0%, rgba(110, 86, 207, 0.32) 40%, rgba(110, 86, 207, 0) 75%)",
        }}
      />
      {/* Mint-green counter-tone — soft Apple-style accent paired with the dominant
          violet. Sits bottom-left of the mockup band so it reads mint on the
          bottom/left, violet on the right. */}
      <div
        className={`absolute opacity-90 ${
          isMobile ? "left-[-8%] top-[600px] h-[420px] w-[360px]" : "left-[4%] top-[560px] h-[720px] w-[980px] blur-[120px]"
        }`}
        style={{
          background: isMobile
            ? "radial-gradient(ellipse 60% 60% at 28% 62%, rgba(135, 212, 196, 0.30) 0%, rgba(135, 212, 196, 0) 66%)"
            : "radial-gradient(ellipse 48% 48% at 28% 62%, rgba(135, 212, 196, 0.30) 0%, rgba(135, 212, 196, 0) 62%)",
        }}
      />
      {/* Faint mint rim along the bottom of the headline glow band — adds cool depth. */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 opacity-60 ${
          isMobile ? "top-[440px] h-[220px] w-[380px]" : "top-[740px] h-[300px] w-[1400px] blur-[120px]"
        }`}
        style={{
          background: isMobile
            ? "radial-gradient(ellipse 74% 64% at 45% 100%, rgba(135, 212, 196, 0.24) 0%, rgba(135, 212, 196, 0) 74%)"
            : "radial-gradient(ellipse 60% 50% at 45% 100%, rgba(135, 212, 196, 0.24) 0%, rgba(135, 212, 196, 0) 70%)",
        }}
      />
    </div>
  );
}
