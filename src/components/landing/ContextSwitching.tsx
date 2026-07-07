import { useEffect, useRef } from "react";
import type { ComponentType, SVGProps } from "react";
import {
  motion,
  useAnimationControls,
  useInView,
  type Variants,
} from "framer-motion";
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
};

/* Ordered as the chaos sequence fires:
   Top-Left → Top-Right → Mid-Left → Mid-Right → Bottom-Left → Bottom-Right. */
const APPS: FloatingApp[] = [
  { id: "slack", name: "Slack", Icon: SlackIcon, position: "left-[8%] top-[8%]", color: "#611F69", snippet: "Got a sec?" },
  { id: "gmail", name: "Gmail", Icon: GmailIcon, position: "right-[8%] top-[12%]", color: "#EA4335", snippet: "URGENT" },
  { id: "teams", name: "Teams", Icon: TeamsIcon, position: "left-[4%] top-[40%]", color: "#5B5FC7", snippet: "Meeting now" },
  { id: "discord", name: "Discord", Icon: DiscordIcon, position: "right-[4%] top-[44%]", color: "#5865F2", snippet: "@everyone" },
  { id: "whatsapp", name: "WhatsApp", Icon: WhatsAppIcon, position: "left-[6%] bottom-[10%]", color: "#25D366", snippet: "New message" },
  { id: "figma", name: "Figma", Icon: FigmaIcon, position: "right-[12%] bottom-[8%]", color: "#F24E1E", snippet: "Left a comment" },
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
  // once: false → re-triggers every time the section enters view (scrolling
  // down to it, back up to it, etc.). Fire early so it doesn't lag the scroll.
  const inView = useInView(sectionRef, { once: false, amount: 0.15 });
  const cardControls = useAnimationControls();

  useEffect(() => {
    // Out of view → snap back to hidden so the entrance can replay on re-entry.
    if (!inView) {
      cardControls.set("hidden");
      return;
    }
    let cancelled = false;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    (async () => {
      // Gradual staggered entrance for the floating cards (runs once).
      await cardControls.start("enter");
      if (cancelled) return;

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
      className="relative w-full overflow-hidden py-24 md:py-32"
      style={{ backgroundColor: "#F8F9FB" }}
      data-edit-section="Context switching"
    >
      {/* Depth — masked tech dot-grid. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(110,86,207,0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(circle at center, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 0%, transparent 70%)",
        }}
      />
      {/* Ambient violet + sky glows — keep the page-wide colour flow continuous
          between the Hero above and Features below. Subtle, fade before the edges. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
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

      <div className="relative mx-auto w-full max-w-[1280px] px-6 md:px-12 lg:px-20">
        {/* Floating distraction pop-ups — desktop spread. */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-[2] hidden lg:block"
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

        {/* Center content — sits naturally on the section background, no bounding box. */}
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
