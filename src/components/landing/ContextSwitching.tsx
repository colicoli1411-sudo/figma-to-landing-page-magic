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
    position: "left-[5%] top-[11%]",
    color: "#611F69",
    snippet: "Got a sec? Quick question about the API…",
    time: "now",
  },
  {
    id: "gmail",
    name: "Gmail",
    Icon: GmailIcon,
    position: "right-[5%] top-[11%]",
    color: "#EA4335",
    snippet: "URGENT: Client feedback needed today",
    time: "2m",
  },
  {
    id: "teams",
    name: "Teams",
    Icon: TeamsIcon,
    position: "left-[3%] top-[19%]",
    color: "#5B5FC7",
    snippet: "Design sync starting now — join?",
    time: "now",
  },
  {
    id: "discord",
    name: "Discord",
    Icon: DiscordIcon,
    position: "right-[3%] bottom-[19%]",
    color: "#5865F2",
    snippet: "@everyone the new build is live",
    time: "5m",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    Icon: WhatsAppIcon,
    position: "left-[5%] bottom-[11%]",
    color: "#25D366",
    snippet: "Hey! Are we still on for tonight?",
    time: "8m",
  },
  {
    id: "figma",
    name: "Figma",
    Icon: FigmaIcon,
    position: "right-[5%] bottom-[11%]",
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

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const apply = () => setCardLayer(mql.matches ? "desktop" : "mobile");
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

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
      {/* Lavender centre — wide soft ellipse behind the copy; the dots stay
          visible toward the screen edges around it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at center, rgba(110,86,207,0.14) 0%, rgba(110,86,207,0.07) 45%, transparent 78%)",
        }}
      />
      {/* Ambient violet + mint glows — soft page-wide colour flow, edge-masked
          so they dissolve before the section boundary. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
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

      {/* Floating notifications (desktop) — absolutely placed within a centered
          max-w frame so they flank the headline instead of hugging the screen
          edges on wide monitors. */}
      {cardLayer !== "mobile" && (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-0 z-[2] hidden h-full w-full max-w-[1400px] -translate-x-1/2 lg:block"
          initial="hidden"
          animate={cardControls}
          variants={layerVariants}
        >
          {APPS.map((app, i) => (
            <FloatingCard key={app.id} app={app} index={i} className={`absolute ${app.position}`} />
          ))}
        </motion.div>
      )}

      {/* Center content — copy vertically centered in the full-height section. */}
      <div className="relative z-10 mx-auto flex max-w-[760px] flex-col items-center gap-6 text-center lg:max-w-[640px] xl:max-w-[860px]">
        <SplitText
          as="h2"
          text="Context switching is costing your team 20% of their capacity."
          className="text-balance text-[34px] font-bold leading-[1.05] tracking-[-0.035em] text-[#1d1d23] sm:text-[44px] md:text-[52px] xl:text-[64px]"
        />

        <SplitText
          as="p"
          text="Every time a developer is interrupted by a ping, it takes 23 minutes to recover. FocusFlow auto-mutes your team's biggest distractions so you can actually get work done."
          reveal
          className="max-w-[640px] text-[15px] font-light leading-relaxed tracking-[-0.01em] text-[#6b7280] sm:text-[16px] lg:max-w-[520px] xl:max-w-[640px]"
        />
      </div>

      {/* Tablet + mobile fallback — stacked grid below lg. Same choreography. */}
      {cardLayer !== "desktop" && (
        <motion.div
          className="relative z-10 mx-auto mt-12 grid w-full max-w-[520px] grid-cols-1 gap-3 sm:max-w-[720px] sm:grid-cols-2 lg:hidden"
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
