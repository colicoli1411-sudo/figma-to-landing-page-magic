/**
 * Background purple glow — recreates the two large blurred shadows
 * from the Figma hero ("הצללה הירו" frames) using radial gradients + blur.
 * Pure CSS, no external SVG assets needed.
 */
export function PurpleGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
    >
      {/* Top glow — behind the headline */}
      <div
        className="absolute left-1/2 top-[280px] h-[720px] w-[1900px] -translate-x-1/2 opacity-70 blur-[120px]"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(139, 121, 230, 0.55) 0%, rgba(110, 86, 207, 0.25) 35%, rgba(110, 86, 207, 0) 70%)",
        }}
      />
      {/* Bottom mirrored glow — behind the mockup. Strengthened so the mockup's
          own bottom fade-mask reveals this purple wash instead of the plain
          page background (a mask's gradient only ever affects alpha, never
          hue, so the "colour" of a fade has to come from what sits behind it). */}
      <div
        className="absolute left-1/2 top-[880px] h-[660px] w-[1900px] -translate-x-1/2 opacity-80 blur-[140px]"
        style={{
          background:
            "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(139, 121, 230, 0.6) 0%, rgba(110, 86, 207, 0.32) 40%, rgba(110, 86, 207, 0) 75%)",
        }}
      />
      {/* Mint-green counter-tone — soft Apple-style accent paired with the dominant
          violet. Sits bottom-left of the mockup band so it reads mint on the
          bottom/left, violet on the right. */}
      <div
        className="absolute left-[4%] top-[560px] h-[720px] w-[980px] opacity-90 blur-[120px]"
        style={{
          background:
            "radial-gradient(ellipse 48% 48% at 28% 62%, rgba(135, 212, 196, 0.30) 0%, rgba(135, 212, 196, 0) 62%)",
        }}
      />
      {/* Faint mint rim along the bottom of the headline glow band — adds cool depth. */}
      <div
        className="absolute left-1/2 top-[740px] h-[300px] w-[1400px] -translate-x-1/2 opacity-60 blur-[120px]"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 45% 100%, rgba(135, 212, 196, 0.24) 0%, rgba(135, 212, 196, 0) 70%)",
        }}
      />
    </div>
  );
}
