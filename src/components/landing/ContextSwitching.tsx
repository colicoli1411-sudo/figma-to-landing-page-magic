import { useEffect, useLayoutEffect, useRef } from "react";
import type { ComponentType, SVGProps } from "react";
import { motion, useAnimationControls, useInView, type Variants } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { computeMockupFinalWidth } from "@/lib/mockup-scale";
import {
  SlackIcon,
  GmailIcon,
  TeamsIcon,
  DiscordIcon,
  WhatsAppIcon,
  FigmaIcon,
} from "./BrandIcons";
import { SplitText } from "./SplitText";
import DotField from "./DotField";

gsap.registerPlugin(ScrollTrigger);

type FloatingApp = {
  id: string;
  name: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  position: string;
  color: string;
  snippet: string;
  time: string;
};

/* Ordered as the chaos sequence fires:
   Top-Left → Top-Right → Mid-Left → Mid-Right → Bottom-Left → Bottom-Right.
   Two MIRRORED columns of three flanking the centered copy — identical
   insets on both sides so the composition reads deliberate. The middle pair
   hugs the card edge (2%), clearing the headline once the card is at cover
   width; top/bottom pairs sit above/below the text band. */
const APPS: FloatingApp[] = [
  {
    id: "slack",
    name: "Slack",
    Icon: SlackIcon,
    position: "left-[5%] top-[9%]",
    color: "#611F69",
    snippet: "Got a sec? Quick question about the API…",
    time: "now",
  },
  {
    id: "gmail",
    name: "Gmail",
    Icon: GmailIcon,
    position: "right-[5%] top-[9%]",
    color: "#EA4335",
    snippet: "URGENT: Client feedback needed today",
    time: "2m",
  },
  {
    id: "teams",
    name: "Teams",
    Icon: TeamsIcon,
    position: "left-[2%] top-[45%]",
    color: "#5B5FC7",
    snippet: "Design sync starting now — join?",
    time: "now",
  },
  {
    id: "discord",
    name: "Discord",
    Icon: DiscordIcon,
    position: "right-[2%] top-[45%]",
    color: "#5865F2",
    snippet: "@everyone the new build is live",
    time: "5m",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    Icon: WhatsAppIcon,
    position: "left-[5%] bottom-[9%]",
    color: "#25D366",
    snippet: "Hey! Are we still on for tonight?",
    time: "8m",
  },
  {
    id: "figma",
    name: "Figma",
    Icon: FigmaIcon,
    position: "right-[5%] bottom-[9%]",
    color: "#F24E1E",
    snippet: "Maya left a comment on Hero v2",
    time: "12m",
  },
];

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
  enter: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
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
  const cardRef = useRef<HTMLDivElement | null>(null);
  // The card's white "skin" (bg + dot field + lavender centre). Stays fully
  // opaque through the cover; only its corner radius animates.
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  // Centered frame the floating cards anchor to. Starts inside the card's
  // entry width and stops well short of the viewport edges, so the mirrored
  // columns spread with the card but never reach the screen edge.
  const floatsFrameRef = useRef<HTMLDivElement | null>(null);
  // once: false so the chaos loop can pause off-screen and resume on re-entry;
  // fire early (amount 0.05) so fast scrolling doesn't outrun the entrance.
  const inView = useInView(sectionRef, { once: false, amount: 0.05 });
  const cardControls = useAnimationControls();
  // The entrance plays only once — after it, cards must NEVER return to the
  // hidden state (re-hiding on exit meant fast scrolling could catch this
  // section blank). Off-screen we only pause the chaos loop, not visibility.
  const hasEnteredRef = useRef(false);

  useEffect(() => {
    // Out of view → just stop the loop (via cleanup); cards stay visible.
    if (!inView) return;
    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    (async () => {
      // Gradual staggered entrance for the floating cards (first entry only).
      if (!hasEnteredRef.current) {
        await cardControls.start("enter");
        if (cancelled) return;
        hasEnteredRef.current = true;
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
  }, [inView, cardControls]);

  // The cover choreography (lg+, motion allowed only) — ONE scrubbed timeline
  // spanning from "card enters at the viewport bottom" to "card centered in
  // the viewport", deliberately minimal so the motion reads calm:
  //   1. Card width: the mockup's exact final width (shared math —
  //      lib/mockup-scale.ts) → full viewport bleed.
  //   2. Surface corners: 28px → 0 as the card reaches full bleed.
  //   3. Floats frame: spreads with the card but stops well short of the
  //      viewport edges (frameFinal) — mirrored columns stay by the text.
  //   4. Hero scrim ([data-hero-scrim]): the frozen hero — mockup and dots,
  //      size untouched — gently darkens to ~40% black, so the bright card
  //      pops over it: the "next chapter" transition.
  // scrub: 1 (not true) lets the animation catch up to the scroll over ~1s —
  // buttery instead of rigidly wheel-locked. useLayoutEffect + fromTo
  // (immediateRender) applies all from-states before first paint (no flash);
  // gsap.context scoped to the section reverts everything — including the
  // hero-side recede styles — in one call on HMR. Below lg / reduced-motion
  // the branch never runs: static white card.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    const surface = surfaceRef.current;
    const floatsFrame = floatsFrameRef.current;
    if (!section || !card || !surface || !floatsFrame) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        // Function-based so invalidateOnRefresh re-measures after resize/late
        // layout. Falls back to 960 if the hero mockup isn't in the DOM.
        const mockupWidth = () => {
          const scaleEl = document.querySelector<HTMLElement>(".hero-preview .origin-top");
          return scaleEl ? computeMockupFinalWidth(scaleEl) : 960;
        };
        // Floats frame: final width leaves ≥48px to each viewport edge and is
        // capped at ~1584px (text column + two notification columns + air),
        // so on wide screens the floats stay near the headline. Entry width
        // never exceeds the card's own entry width (no clipping).
        const frameFinal = () => Math.min(window.innerWidth - 96, 1584);
        const frameBase = () => Math.min(mockupWidth(), frameFinal());

        const heroSection = document.querySelector<HTMLElement>(
          'section[data-edit-section="Hero"]',
        );
        const heroScrim = document.querySelector<HTMLElement>("[data-hero-scrim]");

        const tl = gsap.timeline({
          defaults: { ease: "none", duration: 1 },
          scrollTrigger: {
            // Start EXACTLY at the hero pin's start ("bottom 75%" — the same
            // scroll position), so the scrim/width/corners all begin the
            // instant the mockup freezes; complete when the card is centered.
            trigger: heroSection ?? card,
            start: heroSection ? "bottom 75%" : "top bottom",
            endTrigger: card,
            end: "center center",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          card,
          { maxWidth: mockupWidth },
          { maxWidth: () => window.innerWidth },
          0,
        )
          .fromTo(surface, { borderRadius: 28 }, { borderRadius: 0 }, 0)
          .fromTo(floatsFrame, { width: frameBase }, { width: frameFinal }, 0);
        if (heroScrim) {
          // Gently darken the frozen hero (mockup + dots, size untouched) so
          // the bright card pops over it — the "next chapter" transition.
          tl.fromTo(heroScrim, { opacity: 0 }, { opacity: 0.4 }, 0);
        }

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="context-switching"
      className="relative w-full overflow-hidden bg-[#F8F9FB] px-4 py-24 sm:px-6 md:py-32 lg:z-20 lg:bg-transparent lg:px-0 lg:pt-10"
      data-edit-section="Context switching"
    >
      {/* Depth — masked tech dot-grid. Hidden on lg: the section is transparent
          there so the pinned hero shows through during the cover, and this
          inset-0 layer would slide over the frozen hero and break the effect. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(110,86,207,0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(circle at center, black 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 0%, transparent 70%)",
        }}
      />
      {/* Ambient violet + sky glows — keep the page-wide colour flow continuous
          between the Hero above and Features below. Edge-masked so the glows
          dissolve to the plain base before the section boundary (no cut line
          where overflow-hidden clips the blur). Hidden on lg for the same
          reason as the dot-grid: nothing may paint over the pinned hero. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        <div
          className="absolute -left-[10%] top-[6%] h-[620px] w-[620px] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle at 45% 45%, rgba(135,212,196,0.20) 0%, rgba(135,212,196,0.10) 40%, transparent 72%)",
            filter: "blur(120px)",
          }}
        />
        <div
          className="absolute -right-[10%] bottom-[6%] h-[640px] w-[640px] rounded-full opacity-55"
          style={{
            background:
              "radial-gradient(circle at 55% 55%, rgba(110,86,207,0.22) 0%, rgba(170,153,236,0.10) 40%, transparent 72%)",
            filter: "blur(120px)",
          }}
        />
      </div>

      {/* Bounding card — encloses the copy + floating distraction cards.
          Default max-w is 1280 (resting / reduced-motion / below-lg); on lg
          the cover timeline drives it from the mockup's exact width to full
          viewport bleed. Nearly viewport-tall on lg (min-h) with the copy
          centered vertically, so at its centered moment it fills almost the
          whole screen. The id anchors the Hero pin's endTrigger. */}
      <div
        ref={cardRef}
        id="context-cover-card"
        className="relative mx-auto flex w-full max-w-[1280px] flex-col justify-center overflow-hidden px-6 py-16 md:px-12 lg:min-h-[90vh] lg:px-20 lg:py-24"
      >
        {/* Card surface — white skin with a subtle violet-tinted border and
            the deep brand shadow, on its own layer so the cover timeline can
            animate just its corner radius. Inside: a violet dot grid across
            the whole card with a wide soft lavender ellipse over its centre —
            the dots peek out only at the margins around the content glow.
            overflow-hidden clips both to the animated rounded corners. */}
        <div
          ref={surfaceRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px] border border-[#6E56CF]/25 bg-white shadow-[0_-8px_24px_-8px_rgba(110,86,207,0.18),0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-8px_rgba(16,24,40,0.16),0_40px_80px_-24px_rgba(110,86,207,0.20)]"
        >
          {/* Dot field — the EXACT same canvas treatment as the hero and FAQ
              (DotField, radius 1.5 / spacing 14). Fixed at viewport width and
              centered (not inset-0): DotField only re-measures its parent on
              window resize, so a card-tracking parent would leave the canvas
              stuck at the card's entry width once it expands — a screen-wide
              parent stays valid at every card width and the surface clips it. */}
          <div className="absolute left-1/2 top-0 h-full w-screen -translate-x-1/2">
            <DotField
              dotRadius={1.5}
              dotSpacing={14}
              bulgeStrength={0}
              glowRadius={0}
              sparkle={false}
              waveAmplitude={0}
              cursorRadius={0}
              cursorForce={0}
              gradientFrom="#6E56CF"
              glowColor="#fcfbff"
            />
          </div>
          {/* Lavender centre — large soft circle behind the copy, big enough
              that the floating notifications sit on its visible rim; only the
              card's outer margins keep bare dots. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 90% at center, rgba(110,86,207,0.15) 0%, rgba(110,86,207,0.09) 50%, rgba(110,86,207,0.04) 75%, transparent 95%)",
            }}
          />
        </div>

        {/* Floats frame — the mirrored notification columns anchor to this
            centered frame, NOT the card: it grows with the cover but stops
            well short of the viewport edges (see frameFinal), keeping the
            floats flanking the headline instead of riding to the screen edge. */}
        <div
          ref={floatsFrameRef}
          className="pointer-events-none absolute left-1/2 top-0 z-[2] hidden h-full w-full -translate-x-1/2 lg:block"
        >
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial="hidden"
            animate={cardControls}
            variants={layerVariants}
          >
            {APPS.map((app, i) => (
              <FloatingCard
                key={app.id}
                app={app}
                index={i}
                className={`absolute ${app.position}`}
              />
            ))}
          </motion.div>
        </div>

        {/* Center content — dark copy on the white surface. */}
        <div className="relative z-10 mx-auto flex max-w-[760px] flex-col items-center gap-6 text-center lg:max-w-[600px] xl:max-w-[820px]">
          <SplitText
            as="h2"
            text="Context switching is costing your team 20% of their capacity."
            className="text-balance text-[34px] font-bold leading-[1.05] tracking-[-0.035em] text-[#1d1d23] sm:text-[44px] md:text-[52px] xl:text-[64px]"
          />

          <SplitText
            as="p"
            text="Every time a developer is interrupted by a ping, it takes 23 minutes to recover. FocusFlow auto-mutes your team's biggest distractions so you can actually get work done."
            reveal
            className="max-w-[640px] text-[15px] font-light leading-relaxed tracking-[-0.01em] text-[#6b7280] sm:text-[16px] lg:max-w-[480px] xl:max-w-[640px]"
          />
        </div>

        {/* Tablet + mobile fallback — stacked grid below lg. Same choreography.
            Single column (two on sm) — the notification layout needs the row. */}
        <motion.div
          className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden"
          initial="hidden"
          animate={cardControls}
          variants={layerVariants}
        >
          {APPS.map((app, i) => (
            <FloatingCard key={app.id} app={app} index={i} className="" />
          ))}
        </motion.div>
      </div>
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
      className={`floating-distraction-card pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-white/40 bg-white/80 p-[14px] backdrop-blur-md lg:w-[280px] xl:w-[310px] ${className}`}
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
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}1a` }}
      >
        <Icon className="h-5 w-5" />
        {/* Red notification dot — hidden until the chaos phase. */}
        <motion.span
          className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-red-500"
          style={{ transformOrigin: "center" }}
          variants={dotVariants}
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
        <span className="flex w-full items-baseline justify-between gap-2">
          <span className="text-[14px] font-semibold leading-tight text-[#111827]">{name}</span>
          {/* Timestamp — appears with the message during chaos. */}
          <motion.span
            className="shrink-0 text-[11px] font-medium leading-tight text-[#9ca3af]"
            variants={snippetVariants}
          >
            {time}
          </motion.span>
        </span>
        {/* Notification message — fades in during chaos. */}
        <motion.span
          className="w-full truncate text-[12px] font-medium leading-snug text-[#6b7280]"
          variants={snippetVariants}
        >
          {snippet}
        </motion.span>
      </span>
    </motion.div>
  );
}
