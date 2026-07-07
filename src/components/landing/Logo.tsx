// FocusFlow logo lockup — "Focus Lock" mark (violet focus brackets + lighter
// violet nucleus) followed by the Poppins two-tone wordmark. From the brand handoff;
// extended with color props so it also reads on dark backgrounds (footer).
// Requires Poppins (already loaded site-wide).

const VIOLET = "#6E56CF";
// Lighter brand violet (violet-500) for the nucleus so it reads as a distinct
// focal point against the darker brackets — and stays visible on both the
// light header and the dark footer.
const NUCLEUS = "#8B79E6";

export function Logo({
  size = 30,
  focusColor = "#1d1d23",
  flowColor = "#6E56CF",
}: {
  size?: number;
  /** Color of the "Focus" half of the wordmark. */
  focusColor?: string;
  /** Color of the "Flow" half of the wordmark. */
  flowColor?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 104 104" fill="none" aria-hidden>
        <path d="M7 32 V19 C7 12.4 12.4 7 19 7 H32" stroke={VIOLET} strokeWidth="11" strokeLinecap="round" />
        <path d="M72 7 H85 C91.6 7 97 12.4 97 19 V32" stroke={VIOLET} strokeWidth="11" strokeLinecap="round" />
        <path d="M97 72 V85 C97 91.6 91.6 97 85 97 H72" stroke={VIOLET} strokeWidth="11" strokeLinecap="round" />
        <path d="M32 97 H19 C12.4 97 7 91.6 7 85 V72" stroke={VIOLET} strokeWidth="11" strokeLinecap="round" />
        <circle cx="52" cy="52" r="14" fill={NUCLEUS} />
      </svg>
      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          fontSize: size * 0.73,
          lineHeight: 1,
          color: focusColor,
          whiteSpace: "nowrap",
        }}
      >
        Focus<span style={{ color: flowColor }}>Flow</span>
      </span>
    </span>
  );
}
