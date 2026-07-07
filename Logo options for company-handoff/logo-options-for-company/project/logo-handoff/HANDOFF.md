# FocusFlow — New Logo Handoff (for Claude Code)

Chosen mark: **"Focus Lock"** — four rounded focus brackets in brand violet `#7C3AED`
with a **cyan nucleus `#38BDF8`** (secondary brand accent) in the center.
Wordmark stays Poppins 600, two-tone: "Focus" `#1d1d23` + "Flow" `#7c3aed`.

## Files

- `logo-mark.svg` — standalone mark (brackets + cyan dot). ViewBox 0 0 104 104, scales freely.
- `favicon.svg` — favicon version: the bracket mark itself (NO background tile), heavier
  strokes + bigger nucleus for 16px legibility. **Replace `public/favicon.svg` with this file.**
- `Logo.tsx` — React lockup component (mark + wordmark).

## Integration steps

1. Copy `Logo.tsx` to `src/components/landing/Logo.tsx`.
2. In `src/components/landing/Header.tsx`, replace the inline `<svg width="138" …>` wordmark
   inside the logo `<a href="/">` with `<Logo size={30} />`.
3. Replace `public/favicon.svg` with the `favicon.svg` here.
4. The footer / any other place rendering the old wordmark SVG should reuse `<Logo />`.

## Brand constants

- Violet (primary): `#7C3AED` (light variant `#956DF7`)
- Cyan (nucleus / secondary accent): `#38BDF8`
- Text: `#1d1d23` · Background: `#f8f9fb`
- Font: Poppins 600, letter-spacing -0.02em

## Site loading animation (intro loader)

A full reference implementation lives in the design file
**"FocusFlow Loading Animation.dc.html"** (same project) — port the CSS keyframes
and timings from there. Sequence (~3.9s total, all CSS, no JS timeline):

1. **0–1.6s** — mark fades in centered on `#fafbfd`; brackets "hunt focus"
   (scale 1.10 → 0.92 → 1.05 → 1) while the cyan nucleus pulses.
2. **1.55s** — the four brackets fly out to the viewport corners and fade
   (`cubic-bezier(0.65,0,0.35,1)`, 0.7s).
3. **1.55s** — the cyan dot bursts (scale ×9, fade out) and the **FocusFlow**
   wordmark resolves in its place from blur (`blur(16px)→0`, scale 0.9→1).
4. **3.1s** — wordmark drifts up + fades; overlay fades out; the page underneath
   sharpens from `blur(14px)` to crisp (rack-focus, matches the hero entrance).

Respect `prefers-reduced-motion: reduce` — skip straight to the loaded page.
