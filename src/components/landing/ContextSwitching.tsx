import { useEffect, useRef, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import { motion, useAnimationControls, useInView, type Variants } from "framer-motion";
import {
  SlackIcon,
  GmailIcon,
  TeamsIcon,
  DiscordIcon,
  WhatsAppIcon,
  FigmaIcon,
} from "./BrandIcons";
import { SplitText } from "./SplitText";

type Ring = "inner" | "outer";

type FloatingApp = {
  id: string;
  name: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  // Desktop-only placement: which ellipse the card rides + its math-angle
  // (0° = right, counter-clockwise, y-up). See ringsFor / cardPos below.
  ring: Ring;
  angle: number;
  color: string;
  snippet: string;
  time: string;
};

/* Ordered as the chaos sequence fires (drives the entrance stagger):
   Top-Left → Top-Right → Mid-Left → Mid-Right → Bottom-Left → Bottom-Right.
   On desktop the six cards ride two concentric "orbit" ellipses centered on
   the copy: the four corner cards at mirrored diagonals on the outer ring, the
   mid pair at the horizontal extremes of the inner ring (the widest point
   where they never clip the frame). Each card is pinned to its ring by a small
   glowing anchor dot ON the line, with the card hovering just above it. */
const APPS: FloatingApp[] = [
  {
    id: "slack",
    name: "Slack",
    Icon: SlackIcon,
    ring: "outer",
    angle: 140,
    color: "#611F69",
    snippet: "Got a sec? Quick question about the API…",
    time: "now",
  },
  {
    id: "gmail",
    name: "Gmail",
    Icon: GmailIcon,
    ring: "outer",
    angle: 40,
    color: "#EA4335",
    snippet: "URGENT: Client feedback needed today",
    time: "2m",
  },
  {
    id: "teams",
    name: "Teams",
    Icon: TeamsIcon,
    ring: "inner",
    angle: 180,
    color: "#5B5FC7",
    snippet: "Design sync starting now — join?",
    time: "now",
  },
  {
    id: "discord",
    name: "Discord",
    Icon: DiscordIcon,
    ring: "inner",
    angle: 0,
    color: "#5865F2",
    snippet: "@everyone the new build is live",
    time: "5m",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    Icon: WhatsAppIcon,
    ring: "outer",
    angle: 220,
    color: "#25D366",
    snippet: "Hey! Are we still on for tonight?",
    time: "8m",
  },
  {
    id: "figma",
    name: "Figma",
    Icon: FigmaIcon,
    ring: "outer",
    angle: 320,
    color: "#F24E1E",
    snippet: "Maya left a comment on Hero v2",
    time: "12m",
  },
];

/* The two faint guide ellipses, as semi-axes in the 0–100 normalized space of
   the desktop floats frame (percent of its width / height). The anchor dots +
   cards ride these same ellipses via cardPos(), and the rendered <ellipse>
   outlines use the identical values, so lines, dots and cards stay locked
   together at any viewport aspect. Both rings share ONE aspect ratio so they
   read as a uniform concentric pair:
   - inner: hugs the centre copy — pulled in from the original 37 to rx 34 so
     the mid pair (at 180°/0°) reads as orbiting the text. Measured against
     the headline's actual glyph boxes, 34 is clear from 1280 up (verified to
     1920) but overlaps the type by ~19px at a 1024 viewport — so the narrow
     desktop band (1024–1279) keeps the original 37 (see innerRx in the
     component).
   - outer (rx 46): pushed slightly out for breathing room; the diagonal
     corner cards still clear the frame edge at a 1024px viewport. */
const RING_ASPECT = 46 / 44; // shared ry:rx — identical proportions on all rings
const INNER_RX_TIGHT = 34; // ≥1280px — close to the copy
const INNER_RX_NARROW = 37; // 1024–1279px — the pre-tighten value, glyph-safe
const OUTER_RX = 46;
const ringsFor = (innerRx: number): Record<Ring, { rx: number; ry: number }> => ({
  outer: { rx: OUTER_RX, ry: OUTER_RX * RING_ASPECT },
  inner: { rx: innerRx, ry: innerRx * RING_ASPECT },
});

/* Decorative echo rings — continue the same 12-step rhythm and aspect outward
   past the card rings, fading as they go (0.24 → 0.15 → 0.08) until they crop
   at the screen edges. Pure atmosphere: no cards, no dots. */
const DECOR_RINGS = [58, 70, 82].map((rx, i) => ({
  rx,
  ry: rx * RING_ASPECT,
  opacity: [0.24, 0.15, 0.08][i],
}));

/** Card center as left/top percentage strings of the floats frame, from its
 *  ring + angle. left = 50 + rx·cosθ, top = 50 − ry·sinθ (screen y grows
 *  downward, so sin is negated). The point lies exactly on the matching
 *  <ellipse>. Rounded to a fixed precision so the SSR and client strings match
 *  exactly (raw float stringification differs and trips React hydration). */
function cardPos(rings: Record<Ring, { rx: number; ry: number }>, ring: Ring, angle: number) {
  const { rx, ry } = rings[ring];
  const rad = (angle * Math.PI) / 180;
  return {
    left: `${(50 + rx * Math.cos(rad)).toFixed(3)}%`,
    top: `${(50 - ry * Math.sin(rad)).toFixed(3)}%`,
  };
}

/* ── Entrance choreography ─────────────────────────────────────────────────
   The section reveals in a strict sequence on every screen size:
     1. headline types in char-by-char (SplitText split mode),
     2. a short beat, then the subtitle fades up,
     3. only once the subtitle has finished do the app cards pop in,
        one after another.
   The subtitle's delay is DERIVED from the headline text + SplitText's
   defaults (40ms stagger, 0.6s per char) so the hand-off stays exact if the
   copy ever changes; the cards then wait for the subtitle's actual
   onComplete callback. */
const HEADLINE_TEXT = "Context switching is costing your team 20% of their capacity.";
// Headline char entrance — a touch quicker than SplitText's 40ms/0.6s default.
const HEADLINE_STAGGER_MS = 30; // per-char stagger (ms)
const HEADLINE_UNIT_S = 0.55; // per-char duration (s)
const HEADLINE_CHARS = HEADLINE_TEXT.replace(/\s/g, "").length;
const HEADLINE_ENTRANCE_S = (HEADLINE_CHARS - 1) * (HEADLINE_STAGGER_MS / 1000) + HEADLINE_UNIT_S;
/** Subtitle overlaps the TAIL of the headline (~80% through) instead of waiting
 *  for a full beat after it finishes. */
const SUBTITLE_DELAY_S = HEADLINE_ENTRANCE_S * 0.8;

const FLOAT_CONFIG = [
  { duration: 4, delay: 0 },
  { duration: 5.2, delay: 0.4 },
  { duration: 4.5, delay: 0.8 },
  { duration: 5.5, delay: 0.2 },
  { duration: 4.8, delay: 0.6 },
  { duration: 5, delay: 1 },
];

/* ── Animation states ──────────────────────────────────────────────────────
   hidden → cards not yet revealed (pre-scroll)
   enter  → cards fade/scale into place, staggered
   clean  → logos only, no dots, no snippets
   chaos  → notifications pop in one-by-one (staggered) with a bounce           */

const layerVariants: Variants = {
  hidden: {},
  // Pronounced one-by-one entrance (runs only after the subtitle completes —
  // see the introDone gate) with a small beat before the first card.
  enter: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
  clean: { transition: { staggerChildren: 0 } },
  chaos: { transition: { staggerChildren: 0.22, delayChildren: 0.15 } },
};

const cardVariants: Variants = {
  // Gradual entrance — keeps each card's resting position (y/scale settle to 0/1).
  hidden: { opacity: 0, scale: 0.8, y: 28 },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 22, mass: 0.9 },
  },
  clean: { y: 0, transition: { duration: 0.4, ease: "easeInOut" } },
  chaos: {
    y: [0, -10, 0], // snappy notification bounce as this card's turn arrives
    transition: { duration: 0.5, times: [0, 0.45, 1], ease: ["easeOut", "easeInOut"] },
  },
};

const dotVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  enter: { scale: 0, opacity: 0 },
  clean: { scale: 0, opacity: 0, transition: { duration: 0.3 } },
  chaos: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 700, damping: 14 } },
};

const snippetVariants: Variants = {
  hidden: { opacity: 0 },
  enter: { opacity: 0 },
  clean: { opacity: 0, transition: { duration: 0.3 } },
  chaos: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

export function ContextSwitching() {
  const sectionRef = useRef<HTMLElement | null>(null);
  // The centred copy group — the lavender wash is anchored to ITS centre, not
  // the section's, so the readable halo tracks the text (see the measure effect).
  const copyRef = useRef<HTMLDivElement | null>(null);
  // once: false so the chaos loop can pause off-screen and resume on re-entry;
  // fire early (amount 0.05) so fast scrolling doesn't outrun the entrance.
  const inView = useInView(sectionRef, { once: false, amount: 0.05 });
  const cardControls = useAnimationControls();
  // The entrance plays only once — after it, cards must NEVER return to the
  // hidden state (re-hiding on exit meant fast scrolling could catch this
  // section blank). Off-screen we only pause the chaos loop, not visibility.
  const hasEnteredRef = useRef(false);
  // Which FloatingCard layer to mount. SSR/first paint renders both (CSS
  // hides the inactive one, so hydration matches); after mount only the
  // active layer stays, dropping the hidden one's 6 backdrop-blurred,
  // infinitely-floating cards from the tree.
  const [cardLayer, setCardLayer] = useState<"both" | "desktop" | "mobile">("both");
  // Inner-ring tightness: 34 hugs the copy from 1280 up; the narrow desktop
  // band (1024–1279) keeps the glyph-safe 37 (see the ring constants above).
  // SSR/first paint assumes wide (the common case) — the cards are still
  // hidden pre-entrance, so the post-mount correction can't be seen.
  const [xlUp, setXlUp] = useState(true);
  // Gate for the cards' entrance: flips true when the subtitle's reveal
  // finishes (headline → beat → subtitle → cards). GSAP tweens keep playing
  // even if the user scrolls away mid-sequence, so this always resolves.
  const [introDone, setIntroDone] = useState(false);
  // Vertical centre of the copy group as a % of the section height, driving the
  // lavender wash's focal point. SSR/first paint = 50 (copy is section-centred
  // on desktop, where there's no mobile card grid below it to push it up), then
  // corrected on mount — on mobile the grid shifts the copy above centre.
  const [washCenterPct, setWashCenterPct] = useState(50);

  useEffect(() => {
    const section = sectionRef.current;
    const copy = copyRef.current;
    if (!section || !copy) return;
    const measure = () => {
      const s = section.getBoundingClientRect();
      if (s.height === 0) return;
      const c = copy.getBoundingClientRect();
      const centerY = c.top - s.top + c.height / 2;
      setWashCenterPct(Math.round((centerY / s.height) * 1000) / 10);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    ro.observe(copy);
    window.addEventListener("resize", measure);
    // Late font swaps reflow the copy after first measure.
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(measure);
    }
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    // Reduced motion: SplitText skips its tweens entirely, so the subtitle's
    // onComplete never fires — release the gate immediately instead of
    // leaving the cards stuck in their hidden state.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIntroDone(true);
    }
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const apply = () => setCardLayer(mql.matches ? "desktop" : "mobile");
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1280px)");
    const apply = () => setXlUp(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  const rings = ringsFor(xlUp ? INNER_RX_TIGHT : INNER_RX_NARROW);

  useEffect(() => {
    // Out of view → just stop the loop (via cleanup); cards stay visible.
    // Before introDone → hold the cards hidden until the headline + subtitle
    // sequence has fully played (introDone flips even if we scroll away).
    if (!inView || !introDone) return;
    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    (async () => {
      // Gradual staggered entrance for the floating cards (first entry only).
      // The instant the last card settles, the notifications fire straight away
      // — no clean-hold, no pause — since the entrance already leaves the cards
      // logo-only. This shortcut is for the very FIRST reveal only; every later
      // cycle keeps the calmer clean → pause → chaos rhythm of the loop below.
      if (!hasEnteredRef.current) {
        await cardControls.start("enter");
        if (cancelled) return;
        hasEnteredRef.current = true;
        await cardControls.start("chaos");
        if (cancelled) return;
        await wait(3000);
        if (cancelled) return;
      }

      // Infinite, seamless loop: clean → staggered pop-ups → pause → repeat.
      while (!cancelled) {
        // 1. Clean state — logos only.
        await cardControls.start("clean");
        if (cancelled) break;
        await wait(500);
        if (cancelled) break;

        // 2. Chaos — staggered notification pop-ups (TL → TR → ML → MR → BL → BR).
        await cardControls.start("chaos");
        if (cancelled) break;

        // 3. Hold the fully-noisy state so it can be read.
        await wait(3000);
        if (cancelled) break;
        // 4. Loop back to the clean state.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inView, introDone, cardControls]);

  return (
    <section
      ref={sectionRef}
      id="context-switching"
      className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden px-6 py-24 md:px-12"
      data-edit-section="Context switching"
      // Pauses the cards' infinite float-gentle CSS animation off-screen
      // (see [data-offscreen] rule in styles.css).
      data-offscreen={!inView ? "true" : undefined}
    >
      {/* The dotted background is a shared layer behind Hero + ContextSwitching
          (see routes/index.tsx) so the dots read as one continuous field across
          the section boundary — this section is transparent and paints over it. */}
      {/* Lavender centre — one clean, symmetric CIRCLE behind the copy. Sized
          `farthest-side` so it grows with the section to cover the whole copy
          block and bleed well past it (out toward the rings) on wide desktops,
          while staying a true round bloom. Its centre tracks the copy group
          (50% X, washCenterPct Y) so it sits on the text even when the mobile
          card grid pushes the copy up. Kept a light, airy violet (low peak
          alpha + long multi-stop falloff) so a bigger bloom still reads pale,
          and the dots stay visible around it. This is the ONLY tint — the old
          diagonal mint/violet glows are gone, so nothing pulls colour sideways. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle farthest-side at 50% ${washCenterPct}%, rgba(110,86,207,0.10) 0%, rgba(150,130,225,0.06) 45%, rgba(110,86,207,0.02) 72%, transparent 92%)`,
        }}
      />
      {/* Orbit rings (desktop) — full-section layer so the decorative echo
          rings can run past the 1400px frame to the screen edges. The fade
          mask lives on THIS wrapper (its border-box spans the whole section):
          a CSS mask clips paint outside its element's box, so masking the
          overflowing SVG directly amputated every arc beyond the frame — the
          "weird cuts". The inner div re-creates the frame's exact width, so
          the SVG's 0–100 space still matches cardPos()/the anchor dots. */}
      {cardLayer !== "mobile" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] hidden lg:block"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
        >
          <div className="relative mx-auto h-full w-full max-w-[1400px]">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              fill="none"
              style={{ overflow: "visible" }}
            >
              {DECOR_RINGS.map((ring) => (
                <ellipse
                  key={ring.rx}
                  cx="50"
                  cy="50"
                  rx={ring.rx}
                  ry={ring.ry}
                  stroke="#6E56CF"
                  strokeOpacity={ring.opacity}
                  strokeWidth={1.2}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <ellipse
                cx="50"
                cy="50"
                rx={rings.outer.rx}
                ry={rings.outer.ry}
                stroke="#6E56CF"
                strokeOpacity={0.35}
                strokeWidth={1.2}
                vectorEffect="non-scaling-stroke"
              />
              <ellipse
                cx="50"
                cy="50"
                rx={rings.inner.rx}
                ry={rings.inner.ry}
                stroke="#6E56CF"
                strokeOpacity={0.35}
                strokeWidth={1.2}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Floating notifications (desktop) — each card rides one of the two
          card rings, inside a centered max-w frame so the composition stays
          anchored on wide monitors. */}
      {cardLayer !== "mobile" && (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-0 z-[2] hidden h-full w-full max-w-[1400px] -translate-x-1/2 lg:block"
          initial="hidden"
          animate={cardControls}
          variants={layerVariants}
        >
          {APPS.map((app, i) => {
            const { left, top } = cardPos(rings, app.ring, app.angle);
            // Pin direction: the card always hangs off the line AWAY from the
            // centre copy — above its dot on the top half of the ring, below
            // it on the bottom half — so it never drifts toward the text.
            const below = Math.sin((app.angle * Math.PI) / 180) < 0;
            return (
              // 0×0 anchor point exactly ON the ring: holds the glowing anchor
              // dot (fixed) and the card "pinned" beside it, so the dot + line
              // stay visible while the card floats gently.
              <div key={app.id} className="absolute" style={{ left, top }}>
                <span
                  aria-hidden
                  className="absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6E56CF]"
                  style={{
                    boxShadow:
                      "0 0 0 5px rgba(110,86,207,0.12), 0 0 14px 2px rgba(110,86,207,0.35)",
                  }}
                />
                <div
                  className={`absolute left-0 w-[280px] xl:w-[310px] ${below ? "top-[8px]" : "bottom-[8px]"}`}
                  style={{
                    transform: "translateX(-50%) scale(0.88)",
                    transformOrigin: below ? "top center" : "bottom center",
                  }}
                >
                  <FloatingCard app={app} index={i} className="" />
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Center content — copy vertically centered in the full-height section. */}
      <div
        ref={copyRef}
        className="relative z-10 mx-auto flex max-w-[760px] flex-col items-center gap-6 text-center lg:max-w-[640px] xl:max-w-[860px]"
      >
        <SplitText
          as="h2"
          text={HEADLINE_TEXT}
          delay={HEADLINE_STAGGER_MS}
          duration={HEADLINE_UNIT_S}
          className="text-balance text-[34px] font-bold leading-[1.05] tracking-[-0.035em] text-[#1d1d23] sm:text-[44px] md:text-[52px] xl:text-[64px]"
        />

        {/* Starts only after the headline's char entrance ends (+0.2s beat);
            its onComplete releases the cards below. */}
        <SplitText
          as="p"
          text="Every time a developer is interrupted by a ping, it takes 23 minutes to recover. FocusFlow auto-mutes your team's biggest distractions so you can actually get work done."
          reveal
          revealDelay={SUBTITLE_DELAY_S}
          onComplete={() => setIntroDone(true)}
          className="max-w-[640px] text-[15px] font-light leading-relaxed tracking-[-0.01em] text-[#4b5563] sm:text-[16px] lg:max-w-[520px] xl:max-w-[640px]"
        />
      </div>

      {/* Tablet + mobile fallback — 2-up grid below lg. On phones the cards
          shrink (see FloatingCard's base vs sm: sizes) so two fit a narrow row;
          from sm they return to full size. Same choreography. */}
      {cardLayer !== "desktop" && (
        <motion.div
          className="relative z-10 mx-auto mt-12 grid w-full max-w-[440px] grid-cols-2 gap-2.5 sm:max-w-[720px] sm:gap-3 lg:hidden"
          initial="hidden"
          animate={cardControls}
          variants={layerVariants}
        >
          {APPS.map((app, i) => (
            <FloatingCard key={app.id} app={app} index={i} className="" />
          ))}
        </motion.div>
      )}
    </section>
  );
}

function FloatingCard({
  app,
  index,
  className,
}: {
  app: FloatingApp;
  index: number;
  className: string;
}) {
  const { Icon, name, id, color, snippet, time } = app;
  const cfg = FLOAT_CONFIG[index % FLOAT_CONFIG.length];
  return (
    <motion.div
      className={`floating-distraction-card pointer-events-auto flex w-full items-start gap-2 rounded-xl border border-white/40 bg-white/80 p-2.5 backdrop-blur-md sm:gap-3 sm:rounded-2xl sm:p-[14px] ${className}`}
      style={{
        boxShadow:
          "0 1px 2px rgba(16,24,40,0.04), 0 4px 12px -4px rgba(16,24,40,0.06), 0 12px 24px -8px rgba(16,24,40,0.08), 0 20px 40px -12px rgba(110,86,207,0.18), inset 0 1px 0 rgba(255,255,255,0.6)",
        animation: `float-gentle ${cfg.duration}s ease-in-out ${cfg.delay}s infinite both`,
      }}
      variants={cardVariants}
      data-edit-id={`ctx-app-${id}`}
      data-edit-label={`App: ${name}`}
    >
      <span
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl"
        style={{ backgroundColor: `${color}1a` }}
      >
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        {/* Red notification dot — hidden until the chaos phase. */}
        <motion.span
          className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 sm:h-3 sm:w-3"
          style={{ transformOrigin: "center" }}
          variants={dotVariants}
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
        <span className="flex w-full items-baseline justify-between gap-2">
          <span className="text-[13px] font-semibold leading-tight text-[#111827] sm:text-[14px]">
            {name}
          </span>
          {/* Timestamp — appears with the message during chaos. */}
          <motion.span
            className="shrink-0 text-[10px] font-medium leading-tight text-[#9ca3af] sm:text-[11px]"
            variants={snippetVariants}
          >
            {time}
          </motion.span>
        </span>
        {/* Notification message — fades in during chaos. */}
        <motion.span
          className="w-full truncate text-[11px] font-medium leading-snug text-[#6b7280] sm:text-[12px]"
          variants={snippetVariants}
        >
          {snippet}
        </motion.span>
      </span>
    </motion.div>
  );
}
