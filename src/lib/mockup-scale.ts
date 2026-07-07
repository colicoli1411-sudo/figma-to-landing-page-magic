/**
 * The hero mockup's scroll-grow target scale — shared between Hero.tsx (the
 * grow tween itself) and ContextSwitching.tsx (the white cover card starts at
 * exactly the mockup's final rendered width, so it emerges matching it).
 *
 * The unit (dashboard + floating cards) grows until it fills the viewport,
 * sized from the cards' real extent so they're never clipped, hard-capped so
 * the dashboard itself never exceeds ~75% of the viewport width.
 */
export function computeMockupTargetScale(scaleEl: HTMLElement): number {
  const margin = 28; // breathing room kept on each side
  const center = scaleEl.offsetWidth / 2;
  // Widest distance from the dashboard centre to any edge, including the
  // floating cards' own width + overhang on each side.
  let halfExtent = center;
  scaleEl.querySelectorAll('[data-edit-id^="float-"]').forEach((c) => {
    const el = c as HTMLElement;
    halfExtent = Math.max(
      halfExtent,
      center - el.offsetLeft,
      el.offsetLeft + el.offsetWidth - center,
    );
  });
  // clientWidth excludes the scrollbar, so the unit stays centred.
  const vw = document.documentElement.clientWidth;
  const floatingSafe = (vw / 2 - margin) / halfExtent;
  // Hard cap: the dashboard itself never grows past ~75% of the viewport
  // width, so the expand stops at the target size.
  const maxByDashboard = (vw * 0.75) / scaleEl.offsetWidth;
  return Math.min(floatingSafe, maxByDashboard);
}

/** The mockup's final on-screen width (px) once the scroll-grow completes. */
export function computeMockupFinalWidth(scaleEl: HTMLElement): number {
  return scaleEl.offsetWidth * computeMockupTargetScale(scaleEl);
}
