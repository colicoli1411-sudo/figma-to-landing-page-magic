import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Debounced ScrollTrigger.refresh() for lazy-loaded sections.
 *
 * Each code-split section calls this when its real content mounts (replacing
 * the Suspense min-height placeholder and changing the page height). A burst
 * of chunk arrivals coalesces into ONE refresh — scheduled on the next frame,
 * then trailing-debounced ~100ms — so trigger start/end positions are
 * recomputed exactly once after the layout settles.
 */
let timer: number | null = null;
let raf: number | null = null;

export function scheduleStRefresh() {
  if (typeof window === "undefined") return;
  if (raf !== null) cancelAnimationFrame(raf);
  if (timer !== null) window.clearTimeout(timer);
  raf = requestAnimationFrame(() => {
    raf = null;
    timer = window.setTimeout(() => {
      timer = null;
      ScrollTrigger.refresh();
    }, 100);
  });
}
