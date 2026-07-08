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

gsap.registerPlugin(ScrollTrigger);

type FloatingApp = {
  id: string;
  name: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  position: string;
  color: string;
  snippet: string;
};

/* Ordered as the chaos sequence fires:
   Top-Left → Top-Right → Mid-Left → Mid-Right → Bottom-Left → Bottom-Right. */
const APPS: FloatingApp[] = [
  {
    id: "slack",
    name: "Slack",
    Icon: SlackIcon,
    position: "left-[7%] top-[12%]",
    color: "#611F69",
    snippet: "Got a sec?",
  },
  {
    id: "gmail",
    name: "Gmail",
    Icon: GmailIcon,
    position: "right-[7%] top-[14%]",
    color: "#EA4335",
    snippet: "URGENT",
  },
  {
    id: "teams",
    name: "Teams",
    Icon: TeamsIcon,
    position: "left-[4%] top-[43%]",
    color: "#5B5FC7",
    snippet: "Meeting now",
  },
  {
    id: "discord",
    name: "Discord",
    Icon: DiscordIcon,
    position: "right-[4%] top-[45%]",
    color: "#5865F2",
    snippet: "@everyone",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    Icon: WhatsAppIcon,
    position: "left-[6%] bottom-[14%]",
    color: "#25D366",
    snippet: "New message",
  },
  {
    id: "figma",
    name: "Figma",
    Icon: FigmaIcon,
    position: "right-[10%] bottom-[12%]",
    color: "#F24E1E",
    snippet: "Left a comment",
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
  // The card's dark "skin" (ink bg + aurora glows + light dot grid). Stays
  // fully opaque through the cover; only its corner radius animates.
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  // Center copy block — lags slightly behind the card while it rises (depth).
  const textBlockRef = useRef<HTMLDivElement | null>(null);
  // Centered frame the floating cards anchor to — hugs the text column and
  // widens only marginally while the card expands to full bleed around it.
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
  // the viewport", so every strand stays in perfect sync:
  //   1. Card width: the mockup's exact final width (shared math —
  //      lib/mockup-scale.ts) → full viewport bleed. The dark surface stays
  //      fully opaque — the cover reads through motion + contrast.
  //   2. Surface corners: 28px → 0 as the card reaches full bleed.
  //   3. Floats frame: hugs the text column (capped base width) and widens at
  //      only ~10% of the leftover space — the floats barely drift.
  //   4. Inner parallax: the copy + floats start slightly low inside the card
  //      and settle to 0 — the content lags a touch behind the card (depth).
  //   5. Hero recede ([data-hero-recede], inside the pinned hero): scales
  //      down + fades out, revealing the dot field that stays behind.
  // useLayoutEffect + fromTo (immediateRender) applies all from-states before
  // first paint (no flash); gsap.context scoped to the section reverts
  // everything — including the hero-side recede styles — in one call on HMR.
  // Below lg / reduced-motion the branch never runs: static dark card.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    const surface = surfaceRef.current;
    const textBlock = textBlockRef.current;
    const floatsFrame = floatsFrameRef.current;
    if (!section || !card || !surface || !textBlock || !floatsFrame) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        // Function-based so invalidateOnRefresh re-measures after resize/late
        // layout. Falls back to 960 if the hero mockup isn't in the DOM.
        const mockupWidth = () => {
          const scaleEl = document.querySelector<HTMLElement>(".hero-preview .origin-top");
          return scaleEl ? computeMockupFinalWidth(scaleEl) : 960;
        };
        // Floats hug the text column: base width capped at 1100px (on wide
        // screens the mockup itself is far wider — anchoring to it would
        // scatter the floats), then a mere 10% of the leftover space as
        // drift while the card grows to full bleed.
        const frameBase = () => Math.min(mockupWidth(), 1100);
        const frameEnd = () => {
          const b = frameBase();
          return b + 0.1 * Math.max(0, window.innerWidth - b);
        };

        const heroSection = document.querySelector<HTMLElement>(
          'section[data-edit-section="Hero"]',
        );
        const heroRecede = document.querySelector<HTMLElement>("[data-hero-recede]");
        // Scale the receding hero around the point sitting at the viewport's
        // centre while it's pinned (the hero is taller than the viewport, so
        // keyword origins would drift). Recomputed on every refresh.
        const setRecedeOrigin = () => {
          if (heroSection && heroRecede) {
            gsap.set(heroRecede, {
              transformOrigin: `50% ${heroSection.offsetHeight - window.innerHeight / 2}px`,
            });
          }
        };
        setRecedeOrigin();

        const tl = gsap.timeline({
          defaults: { ease: "none", duration: 1 },
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "center center",
            scrub: true,
            invalidateOnRefresh: true,
            onRefresh: setRecedeOrigin,
          },
        });

        tl.fromTo(
          card,
          { maxWidth: mockupWidth },
          { maxWidth: () => window.innerWidth },
          0,
        )
          .fromTo(surface, { borderRadius: 28 }, { borderRadius: 0 }, 0)
          .fromTo(floatsFrame, { width: frameBase }, { width: frameEnd }, 0)
          .fromTo([textBlock, floatsFrame], { y: 48 }, { y: 0 }, 0);
        if (heroRecede) {
          tl.to(heroRecede, { scale: 0.94, autoAlpha: 0 }, 0);
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
      className="relative w-full overflow-hidden bg-[#F8F9FB] px-4 py-24 sm:px-6 md:py-32 lg:z-20 lg:bg-transparent lg:px-0"
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
          viewport bleed while the white surface below dissolves. */}
      <div
        ref={cardRef}
        className="relative mx-auto w-full max-w-[1280px] overflow-hidden px-6 py-16 md:px-12 lg:px-20 lg:py-24"
      >
        {/* Card surface — dark ink skin with brand aurora glows and a faint
            light dot grid, on its own layer so the cover timeline can animate
            just its corner radius. Fully opaque the whole ride: the cover
            reads through motion + dark-on-light contrast, not dissolution.
            overflow-hidden clips the blurred glows at the rounded corners. */}
        <div
          ref={surfaceRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0e] shadow-[0_24px_60px_-20px_rgba(15,12,40,0.4),0_12px_32px_-12px_rgba(110,86,207,0.3)]"
        >
          {/* Aurora — soft brand-violet + teal orbs, same palette as the
              section's light-mode glows. */}
          <div
            className="absolute -left-[15%] -top-[20%] h-[520px] w-[520px] rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(110,86,207,0.35) 0%, rgba(110,86,207,0.12) 45%, transparent 70%)",
              filter: "blur(100px)",
            }}
          />
          <div
            className="absolute -bottom-[25%] -right-[12%] h-[560px] w-[560px] rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(135,212,196,0.16) 0%, rgba(135,212,196,0.06) 45%, transparent 70%)",
              filter: "blur(100px)",
            }}
          />
          {/* Faint light dot grid — the inverse of the hero's dotted field,
              centre-masked so it dissolves toward the card edges. */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage: "radial-gradient(circle at center, black 0%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(circle at center, black 0%, transparent 75%)",
            }}
          />
        </div>

        {/* Floats frame — a centered anchor the floating cards position
            against. Its base width hugs the text column (capped at 1100px)
            and the cover timeline widens it by only ~10% of the leftover
            space, so the floats stay an intimate cluster around the headline
            while the card grows to full bleed around them. */}
        <div
          ref={floatsFrameRef}
          className="pointer-events-none absolute left-1/2 top-0 z-[2] hidden h-full w-full -translate-x-1/2 lg:block"
        >
          {/* Floating distraction pop-ups — desktop spread. */}
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

        {/* Center content — light copy on the dark surface. Lags slightly
            behind the card during the cover (inner parallax, see timeline). */}
        <div
          ref={textBlockRef}
          className="relative z-10 mx-auto flex max-w-[760px] flex-col items-center gap-6 text-center lg:max-w-[600px] xl:max-w-[820px]"
        >
          <SplitText
            as="h2"
            text="Context switching is costing your team 20% of their capacity."
            className="text-balance text-[34px] font-bold leading-[1.05] tracking-[-0.035em] text-[#fafafa] sm:text-[44px] md:text-[52px] xl:text-[64px]"
          />

          <SplitText
            as="p"
            text="Every time a developer is interrupted by a ping, it takes 23 minutes to recover. FocusFlow auto-mutes your team's biggest distractions so you can actually get work done."
            reveal
            className="max-w-[640px] text-[15px] font-light leading-relaxed tracking-[-0.01em] text-[#b8b8c6] sm:text-[16px] lg:max-w-[480px] xl:max-w-[640px]"
          />
        </div>

        {/* Tablet + mobile fallback — stacked grid below lg. Same choreography. */}
        <motion.div
          className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:hidden"
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
  const { Icon, name, id, color, snippet } = app;
  const cfg = FLOAT_CONFIG[index % FLOAT_CONFIG.length];
  return (
    <motion.div
      className={`floating-distraction-card pointer-events-auto inline-flex items-center gap-3 rounded-2xl border border-white/40 bg-white/80 p-[14px] backdrop-blur-md lg:gap-2 lg:p-[11px] xl:gap-3 xl:p-[14px] ${className}`}
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
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl lg:h-9 lg:w-9 xl:h-10 xl:w-10"
        style={{ backgroundColor: `${color}1a` }}
      >
        <Icon className="h-5 w-5 lg:h-4 lg:w-4 xl:h-5 xl:w-5" />
        {/* Red notification dot — hidden until the chaos phase. */}
        <motion.span
          className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-red-500"
          style={{ transformOrigin: "center" }}
          variants={dotVariants}
        />
      </span>
      <span className="flex flex-col items-start pr-1 text-left">
        <span className="text-[14px] font-semibold leading-tight text-[#111827] lg:text-[13px] xl:text-[14px]">
          {name}
        </span>
        {/* Notification snippet — fades in during chaos. */}
        <motion.span
          className="text-[11px] font-medium leading-tight text-[#6b7280] lg:text-[10px] xl:text-[11px]"
          variants={snippetVariants}
        >
          {snippet}
        </motion.span>
      </span>
    </motion.div>
  );
}
