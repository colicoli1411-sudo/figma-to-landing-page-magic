import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { SplitText } from "./SplitText";

type Testimonial = {
  stars: number;
  metricLabel: string;
  metricValue: string;
  quote: string;
  name: string;
  role: string;
  avatar: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    stars: 5,
    metricLabel: "Hours saved per month",
    metricValue: "142",
    quote:
      "\"FocusFlow gave our developers real uninterrupted blocks again. We stopped treating every Slack ping like an emergency. It's the highest-leverage tool we've adopted this year.\"",
    name: "Amit Cohen",
    role: "CTO at StackPilot",
    avatar: "https://i.pravatar.cc/150?u=amit",
  },
  {
    stars: 5,
    metricLabel: "Less context switching",
    metricValue: "41%",
    quote:
      "\"Our sprint flow became calmer. Fewer context switches, fewer random calls, and much better deep work habits across the entire R&D department.\"",
    name: "Yonatan Levi",
    role: "Engineering Manager, DevLayer",
    avatar: "https://i.pravatar.cc/150?u=yonatan",
  },
  {
    stars: 5,
    metricLabel: "Weekly focus time",
    metricValue: "+8.5h",
    quote:
      "\"The biggest win was team visibility. Everyone knows who is in focus mode, without awkward status updates. It builds stronger boundaries naturally.\"",
    name: "Daniel Reed",
    role: "VP Engineering, CloudNest",
    avatar: "https://i.pravatar.cc/150?u=daniel",
  },
  {
    stars: 5,
    metricLabel: "More predictable focus blocks",
    metricValue: "2×",
    quote:
      "\"FocusFlow helped us protect maker time without disconnecting the team. Urgent things still get through, but everything else waits its turn.\"",
    name: "Michael Stern",
    role: "Product Lead, Northbase",
    avatar: "https://i.pravatar.cc/150?u=michael",
  },
  {
    stars: 5,
    metricLabel: "Faster delivery cycles",
    metricValue: "27%",
    quote:
      "\"Before FocusFlow, our team was always online but rarely focused. Now focus time is part of the company rhythm and our roadmap actually moves.\"",
    name: "Adam Brooks",
    role: "Startup Founder, LaunchGrid",
    avatar: "https://i.pravatar.cc/150?u=adam",
  },
  {
    stars: 5,
    metricLabel: "Protected weekly focus",
    metricValue: "18h",
    quote:
      "\"I like that it does not feel like surveillance. It feels like a shared agreement to respect people's focus and trust them with their own time.\"",
    name: "Eli Morgan",
    role: "DevOps Lead, InfraForge",
    avatar: "https://i.pravatar.cc/150?u=eli-morgan",
  },
  {
    stars: 5,
    metricLabel: "Deep work sessions",
    metricValue: "3×",
    quote:
      "\"Our designers finally have space to think. FocusFlow turned focus time into a real team ritual instead of a personal struggle.\"",
    name: "Noa Bar",
    role: "Design Director, PixelForge",
    avatar: "https://i.pravatar.cc/150?u=noa",
  },
  {
    stars: 5,
    metricLabel: "Meetings reduced",
    metricValue: "32%",
    quote:
      "\"We cut a third of our meetings just by making focus blocks visible. People trust the calendar again and async actually works.\"",
    name: "Ravi Patel",
    role: "Head of Product, NimbusOps",
    avatar: "https://i.pravatar.cc/150?u=ravi",
  },
  {
    stars: 5,
    metricLabel: "Head-down coding time",
    metricValue: "+12h",
    quote:
      "\"My team gets a full extra day of real engineering work every week. FocusFlow made deep work the default, not the exception.\"",
    name: "Sara Klein",
    role: "Staff Engineer, ByteHarbor",
    avatar: "https://i.pravatar.cc/150?u=sara",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          className="w-4 h-4 text-neutral-900"
          fill="currentColor"
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ t, isActive }: { t: Testimonial; isActive?: boolean }) {
  return (
    <article
      tabIndex={0}
      className={`glow-card relative flex flex-col justify-between w-full h-full p-8 rounded-[32px] overflow-hidden backdrop-blur-xl transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 ${
        isActive
          ? "bg-white/55 shadow-[0_28px_70px_-24px_rgba(110,86,207,0.45),0_10px_30px_-16px_rgba(30,27,75,0.18)]"
          : "bg-white/40 border border-white shadow-[0_8px_32px_rgba(0,10,30,0.04)]"
      }`}
    >
      {isActive && (
        <>
          {/* Aurora bloom — soft lavender light radiating from the top, fading into a gentle diagonal wash */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[32px]"
            style={{
              background:
                "radial-gradient(120% 85% at 50% -12%, rgba(215,207,249,0.55) 0%, rgba(237,233,254,0.30) 34%, rgba(255,255,255,0) 68%), linear-gradient(135deg, rgba(245,243,255,0.65) 0%, rgba(237,233,254,0.32) 46%, rgba(224,231,255,0.48) 100%)",
            }}
          />
          {/* Rotating conic glow border — same clockwise sweep as the ROI card,
              rendered as a masked ring so it reads on the translucent card. */}
          <div
            aria-hidden
            className="glow-border-ring pointer-events-none absolute inset-0 rounded-[32px]"
          />
          {/* Top sheen — a thin glint of light along the upper edge */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-px h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)",
            }}
          />
        </>
      )}

      <div className="relative z-10">
        <Stars count={t.stars} />
        <p className="text-xs font-medium text-neutral-500 mt-6 mb-1">
          {t.metricLabel}
        </p>
        <p className="text-4xl font-bold text-neutral-900 tracking-tight mb-4">
          {t.metricValue}
        </p>
        <p className="text-sm text-neutral-600 leading-relaxed mb-8">
          {t.quote}
        </p>
      </div>
      <div className="relative z-10 flex items-center gap-3">
        <img
          src={t.avatar}
          alt={t.name}
          loading="lazy"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-bold text-neutral-900">{t.name}</p>
          <p className="text-xs text-neutral-500">{t.role}</p>
        </div>
      </div>
    </article>
  );
}

// Duration of the post-drag "glide to center". Must match the Tailwind
// duration used for the settling cards below (duration-[900ms]).
const SETTLE_MS = 900;

function CurvedCarousel({
  items,
  autoplay = true,
  autoplayInterval = 4500,
}: {
  items: Testimonial[];
  autoplay?: boolean;
  autoplayInterval?: number;
}) {
  const [active, setActive] = useState(Math.floor(items.length / 2));
  const [cardW, setCardW] = useState(340);
  const [paused, setPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  // True during the post-drag glide, so only that settle gets the pronounced
  // easing (autoplay / arrow nav keep a calmer transition).
  const [isSettling, setIsSettling] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    lastX: number;
    pointerId: number;
    locked: boolean;
    axis: "x" | "y" | null;
  } | null>(null);
  // Tracks the queued end-of-drag "glide to center" so it can be cancelled.
  const settleRaf = useRef<number | null>(null);
  // Clears the isSettling flag once the glide finishes (matches SETTLE_MS).
  const settleTimer = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) setCardW(260);
      else if (w < 768) setCardW(300);
      else if (w < 1280) setCardW(330);
      else setCardW(360);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Detect RTL from the rendered container (respects dir attribute anywhere up the tree)
  useEffect(() => {
    const detect = () => {
      const el = containerRef.current;
      if (!el) return;
      const dir = getComputedStyle(el).direction;
      setIsRTL(dir === "rtl");
    };
    detect();
    const obs = new MutationObserver(detect);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["dir", "lang"] });
    window.addEventListener("resize", detect);
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", detect);
    };
  }, []);

  const dirSign = isRTL ? -1 : 1;

  const go = useCallback(
    (dir: number) => {
      setActive((prev) => (prev + dir + items.length) % items.length);
    },
    [items.length],
  );

  const startAutoPlay = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!autoplay || paused || isDragging) return;
    timerRef.current = window.setInterval(() => go(1), autoplayInterval);
  }, [autoplay, paused, isDragging, autoplayInterval, go]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);


  // Autoplay
  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  // Cancel a queued end-of-drag glide on unmount
  useEffect(() => {
    return () => {
      if (settleRaf.current != null) cancelAnimationFrame(settleRaf.current);
      if (settleTimer.current != null) window.clearTimeout(settleTimer.current);
    };
  }, []);

  // Pause when tab hidden
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Keyboard nav (logical, respects RTL: ArrowRight always = next-in-reading-order)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(isRTL ? 1 : -1);
      else if (e.key === "ArrowRight") go(isRTL ? -1 : 1);
    };
    const el = containerRef.current;
    el?.addEventListener("keydown", onKey);
    return () => el?.removeEventListener("keydown", onKey);
  }, [go, isRTL]);

  const spacing = cardW * 0.78;
  const cardH = Math.round(cardW * 1.35);

  const calculateNearestIndex = useCallback(() => {
    const s = dragState.current;
    if (!s || s.axis !== "x") return active;
    const rawDx = s.lastX - s.startX;
    // Mirror the same dragOffset formula used in onPointerMove
    const currentDragOffset = dirSign * Math.max(-spacing * 2, Math.min(spacing * 2, -rawDx));
    const n = items.length;
    let minAbs = Infinity;
    let nearestIdx = active;
    for (let i = 0; i < n; i++) {
      let offset = i - active;
      if (offset > n / 2) offset -= n;
      if (offset < -n / 2) offset += n;
      const fractional = Math.abs(offset - currentDragOffset / spacing);
      if (fractional < minAbs) {
        minAbs = fractional;
        nearestIdx = i;
      }
    }
    return nearestIdx;
  }, [active, dirSign, spacing, items.length]);

  const onPointerDown = (e: React.PointerEvent) => {
    // Interrupt any in-flight settle glide when a new drag begins.
    if (settleRaf.current != null) {
      cancelAnimationFrame(settleRaf.current);
      settleRaf.current = null;
    }
    if (settleTimer.current != null) {
      window.clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
    setIsSettling(false);
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      pointerId: e.pointerId,
      locked: false,
      axis: null,
    };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = dragState.current;
    if (!s) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;

    // Decide gesture axis after a small threshold so we don't hijack vertical scroll
    if (!s.axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      s.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (s.axis === "x") {
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        setIsDragging(true);
        stopAutoPlay();
      }
    }
    if (s.axis !== "x") return;
    s.lastX = e.clientX;
    // Soft clamp so it can't fly off. Cards follow the finger.
    const clamped = Math.max(-spacing * 2, Math.min(spacing * 2, -dx));
    setDragOffset(dirSign * clamped);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = dragState.current;
    if (!s || s.axis !== "x") {
      dragState.current = null;
      setIsDragging(false);
      setDragOffset(0);
      return;
    }
    const newIndex = calculateNearestIndex();
    dragState.current = null;
    (e.currentTarget as Element).releasePointerCapture?.(s.pointerId);
    // Re-enable transitions but hold the finger position for one frame, then
    // move to the centered layout on the next frame — this guarantees the
    // transform change is animated (an eased glide to center) instead of
    // snapping instantly.
    setIsDragging(false);
    // Mark the settle so only this glide gets the pronounced overshoot easing.
    setIsSettling(true);
    if (settleTimer.current != null) window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      settleTimer.current = null;
      setIsSettling(false);
    }, SETTLE_MS);
    if (settleRaf.current != null) cancelAnimationFrame(settleRaf.current);
    settleRaf.current = requestAnimationFrame(() => {
      settleRaf.current = requestAnimationFrame(() => {
        settleRaf.current = null;
        setActive(newIndex);
        setDragOffset(0);
        startAutoPlay();
      });
    });
  };

  return (
    <div
      className="relative w-full"
      style={{ perspective: "1600px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={containerRef}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative mx-auto w-full select-none cursor-grab active:cursor-grabbing outline-none"
        style={{
          height: cardH + 40,
          transformStyle: "preserve-3d",
          touchAction: "pan-y",
        }}
        aria-roledescription="carousel"
      >
        {items.map((t, i) => {
          // Shortest signed distance with wrap-around
          const n = items.length;
          let offset = i - active;
          if (offset > n / 2) offset -= n;
          if (offset < -n / 2) offset += n;
          // Smooth fractional offset while dragging
          const fractional = offset - dragOffset / spacing;
          const abs = Math.abs(fractional);
          const isCenter = Math.abs(offset) === 0;
          const translateX = dirSign * fractional * spacing;
          const translateZ = -abs * 180;
          const rotateY = dirSign * fractional * -18;
          const scaleVal =
            abs < 1 ? 1 - abs * 0.08 : abs < 2 ? 0.92 - (abs - 1) * 0.12 : 0.8;
          const opacityVal =
            abs > 3.2 ? 0 : abs < 1 ? 1 - abs * 0.25 : abs < 2 ? 0.75 - (abs - 1) * 0.35 : Math.max(0, 0.4 - (abs - 2) * 0.2);
          // On narrow screens the peeking neighbours crowd the small viewport —
          // fade them harder so the centre card clearly owns the stage.
          const sideDim = cardW <= 300 && !isCenter ? 0.5 : 1;
          const z = 100 - Math.round(abs);
          const blurPx = isDragging ? 0 : abs * 0.5;

          return (
            <div
              key={t.name}
              onClick={() => !isCenter && !isDragging && setActive(i)}
              className={`absolute top-0 left-1/2 ${
                isDragging
                  ? ""
                  : isSettling
                    ? "transition-all duration-[900ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    : "transition-all duration-500 ease-out"
              }`}
              style={{
                width: cardW,
                height: cardH,
                marginLeft: -cardW / 2,
                transform: `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scaleVal})`,
                opacity: opacityVal * sideDim,
                zIndex: z,
                pointerEvents: abs > 3 ? "none" : "auto",
                cursor: isCenter ? "grab" : "pointer",
                filter: isCenter && !isDragging ? "none" : `blur(${blurPx}px) grayscale(${isCenter ? 0 : 1})`,
              }}
              aria-hidden={!isCenter}
            >
              <TestimonialCard t={t} isActive={isCenter} />
            </div>
          );
        })}
      </div>


      {/* Controls */}
      <div className="mt-10 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => go(isRTL ? 1 : -1)}
          aria-label="Previous testimonial"
          className="grid place-items-center w-8 h-8 rounded-full text-neutral-400 transition-colors duration-300 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <div className="flex items-center">
          {items.map((_, i) => (
            // Button = comfortable touch target; inner span = the tiny visual dot.
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className="group flex h-8 items-center px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60"
            >
              <span
                className={`h-1 rounded-full transition-all duration-300 ease-out ${
                  i === active
                    ? "w-5 bg-violet-500/80"
                    : "w-1 bg-neutral-300/70 group-hover:bg-neutral-400/80"
                }`}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(isRTL ? -1 : 1)}
          aria-label="Next testimonial"
          className="grid place-items-center w-8 h-8 rounded-full text-neutral-400 transition-colors duration-300 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      // relative z-[45] lifts the carousel above the site-wide bottom gradual-blur
      // band (z-40) so the focal testimonial cards stay crisp; still below the
      // header (z-50). The ambient bottom-blur keeps working on other sections.
      className="relative z-[45] w-full py-24 md:py-32 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top, rgba(110, 86, 207, 0.14) 0%, rgba(135, 212, 196, 0.12) 42%, #F8F9FB 78%)",
      }}
    >
      {/* Flex centering + gap (not margins) — SplitText hard-resets its own
          margin, which silently kills mx-auto / mt-* on the children. */}
      <div className="max-w-6xl mx-auto px-6 text-center mb-14 md:mb-20 flex flex-col items-center gap-5">
        <SplitText
          as="h2"
          reveal
          className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900"
        >
          What{" "}
          <span className="italic font-serif font-normal text-violet-700">
            teams
          </span>{" "}
          say about FocusFlow
        </SplitText>
        <SplitText
          as="p"
          reveal
          revealDelay={0.12}
          className="text-base md:text-lg text-neutral-600 max-w-2xl"
        >
          See how real engineering teams use FocusFlow to stay consistent,
          protect their time, and ship faster.
        </SplitText>
      </div>

      <SplitText as="div" reveal revealDelay={0.24} className="w-full px-4 md:px-6">
        <CurvedCarousel items={TESTIMONIALS} />
      </SplitText>
    </section>
  );
}

export default TestimonialsSection;
