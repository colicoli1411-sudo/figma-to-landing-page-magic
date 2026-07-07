// Component ported from https://codepen.io/JuanFuentes/full/rgXKGQ
import { useEffect, useRef, useState, useMemo, useCallback } from "react";

const dist = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance, maxDist, minVal, maxVal) => {
  const val = maxVal - Math.abs((maxVal * distance) / maxDist);
  return Math.max(minVal, val + minVal);
};

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const TextPressure = ({
  text = "Compressa",
  fontFamily = "Compressa VF",
  fontUrl = "https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2",

  width = true,
  weight = true,
  italic = true,
  alpha = false,

  flex = true,
  stroke = false,
  scale = false,

  textColor = "#FFFFFF",
  strokeColor = "#FF0000",
  className = "",

  minFontSize = 24,

  // Touch devices only: the user's scroll drives the invisible "cursor"
  // across the title, so the wave moves exactly in step with their gesture
  // and rests static the moment scrolling stops. Desktop keeps the mouse.
  scrollDrive = false,
}) => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const spansRef = useRef([]);

  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });

  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);

  const chars = text.split("");

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(hover: none)").matches;

    const handleMouseMove = (e) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const handleTouchMove = (e) => {
      const t = e.touches[0];
      cursorRef.current.x = t.clientX;
      cursorRef.current.y = t.clientY;
    };
    // Scroll drive (touch only): map the title's progress through the
    // viewport to a horizontal cursor position along the title, so the wave
    // travels with the user's scroll and rests wherever they stop. The rAF
    // loop's easing + settled guard turn this into smooth motion that
    // freezes static at rest.
    const handleScroll = () => {
      const title = titleRef.current;
      if (!title) return;
      const rect = title.getBoundingClientRect();
      const raw = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const p = Math.min(1, Math.max(0, raw));
      // The title sits at the end of the page, so its reachable progress
      // range is roughly 0–0.65 — gain up so a natural scroll-in covers the
      // full width of the wordmark.
      const gained = Math.min(1, Math.max(0, (p - 0.1) * 1.8));
      cursorRef.current.x = rect.left + gained * rect.width;
      cursorRef.current.y = rect.top + rect.height / 2;
    };

    const useScrollDrive = scrollDrive && isTouchDevice;

    window.addEventListener("mousemove", handleMouseMove);
    // With scroll-drive active the finger's touchmove would fight the scroll
    // handler over the cursor and jitter — scroll is the sole touch driver.
    if (!useScrollDrive) {
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
    }
    if (useScrollDrive) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
    }

    if (containerRef.current) {
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + width / 2;
      mouseRef.current.y = top + height / 2;
      if (!useScrollDrive) {
        cursorRef.current.x = mouseRef.current.x;
        cursorRef.current.y = mouseRef.current.y;
      }
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollDrive]);

  const setSize = useCallback(() => {
    if (!containerRef.current || !titleRef.current) return;

    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();

    let newFontSize = containerW / (chars.length / 2);
    newFontSize = Math.max(newFontSize, minFontSize);

    setFontSize(newFontSize);
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      if (!titleRef.current) return;
      const textRect = titleRef.current.getBoundingClientRect();

      if (scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }
    });
  }, [chars.length, minFontSize, scale]);

  useEffect(() => {
    const debouncedSetSize = debounce(setSize, 100);
    debouncedSetSize();
    window.addEventListener("resize", debouncedSetSize);
    return () => window.removeEventListener("resize", debouncedSetSize);
  }, [setSize]);

  useEffect(() => {
    // The per-frame loop reflows (font-variation width changes glyph metrics),
    // so it only runs while the wordmark is actually on screen, and not at all
    // for users preferring reduced motion.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let rafId = null;
    const animate = () => {
      const prevX = mouseRef.current.x;
      const prevY = mouseRef.current.y;
      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

      // Skip the expensive span pass while the smoothed cursor is at rest.
      const settled =
        Math.abs(mouseRef.current.x - prevX) < 0.1 && Math.abs(mouseRef.current.y - prevY) < 0.1;

      if (titleRef.current && !settled) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = titleRect.width / 2;

        spansRef.current.forEach((span) => {
          if (!span) return;

          const rect = span.getBoundingClientRect();
          const charCenter = {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
          };

          const d = dist(mouseRef.current, charCenter);

          const wdth = width ? Math.floor(getAttr(d, maxDist, 60, 200)) : 100;
          const wght = weight ? Math.floor(getAttr(d, maxDist, 300, 900)) : 400;
          const italVal = italic ? getAttr(d, maxDist, 0, 1).toFixed(2) : 0;
          const alphaVal = alpha ? getAttr(d, maxDist, 0, 1).toFixed(2) : 1;

          const newFontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;

          if (span.style.fontVariationSettings !== newFontVariationSettings) {
            span.style.fontVariationSettings = newFontVariationSettings;
          }
          if (alpha && span.style.opacity !== alphaVal) {
            span.style.opacity = alphaVal;
          }
        });
      }

      rafId = requestAnimationFrame(animate);
    };

    // Run the loop only while the wordmark is in the viewport.
    const container = containerRef.current;
    let observer = null;
    if (container && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          if (rafId == null) rafId = requestAnimationFrame(animate);
        } else if (rafId != null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
      observer.observe(container);
    } else {
      rafId = requestAnimationFrame(animate);
    }

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [width, weight, italic, alpha]);

  const styleElement = useMemo(
    () => (
      <style>{`
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}');
          font-style: normal;
        }

        .tp-flex {
          display: flex;
          justify-content: space-between;
        }

        .tp-stroke span {
          position: relative;
          color: ${textColor};
        }
        .tp-stroke span::after {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          color: transparent;
          z-index: -1;
          -webkit-text-stroke-width: 3px;
          -webkit-text-stroke-color: ${strokeColor};
        }

        .text-pressure-title {
          color: ${textColor};
        }
      `}</style>
    ),
    [fontFamily, fontUrl, textColor, strokeColor],
  );

  const dynamicClassName = [
    "text-pressure-title",
    className,
    flex ? "tp-flex" : "",
    stroke ? "tp-stroke" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {styleElement}

      <h1
        ref={titleRef}
        className={dynamicClassName}
        style={{
          fontFamily,
          textTransform: "uppercase",
          fontSize: fontSize,
          lineHeight,
          transform: `scale(1, ${scaleY})`,
          transformOrigin: "left top",
          margin: 0,
          textAlign: "left",
          userSelect: "none",
          whiteSpace: "nowrap",
          fontWeight: 100,
          width: "100%",
          color: stroke ? undefined : textColor,
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={(el) => (spansRef.current[i] = el)}
            data-char={char}
            style={{
              display: "inline-block",
              color: stroke ? undefined : textColor,
            }}
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default TextPressure;
