// FocusFlow logo lockup — focus-bracket mark (violet) + cyan nucleus + Poppins wordmark.
// Drop into src/components/landing/ and use in Header.tsx in place of the inline wordmark SVG.
// Requires Poppins (already loaded site-wide).

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 104 104" fill="none" aria-hidden>
        <path d="M7 32 V19 C7 12.4 12.4 7 19 7 H32" stroke="#7C3AED" strokeWidth="11" strokeLinecap="round" />
        <path d="M72 7 H85 C91.6 7 97 12.4 97 19 V32" stroke="#7C3AED" strokeWidth="11" strokeLinecap="round" />
        <path d="M97 72 V85 C97 91.6 91.6 97 85 97 H72" stroke="#7C3AED" strokeWidth="11" strokeLinecap="round" />
        <path d="M32 97 H19 C12.4 97 7 91.6 7 85 V72" stroke="#7C3AED" strokeWidth="11" strokeLinecap="round" />
        <circle cx="52" cy="52" r="14" fill="#38BDF8" />
      </svg>
      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          fontSize: size * 0.73,
          lineHeight: 1,
          color: "#1d1d23",
        }}
      >
        Focus<span style={{ color: "#7c3aed" }}>Flow</span>
      </span>
    </span>
  );
}
