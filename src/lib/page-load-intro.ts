// Coordinates the one-time page-load intro (the PageLoader overlay) with the
// Hero entrance so the bracket → wordmark → hero motion reads as one continuous
// sequence. All state is eager and module-scoped so it is settled before any
// component effect runs: Hero's `useLayoutEffect` fires before PageLoader's
// passive effect, so an effect-based handshake would race.

/** Overlay begins fading out → the site emerges. Hero should start here. */
export const INTRO_REVEAL_MS = 3700;
/** Overlay is fully gone → PageLoader unmounts. */
export const INTRO_TOTAL_MS = 4900;

const isBrowser = typeof window !== "undefined";

// The intro plays exactly once per full document load. True on the first client
// render; flipped to false once the reveal fires (or immediately when there is
// no intro to play, e.g. SPA navigation).
let introActive = isBrowser;

let resolveReveal: (() => void) | null = null;
const revealPromise: Promise<void> = isBrowser
  ? new Promise<void>((resolve) => {
      resolveReveal = resolve;
    })
  : Promise.resolve();

/** Whether the load intro is still scheduled to play this document load. */
export function isIntroActive(): boolean {
  return introActive;
}

/**
 * Resolves when the loader begins revealing the site — or immediately when no
 * intro is playing (SPA navigation / SSR). The Hero awaits this to time its
 * entrance to the reveal.
 */
export function whenIntroReveals(): Promise<void> {
  return revealPromise;
}

/**
 * Signals that the reveal has begun. Called by PageLoader at INTRO_REVEAL_MS —
 * and immediately under reduced-motion or when the loader decides not to play —
 * so the Hero can never hang in its hidden from-state.
 */
export function revealIntro(): void {
  introActive = false;
  resolveReveal?.();
  resolveReveal = null;
}
