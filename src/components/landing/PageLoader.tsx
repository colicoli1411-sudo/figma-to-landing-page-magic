import { useEffect, useState } from "react";
import { INTRO_REVEAL_MS, INTRO_TOTAL_MS, revealIntro } from "@/lib/page-load-intro";
import "./PageLoader.css";

/**
 * Full-screen page-load intro overlay. The FocusFlow wordmark appears as a
 * stroke-only outline, then its brand-coloured fill rises bottom-to-top with a
 * gentle wave crest, the word takes a small settling breath, and finally zooms
 * out as the overlay fades to reveal the untouched site — with the Hero
 * entrance timed to play into the reveal (see `@/lib/page-load-intro`).
 * Pure-CSS animation; this component only schedules the reveal hand-off and
 * unmounts itself when the run finishes.
 */

// Plays exactly once per full document load; flipped after the first run so a
// client-side navigation back to the landing page doesn't replay it.
let hasPlayed = false;

export function PageLoader() {
  // Initial render must match SSR (overlay present) on the first load; on a
  // later SPA remount `hasPlayed` is already true → render nothing (no flash).
  const [done, setDone] = useState(() => hasPlayed);

  useEffect(() => {
    if (done) return;
    hasPlayed = true;

    // Lock scroll while the overlay is up; restore exactly what was there.
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    const restore = () => {
      body.style.overflow = prevOverflow;
    };

    // Reduced motion: the loader's CSS animations are disabled, so don't sit on
    // an opaque overlay — reveal immediately and drop it.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      revealIntro();
      restore();
      setDone(true);
      return;
    }

    const revealTimer = window.setTimeout(revealIntro, INTRO_REVEAL_MS);
    const doneTimer = window.setTimeout(() => {
      restore();
      setDone(true);
    }, INTRO_TOTAL_MS);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(doneTimer);
      restore();
    };
  }, [done]);

  if (done) return null;

  return (
    <div className="ldr-overlay" aria-hidden="true">
      {/* Two stacked copies of the word: a stroke-only outline below, and the
          brand-coloured fill above it, revealed bottom→top by a wavy mask. */}
      <div className="ldr-word-wrap">
        <span className="ldr-word">
          <span className="ldr-word-outline">
            Focus<span className="ldr-word-accent">Flow</span>
          </span>
          <span className="ldr-word-fill">
            Focus<span className="ldr-word-accent">Flow</span>
          </span>
        </span>
      </div>
    </div>
  );
}
