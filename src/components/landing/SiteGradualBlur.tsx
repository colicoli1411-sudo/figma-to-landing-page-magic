import { useEffect, useState } from "react";
import GradualBlur from "./GradualBlur";

/**
 * Site-wide gradual blur: a fixed, progressively-blurred band pinned to the
 * bottom edge of the viewport across the whole page (React Bits GradualBlur,
 * page target). It fades out as the footer approaches so the footer itself is
 * never blurred — the effect "ends" right at the start of the footer.
 *
 * Requires an element with id="site-footer" wrapping the footer.
 */
export function SiteGradualBlur() {
  const [nearFooter, setNearFooter] = useState(false);

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setNearFooter(entry.isIntersecting),
      // Grow the viewport's bottom edge so the blur begins fading a little
      // before the footer actually scrolls up into the blurred band, keeping
      // the footer crisp.
      { root: null, rootMargin: "0px 0px 160px 0px", threshold: 0 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <GradualBlur
      target="page"
      position="bottom"
      height="6rem"
      strength={1.5}
      divCount={6}
      curve="bezier"
      opacity={1}
      zIndex={40}
      style={{
        opacity: nearFooter ? 0 : 1,
        transition: "opacity 0.5s ease-out",
      }}
    />
  );
}
