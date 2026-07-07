import { useEffect, useRef, useState } from "react";
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  useReducedMotion,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import {
  Clock,
  Plus,
  Play,
  Check,
  ListChecks,
  Users,
  BarChart3,
  ChevronDown,
  Circle,
  Target,
  MessageSquare,
  Puzzle,
  Settings,
  RefreshCw,
  ChevronsLeft,
  Search,
  Bell,
  Moon,
} from "lucide-react";

/**
 * Recreation of the full Focus Flow app mockup from the Figma hero
 * (node 206-442): purple glass frame wrapping the labelled sidebar,
 * topbar and the two-column dashboard.
 * Built faithfully to the Figma structure but using lucide icons + native CSS.
 *
 * A scripted, self-playing cursor demo loops over it (see the choreography
 * controller in HeroMockup): a fake pointer drags the timer to 30:00, opens the
 * Current Task dropdown and picks the first task (which lights up the first
 * priority), then presses Start — the timer counts down while two teammates
 * flip to "In Deep Work". Honours prefers-reduced-motion (renders the final,
 * populated state statically, no loop).
 */

/* Timer ring geometry — shared by the drawing + the choreography math.
   Ring/typography taken 1:1 from Figma (320px ring, 72px number, 8px strokes,
   24px handle, gradient arc) and scaled by k to fit the card. */
const K = 200 / 320;
const RING = 200;
const STROKE = 8 * K; // 5
const RADIUS = (RING - STROKE) / 2; // 97.5
const CIRC = 2 * Math.PI * RADIUS;
const HANDLE = 24 * K; // 15
const TIMER_FONT = '"Segoe UI", system-ui, -apple-system, sans-serif';
const TARGET_SECONDS = 1800; // 30:00 at a quarter-circle fill
const TARGET_PROGRESS = 0.25;

/* The four tasks shown in the Current Task dropdown (Figma node 243:840) —
   the same list as Today's Priorities. */
const DROPDOWN_TASKS = [
  "Wireframe the new landing page",
  "Review pull requests from team",
  "Update documentation for API v2",
  "Client call at 3pm - prepare agenda",
];
const PICKED_TASK = DROPDOWN_TASKS[0];

/* Team statuses (indices = [Avi, Sarah, Marcus, Emma, James, Olivia]). Reset
   baseline (deterministic → SSR-safe), chosen so every member's flip is visible
   when the session starts:
     - first three enter focus (available → deep-work), staggered one-by-one
     - last three flip: Emma break→available, James available→break, Olivia break→available
   The reduced-motion fallback jumps straight to the session-active end state. */
const INITIAL_STATUSES: Status[] = [
  "available", // Avi (You)
  "available", // Sarah Chen
  "available", // Marcus Rodriguez
  "break", // Emma Wilson
  "available", // James Park
  "break", // Olivia Martinez
];
const FOCUS_STATUSES: Status[] = [
  "deep-work", // Avi (You)
  "deep-work", // Sarah Chen
  "deep-work", // Marcus Rodriguez
  "available", // Emma Wilson
  "break", // James Park
  "available", // Olivia Martinez
];
const FINAL_STATIC_STATUSES: Status[] = FOCUS_STATUSES;

/* Fake-cursor SVG tip sits ~ (4,2); nudge so the tip lands on a target's centre. */
const CURSOR_TIP_DX = -4;
const CURSOR_TIP_DY = -2;

/* Narrowest width at which the two-column dashboard still lays out without
   clipping: ~477px of min-content (fixed 200px timer ring + team names) plus
   the glass frame's padding/borders. Below this the whole mockup renders at
   FIT_MIN_W and is scaled down proportionally to the available width, so the
   layout (and the team-status demo) stays intact on phones. */
const FIT_MIN_W = 510;

function formatTime(v: number) {
  const total = Math.max(0, Math.round(v));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function HeroMockup({
  onSarahStatusChange,
}: {
  /** Surfaces Sarah Chen's live status so a sibling (her floating pill) can sync. */
  onSarahStatusChange?: (s: Status) => void;
} = {}) {
  const reduce = useReducedMotion();

  // ── Discrete choreography state ───────────────────────────────────────────
  const [startEnabled, setStartEnabled] = useState(false);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [firstTaskActive, setFirstTaskActive] = useState(false);
  const [label, setLabel] = useState("Drag to set time");
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [statuses, setStatuses] = useState<Status[]>(INITIAL_STATUSES);

  // ── Continuous drivers ────────────────────────────────────────────────────
  const progress = useMotionValue(0);
  const seconds = useMotionValue(0);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorScale = useMotionValue(1);
  const cursorOpacity = useMotionValue(0);

  // Gate the demo on the mockup being mostly (≥40%) on screen. Hand-rolled
  // IntersectionObserver (like Header) so the effect deps stay stable.
  const mockRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = mockRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.intersectionRatio >= 0.4),
      { threshold: [0, 0.25, 0.4, 0.6, 0.8, 1] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Fit-scale: keep the two-column dashboard intact on narrow screens ──────
  // Below FIT_MIN_W of available width the mockup renders at FIT_MIN_W and is
  // scaled down as one unit (transform), with the root's height compensated so
  // the layout below doesn't gap. The demo-cursor math already divides out
  // ancestor CSS scale, so the choreography is unaffected.
  const fitInnerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const [fitH, setFitH] = useState<number | null>(null);
  useEffect(() => {
    const outer = mockRef.current;
    const inner = fitInnerRef.current;
    if (!outer || !inner || typeof ResizeObserver === "undefined") return;
    const update = () => {
      const avail = outer.clientWidth;
      const scale = avail > 0 ? Math.min(1, avail / FIT_MIN_W) : 1;
      setFitScale(scale);
      setFitH(scale < 1 ? Math.round(inner.offsetHeight * scale) : null);
    };
    const ro = new ResizeObserver(update);
    ro.observe(outer);
    ro.observe(inner);
    update();
    return () => ro.disconnect();
  }, []);

  // ── Measurement refs (all cursor targets live inside the timer card) ───────
  const timerCardRef = useRef<HTMLDivElement>(null);
  const timerRingRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const dropdownItemRef = useRef<HTMLButtonElement>(null);
  const startBtnRef = useRef<HTMLButtonElement>(null);

  // Surface Sarah Chen's status (index 1) so her floating pill can mirror it.
  useEffect(() => {
    onSarahStatusChange?.(statuses[1]);
  }, [statuses, onSarahStatusChange]);

  useEffect(() => {
    // Reduced motion → jump straight to the final populated state, no loop.
    if (reduce) {
      progress.set(TARGET_PROGRESS);
      seconds.set(TARGET_SECONDS);
      cursorOpacity.set(0);
      setStartEnabled(true);
      setCurrentTask(PICKED_TASK);
      setFirstTaskActive(true);
      setStatuses(FINAL_STATIC_STATUSES);
      return;
    }

    // Sit idle in the initial frame until the mockup is mostly on screen.
    if (!inView) {
      progress.set(0);
      seconds.set(0);
      cursorOpacity.set(0);
      setStartEnabled(false);
      setCurrentTask(null);
      setDropdownOpen(false);
      setFirstTaskActive(false);
      setTaskCompleted(false);
      setLabel("Drag to set time");
      setStatuses([...INITIAL_STATUSES]);
      return;
    }

    let cancelled = false;
    const anims: { stop: () => void }[] = [];
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    // Centre of an element in the timer card's local (unscaled) coordinates —
    // divides out the hero's scroll-driven CSS scale so the cursor lands true.
    const pointAt = (el: HTMLElement | null) => {
      const card = timerCardRef.current;
      if (!card || !el) return null;
      const cardRect = card.getBoundingClientRect();
      const scale = cardRect.width / card.offsetWidth || 1;
      const r = el.getBoundingClientRect();
      return {
        x: (r.left + r.width / 2 - cardRect.left) / scale,
        y: (r.top + r.height / 2 - cardRect.top) / scale,
      };
    };
    // Top-left of the ring container in the same local space.
    const ringOrigin = () => {
      const card = timerCardRef.current;
      const ring = timerRingRef.current;
      if (!card || !ring) return { x: 0, y: 0 };
      const cardRect = card.getBoundingClientRect();
      const scale = cardRect.width / card.offsetWidth || 1;
      const r = ring.getBoundingClientRect();
      return {
        x: (r.left - cardRect.left) / scale,
        y: (r.top - cardRect.top) / scale,
      };
    };

    const moveCursor = (pt: { x: number; y: number } | null, dur = 0.42) =>
      new Promise<void>((res) => {
        if (!pt) return res();
        let done = 0;
        const check = () => {
          if (++done >= 2) res();
        };
        anims.push(
          animate(cursorX, pt.x + CURSOR_TIP_DX, {
            duration: dur,
            ease: "easeInOut",
            onComplete: check,
          }),
        );
        anims.push(
          animate(cursorY, pt.y + CURSOR_TIP_DY, {
            duration: dur,
            ease: "easeInOut",
            onComplete: check,
          }),
        );
      });

    const press = async () => {
      await new Promise<void>((res) =>
        anims.push(animate(cursorScale, 0.8, { duration: 0.09, onComplete: res })),
      );
      await new Promise<void>((res) =>
        anims.push(animate(cursorScale, 1, { duration: 0.1, onComplete: res })),
      );
    };

    const run = async () => {
      await wait(80); // let first paint + layout settle
      while (!cancelled) {
        // ── RESET ──────────────────────────────────────────────────────────
        setStartEnabled(false);
        setCurrentTask(null);
        setDropdownOpen(false);
        setFirstTaskActive(false);
        setTaskCompleted(false);
        setLabel("Drag to set time");
        setStatuses([...INITIAL_STATUSES]);
        progress.set(0);
        seconds.set(0);
        cursorScale.set(1);
        cursorOpacity.set(0);
        await wait(400);
        if (cancelled) break;

        // Place the cursor on the handle's rest position (12 o'clock), fade in.
        const origin = ringOrigin();
        cursorX.set(origin.x + RING / 2 + CURSOR_TIP_DX);
        cursorY.set(origin.y + STROKE / 2 + CURSOR_TIP_DY);
        await new Promise<void>((res) =>
          anims.push(animate(cursorOpacity, 1, { duration: 0.22, onComplete: res })),
        );
        if (cancelled) break;
        await wait(150);

        // ── DRAG the timer 0 → quarter circle, number 0:00 → 30:00 ──────────
        let enabled = false;
        await new Promise<void>((res) => {
          anims.push(
            animate(progress, TARGET_PROGRESS, {
              duration: 0.9,
              ease: "easeInOut",
              onUpdate: (p) => {
                seconds.set((p / TARGET_PROGRESS) * TARGET_SECONDS);
                const th = p * 2 * Math.PI; // clockwise from 12 o'clock
                cursorX.set(origin.x + RING / 2 + RADIUS * Math.sin(th) + CURSOR_TIP_DX);
                cursorY.set(origin.y + RING / 2 - RADIUS * Math.cos(th) + CURSOR_TIP_DY);
                if (!enabled && p > 0.002) {
                  setStartEnabled(true); // turns purple the moment dragging starts
                  enabled = true;
                }
              },
              onComplete: res,
            }),
          );
        });
        if (cancelled) break;
        seconds.set(TARGET_SECONDS);
        await wait(220);

        // ── Open Current Task dropdown, pick the first task ─────────────────
        await moveCursor(pointAt(pillRef.current));
        if (cancelled) break;
        await wait(100);
        setDropdownOpen(true);
        await wait(320); // let it mount + settle before measuring the item
        if (cancelled) break;
        await moveCursor(pointAt(dropdownItemRef.current), 0.38);
        if (cancelled) break;
        await press();
        setCurrentTask(PICKED_TASK);
        setDropdownOpen(false);
        setFirstTaskActive(true); // first priority lights up in sync
        await wait(350);
        if (cancelled) break;

        // ── Press Start ─────────────────────────────────────────────────────
        await moveCursor(pointAt(startBtnRef.current));
        if (cancelled) break;
        await press();
        setLabel("Focusing…");
        anims.push(animate(cursorOpacity, 0, { duration: 0.3 })); // hand off, fade out

        // ── Fast-forward the timer to 0:00 (ring drains) + team status flips ─
        // First three enter focus one-by-one, then the last three flip.
        const RUN = 2.2;
        anims.push(animate(seconds, 0, { duration: RUN, ease: "easeIn" }));
        anims.push(animate(progress, 0, { duration: RUN, ease: "easeIn" }));
        await wait(200);
        for (let i = 0; i < FOCUS_STATUSES.length; i++) {
          if (cancelled) break;
          setStatuses((prev) => {
            const next = [...prev];
            next[i] = FOCUS_STATUSES[i];
            return next;
          });
          await wait(160);
        }
        if (cancelled) break;
        await wait(1050); // let the number + ring reach 0
        if (cancelled) break;
        seconds.set(0);
        setTaskCompleted(true); // ✓ ticks the first priority the moment it hits 0
        setLabel("Session complete");
        await wait(1100);
        if (cancelled) break;

        // ── End-of-loop pause ───────────────────────────────────────────────
        await wait(600);
      }
    };
    run();

    return () => {
      cancelled = true;
      anims.forEach((a) => a.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, inView]);

  return (
    <div
      ref={mockRef}
      className="relative mx-auto w-full max-w-[1600px]"
      // Compensate for the fit-scale transform below (transforms don't affect
      // layout height), so the section flow stays tight on narrow screens.
      style={fitH != null ? { height: fitH } : undefined}
    >
      <div
        ref={fitInnerRef}
        style={
          fitScale < 1
            ? {
                width: FIT_MIN_W,
                transform: `scale(${fitScale})`,
                transformOrigin: "top left",
              }
            : undefined
        }
      >
      {/* Outer purple glass frame — layered glassmorphism: a light→purple
          translucent gradient over a saturated frosted blur (so the colorful
          background shows through), a hairline light edge, crisp inset
          highlights and a soft brand-tinted lift shadow. */}
      <div
        className="rounded-[30px] p-2.5 md:p-3.5"
        style={{
          background:
            "linear-gradient(150deg, rgba(255,255,255,0.32) 0%, rgba(196,184,243,0.16) 45%, rgba(110,86,207,0.13) 100%)",
          backdropFilter: "blur(20px) saturate(175%)",
          WebkitBackdropFilter: "blur(20px) saturate(175%)",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,0.7), inset 0 -1px 1px rgba(110,86,207,0.12), 0 10px 30px -14px rgba(110,86,207,0.28), 0 34px 70px -28px rgba(47,38,95,0.38)",
        }}
      >
        {/* macOS-style window title bar */}
        <TitleBar />

        {/* Inner app panel */}
        <div
          className="overflow-hidden rounded-[20px]"
          style={{ background: "#f2ecfe" }}
        >
          <div className="flex">
            {/* Full labelled sidebar */}
            <Sidebar />

            {/* Topbar + dashboard content */}
            <div className="flex flex-1 flex-col">
              <Topbar />

              <div className="p-4 md:p-6">
                <AppHeader />

                {/* Always two columns — on narrow screens the whole mockup is
                    fit-scaled down (see FIT_MIN_W) instead of stacking, so the
                    team-status side of the demo stays in view. */}
                <div className="mt-4 grid grid-cols-[1.7fr_1fr] gap-3 md:gap-4">
                  {/* LEFT column */}
                  <div className="flex flex-col gap-3 md:gap-4">
                    <FocusTimerCard
                      progress={progress}
                      seconds={seconds}
                      startEnabled={startEnabled}
                      label={label}
                      currentTask={currentTask}
                      dropdownOpen={dropdownOpen}
                      reduce={!!reduce}
                      cursorX={cursorX}
                      cursorY={cursorY}
                      cursorScale={cursorScale}
                      cursorOpacity={cursorOpacity}
                      timerCardRef={timerCardRef}
                      timerRingRef={timerRingRef}
                      handleRef={handleRef}
                      pillRef={pillRef}
                      dropdownItemRef={dropdownItemRef}
                      startBtnRef={startBtnRef}
                    />
                    <TodaysPrioritiesCard
                      firstTaskActive={firstTaskActive}
                      taskCompleted={taskCompleted}
                      reduce={!!reduce}
                    />
                  </div>

                  {/* RIGHT column */}
                  <div className="flex flex-col gap-3 md:gap-4">
                    <TeamFlowCard statuses={statuses} reduce={!!reduce} />
                    <DailyStatsCard />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

const MAC_CONTROLS = [
  { color: "#ff5f57", glyph: "×", glyphColor: "#7a0e00", label: "Close" },
  { color: "#febc2e", glyph: "−", glyphColor: "#9a6500", label: "Minimize" },
  { color: "#28c840", glyph: "+", glyphColor: "#0a5d00", label: "Zoom" },
];

function TitleBar() {
  return (
    <div className="group relative flex items-center px-1 pb-2 md:pb-3">
      {/* Traffic-light window controls */}
      <div className="flex items-center gap-2">
        {MAC_CONTROLS.map(({ color, glyph, glyphColor, label }) => (
          <button
            key={label}
            aria-label={label}
            className="flex h-3 w-3 items-center justify-center rounded-full"
            style={{ background: color }}
          >
            <span
              className="text-[8px] font-bold leading-none opacity-0 transition-opacity group-hover:opacity-100"
              style={{ color: glyphColor }}
            >
              {glyph}
            </span>
          </button>
        ))}
      </div>

      {/* Centered window title */}
      <span className="absolute left-1/2 hidden -translate-x-1/2 text-[11px] font-medium text-[#2F265F]/55 sm:block md:text-[12px]">
        FocusFlow
      </span>
    </div>
  );
}

const NAV_ITEMS = [
  { icon: Target, label: "Focus", active: true },
  { icon: MessageSquare, label: "Chat", active: false },
  { icon: BarChart3, label: "Statistics", active: false },
  { icon: Puzzle, label: "Integrations", active: false },
  { icon: Settings, label: "Settings", active: false },
];

function Sidebar() {
  return (
    <aside className="hidden w-[160px] shrink-0 flex-col border-r border-[#e5e7eb] bg-white lg:flex">
      {/* Logo */}
      <div className="flex items-center justify-center gap-1 px-4 py-5">
        <span className="text-[20px] font-bold leading-none text-[#6E56CF]">
          [
        </span>
        <span className="text-[18px] font-bold leading-none text-[#0b0b0b]">
          Focus<span className="text-[#8B79E6]">Flow</span>
        </span>
        <span className="text-[20px] font-bold leading-none text-[#6E56CF]">
          ]
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1.5 px-3 py-2">
        {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`flex items-center gap-2.5 rounded-[12px] px-3 py-2 text-[12px] font-semibold transition ${
              active
                ? "border border-[rgba(110,86,207,0.3)] bg-[rgba(110,86,207,0.1)] text-[#6E56CF]"
                : "text-[#737373] hover:bg-[rgba(110,86,207,0.06)]"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="flex flex-col gap-1.5 border-t border-[rgba(170,153,236,0.1)] px-3 py-4">
        <button className="flex items-center gap-2.5 rounded-[12px] px-3 py-2 text-[12px] font-semibold text-[#737373] transition hover:bg-[rgba(110,86,207,0.06)]">
          <RefreshCw className="h-4 w-4 shrink-0" />
          Refresh everything
        </button>
        <button className="flex items-center gap-2.5 rounded-[12px] px-3 py-2 text-[12px] font-semibold text-[#737373] transition hover:bg-[rgba(110,86,207,0.06)]">
          <ChevronsLeft className="h-4 w-4 shrink-0" />
          Collapse sidebar
        </button>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <div
      className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-3"
      style={{
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(250,250,250,0.9) 100%)",
        boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.05)",
      }}
    >
      {/* User */}
      <div className="flex items-center gap-2.5">
        <img
          src="/images/avi-avatar.png"
          alt="Avi"
          className="h-9 w-9 rounded-full object-cover"
          style={{ boxShadow: "0 0 15px rgba(170,153,236,0.4)" }}
        />
        <span className="text-[13px] md:text-[14px] font-semibold text-[#0b0b0b]">Avi</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {[Search, Bell, Moon].map((Icon, i) => (
          <button
            key={i}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#737373] transition hover:bg-[rgba(110,86,207,0.08)]"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <button className="ml-1 flex items-center px-2 py-1.5 text-[13px] md:text-[14px] font-bold text-[#0b0b0b]">
          <span className="border-b border-[#6E56CF] pb-0.5">Account</span>
        </button>
      </div>
    </div>
  );
}

function AppHeader() {
  return (
    <div className="flex items-center justify-between rounded-[16px] border border-[#e5e7eb] bg-white px-4 py-3 shadow-sm">
      <div>
        <h2 className="text-[15px] md:text-[17px] lg:text-[20px] font-bold leading-tight text-[#111827]">
          FocusFlow
        </h2>
        <p className="mt-0.5 text-[10px] md:text-[11px] text-[#737373]">
          Deep work sessions and team productivity
        </p>
      </div>
      <div className="flex items-center gap-1.5 rounded-[20px] border border-[#e5e7eb] bg-[rgba(110,86,207,0.1)] px-3 py-1.5">
        <Clock className="h-3 w-3 text-[#6E56CF]" />
        <span className="text-[10px] md:text-[11px] text-[#0b0b0b]">3h 24m focused today</span>
      </div>
    </div>
  );
}

/** Fake mouse pointer for the demo — tip sits at ~(4,2) in its own box. */
function CursorSvg() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))" }}
    >
      <path
        d="M4 2 L4 18.5 L8.4 14.4 L11.4 20.8 L13.9 19.7 L10.9 13.4 L16.6 13.4 Z"
        fill="#111827"
        stroke="#ffffff"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type FocusTimerCardProps = {
  progress: MotionValue<number>;
  seconds: MotionValue<number>;
  startEnabled: boolean;
  label: string;
  currentTask: string | null;
  dropdownOpen: boolean;
  reduce: boolean;
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
  cursorScale: MotionValue<number>;
  cursorOpacity: MotionValue<number>;
  timerCardRef: React.RefObject<HTMLDivElement | null>;
  timerRingRef: React.RefObject<HTMLDivElement | null>;
  handleRef: React.RefObject<HTMLDivElement | null>;
  pillRef: React.RefObject<HTMLDivElement | null>;
  dropdownItemRef: React.RefObject<HTMLButtonElement | null>;
  startBtnRef: React.RefObject<HTMLButtonElement | null>;
};

function FocusTimerCard({
  progress,
  seconds,
  startEnabled,
  label,
  currentTask,
  dropdownOpen,
  reduce,
  cursorX,
  cursorY,
  cursorScale,
  cursorOpacity,
  timerCardRef,
  timerRingRef,
  handleRef,
  pillRef,
  dropdownItemRef,
  startBtnRef,
}: FocusTimerCardProps) {
  const dashoffset = useTransform(progress, (p) => CIRC * (1 - p));
  const arcOpacity = useTransform(progress, (p) => (p <= 0.002 ? 0 : 1));
  const handleLeft = useTransform(
    progress,
    (p) => RING / 2 + RADIUS * Math.sin(p * 2 * Math.PI) - HANDLE / 2,
  );
  const handleTop = useTransform(
    progress,
    (p) => RING / 2 - RADIUS * Math.cos(p * 2 * Math.PI) - HANDLE / 2,
  );
  const timeText = useTransform(seconds, (v) => formatTime(v));

  return (
    <div
      ref={timerCardRef}
      className="relative rounded-[16px] border border-[#e5e7eb] bg-white p-5 shadow-sm md:p-7"
    >
      <div className="flex flex-col items-center">
        {/* Circular timer */}
        <div ref={timerRingRef} className="relative" style={{ width: RING, height: RING }}>
          <svg width={RING} height={RING} className="-rotate-90">
            <defs>
              <linearGradient id="focusTimerArc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#AA99EC" />
                <stop offset="100%" stopColor="#C4B8F3" />
              </linearGradient>
            </defs>
            <circle
              cx={RING / 2}
              cy={RING / 2}
              r={RADIUS}
              stroke="rgba(110,86,207,0.1)"
              strokeWidth={STROKE}
              fill="none"
            />
            <motion.circle
              cx={RING / 2}
              cy={RING / 2}
              r={RADIUS}
              stroke="url(#focusTimerArc)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={CIRC}
              style={{ strokeDashoffset: dashoffset, opacity: arcOpacity }}
            />
          </svg>
          {/* Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="font-bold leading-none text-[#0b0b0b]"
              style={{
                fontFamily: TIMER_FONT,
                fontSize: 72 * K,
                letterSpacing: "-0.025em",
              }}
            >
              {timeText}
            </motion.span>
            <div
              className="mt-2 flex items-center gap-1.5 text-[#737373]"
              style={{
                fontFamily: TIMER_FONT,
                fontSize: 14 * K,
                lineHeight: `${20 * K}px`,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#6E56CF]" />
              {label}
            </div>
          </div>
          {/* Draggable handle — rides the arc end via progress. */}
          <motion.div
            ref={handleRef}
            className="absolute rounded-full bg-white"
            style={{
              width: HANDLE,
              height: HANDLE,
              borderWidth: 4 * K,
              borderStyle: "solid",
              borderColor: "#6E56CF",
              left: handleLeft,
              top: handleTop,
              boxShadow: "0 0 0 2px rgba(170,153,236,0.15), 0 2px 12px rgba(0,0,0,0.25)",
            }}
          />
        </div>

        {/* Current task pill + dropdown */}
        <div className="mt-8 w-full">
          <p className="text-center text-[10px] md:text-[11px] text-[#737373]">Current Task</p>
          <div className="relative mt-3">
            <div
              ref={pillRef}
              className="flex items-center justify-between gap-2 rounded-full bg-[#f3f4f6] px-5 py-2.5"
            >
              <span
                className={`flex-1 text-center text-[12px] md:text-[13px] ${
                  currentTask ? "text-[#111827]" : "text-[#9ca3af]"
                }`}
              >
                {currentTask ?? "Select a task"}
              </span>
              <motion.span animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown className="h-3.5 w-3.5 text-[#737373]" />
              </motion.span>
            </div>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-0 right-0 top-full z-30 mt-2 rounded-[20px] border border-[#e5e7eb] bg-white p-2"
                  style={{
                    boxShadow:
                      "0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)",
                    transformOrigin: "top",
                  }}
                >
                  {DROPDOWN_TASKS.map((t, i) => (
                    <button
                      key={t}
                      ref={i === 0 ? dropdownItemRef : undefined}
                      className={`flex w-full items-center gap-2 rounded-[16px] px-3 py-2 text-left transition-colors ${
                        i === 0 ? "bg-[rgba(110,86,207,0.06)]" : ""
                      }`}
                    >
                      <Circle
                        className={`h-3.5 w-3.5 shrink-0 ${
                          i === 0 ? "text-[#6E56CF]" : "text-[#9ca3af]"
                        }`}
                      />
                      <span
                        className={`text-[12px] md:text-[13px] ${
                          i === 0 ? "font-semibold text-[#6E56CF]" : "text-[#4b5563]"
                        }`}
                      >
                        {t}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Start Focus Session button — gray/disabled until the drag begins. */}
        <button
          ref={startBtnRef}
          className={`mt-5 inline-flex items-center gap-2 rounded-[20px] px-5 py-3 text-[13px] md:text-[14px] font-semibold transition-all duration-300 ${
            startEnabled ? "bg-[#6E56CF] text-white" : "bg-[#e5e7eb] text-[#9ca3af]"
          }`}
          style={{
            boxShadow: startEnabled ? "0 0 24px rgba(170,153,236,0.4)" : "none",
          }}
        >
          <Play className="h-3.5 w-3.5" fill={startEnabled ? "#ffffff" : "#9ca3af"} />
          Start Focus Session
        </button>
      </div>

      {/* Fake demo cursor — overlays the timer card, driven by the choreography. */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-40"
          style={{
            x: cursorX,
            y: cursorY,
            scale: cursorScale,
            opacity: cursorOpacity,
            transformOrigin: "top left",
          }}
        >
          <CursorSvg />
        </motion.div>
      )}
    </div>
  );
}

function TodaysPrioritiesCard({
  firstTaskActive,
  taskCompleted,
  reduce,
}: {
  firstTaskActive: boolean;
  taskCompleted: boolean;
  reduce: boolean;
}) {
  const tasks = [
    { text: "Wireframe the new landing page" },
    { text: "Review pull requests from team" },
    { text: "Update documentation for API v2" },
    { text: "Client call at 3pm - prepare agenda" },
  ];

  return (
    <div className="rounded-[16px] border border-[#e5e7eb] bg-white p-4 shadow-sm md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[20px] bg-[rgba(110,86,207,0.2)]">
            <ListChecks className="h-5 w-5 text-[#6E56CF]" />
          </div>
          <h3 className="text-[14px] md:text-[15px] lg:text-[16px] font-semibold text-[#111827]">
            Today's Priorities
          </h3>
        </div>
        <button className="inline-flex items-center gap-1 rounded-[16px] border border-[rgba(110,86,207,0.3)] bg-[rgba(110,86,207,0.1)] px-3 py-1.5 text-[11px] md:text-[12px] font-semibold text-[#6E56CF] shadow-sm">
          <Plus className="h-3 w-3" />
          Add Task
        </button>
      </div>

      <div className="my-4 h-px bg-[#e5e7eb]" />

      <ul className="flex flex-col gap-3">
        {tasks.map((task, i) => {
          const geometry = `${i >= 1 ? "hidden md:flex" : "flex"} items-start gap-3 rounded-[20px] p-4`;

          // First task animates between the inactive and active ("marked") looks.
          if (i === 0) {
            const active = firstTaskActive;
            return (
              <motion.li
                key={i}
                className={geometry}
                style={{ borderWidth: 1, borderStyle: "solid" }}
                initial={false}
                animate={{
                  borderColor: active ? "rgba(110,86,207,0.5)" : "#e5e7eb",
                  backgroundColor: active ? "rgba(110,86,207,0.1)" : "#ffffff",
                  boxShadow: active
                    ? "0 0 0 2px rgba(170,153,236,0.2)"
                    : "0 0 0 0 rgba(170,153,236,0)",
                }}
                transition={{ duration: reduce ? 0 : 0.4 }}
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border-2 transition-colors duration-300 ${
                    taskCompleted
                      ? "border-[#6E56CF] bg-[#6E56CF]"
                      : "border-[rgba(110,86,207,0.4)]"
                  }`}
                >
                  <AnimatePresence>
                    {taskCompleted && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      >
                        <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex-1">
                  <p
                    className={`text-[13px] md:text-[14px] lg:text-[15px] transition-colors duration-300 ${
                      taskCompleted ? "text-[#9ca3af] line-through" : "text-[#0b0b0b]"
                    }`}
                  >
                    {task.text}
                  </p>
                  <AnimatePresence initial={false}>
                    {active && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: reduce ? 0 : 0.3 }}
                        className="mt-1 overflow-hidden text-[11px] md:text-[12px] text-[rgba(110,86,207,0.7)]"
                      >
                        {taskCompleted ? "Completed" : "Active task"}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            );
          }

          return (
            <li key={i} className={`${geometry} border border-[#e5e7eb]`}>
              <div className="mt-0.5 h-5 w-5 shrink-0 rounded-[4px] border-2 border-[rgba(110,86,207,0.4)]" />
              <div className="flex-1">
                <p className="text-[13px] md:text-[14px] lg:text-[15px] text-[#0b0b0b]">
                  {task.text}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 border-t border-[#e5e7eb] pt-4">
        <div className="flex items-center justify-between text-[12px] md:text-[13px] lg:text-[14px]">
          <span className="text-[#737373]">Progress</span>
          <span className="text-[#0b0b0b]">0 / 4 completed</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[rgba(110,86,207,0.1)]">
          <div
            className="h-full rounded-full bg-[#6E56CF]"
            style={{ width: "2%", boxShadow: "0 0 8px rgba(170,153,236,0.6)" }}
          />
        </div>
      </div>
    </div>
  );
}

export type Status = "available" | "deep-work" | "break";
export const STATUS_STYLES: Record<
  Status,
  { label: string; bg: string; color: string; glow: string }
> = {
  available: {
    label: "Available",
    bg: "#d1fae5",
    color: "#047857",
    glow: "0 0 12px rgba(135,212,196,0.35)",
  },
  "deep-work": {
    label: "In Deep Work",
    bg: "rgba(110,86,207,0.1)",
    color: "#6E56CF",
    glow: "0 0 12px rgba(170,153,236,0.4)",
  },
  break: {
    label: "On Break",
    bg: "#e5e7eb",
    color: "#374151",
    glow: "0 0 12px rgba(107,114,128,0.25)",
  },
};

/** Status pill that smoothly crossfades colour + label (with a soft pop) when a
 *  teammate's status changes during the demo. */
function StatusBadge({ status, reduce }: { status: Status; reduce: boolean }) {
  const s = STATUS_STYLES[status];
  const prev = useRef(status);
  const changed = prev.current !== status;
  useEffect(() => {
    prev.current = status;
  }, [status]);

  const base =
    "mt-1 inline-flex w-fit items-center rounded-[12px] px-2 py-0.5 text-[10px] md:text-[11px] lg:text-[12px]";

  if (reduce) {
    return (
      <span className={base} style={{ background: s.bg, color: s.color, boxShadow: s.glow }}>
        {s.label}
      </span>
    );
  }

  return (
    <motion.span
      className={base}
      // Colour transitions via CSS (reliable); framer drives only the pop.
      style={{
        backgroundColor: s.bg,
        color: s.color,
        boxShadow: s.glow,
        transition: "background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease",
      }}
      initial={false}
      animate={{ scale: changed ? [1, 1.12, 1] : 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={s.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {s.label}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

function TeamFlowCard({
  statuses,
  reduce,
}: {
  statuses: Status[];
  reduce: boolean;
}) {
  const members: {
    initials: string;
    name: string;
    avatar?: string;
  }[] = [
    { initials: "V", name: "Avi (You)", avatar: "/images/avi-avatar.png" },
    { initials: "SC", name: "Sarah Chen", avatar: "/images/sarah-chen.jpg" },
    { initials: "MR", name: "Marcus Rodriguez", avatar: "/images/marcus-rodriguez.jpg" },
    { initials: "EW", name: "Emma Wilson", avatar: "/images/emma-wilson.jpg" },
    { initials: "JP", name: "James Park", avatar: "/images/james-park.jpg" },
    { initials: "OM", name: "Olivia Martinez", avatar: "/images/olivia-martinez.jpg" },
  ];

  const deepCountSm = statuses.slice(0, 3).filter((s) => s === "deep-work").length;
  const deepCountMd = statuses.slice(0, 5).filter((s) => s === "deep-work").length;

  return (
    <div className="rounded-[16px] border border-[#e5e7eb] bg-white p-4 shadow-sm md:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[20px] bg-[rgba(110,86,207,0.2)]">
          <Users className="h-5 w-5 text-[#6E56CF]" />
        </div>
        <h3 className="text-[14px] md:text-[15px] lg:text-[16px] font-semibold text-[#111827]">Team Flow</h3>
      </div>

      <div className="my-4 h-px bg-[#e5e7eb]" />

      <ul className="flex flex-col gap-3">
        {members.map((m, i) => {
          const isYou = i === 0;
          const status = statuses[i];
          return (
            <li
              key={m.name}
              className={`${
                i >= 3 ? "hidden md:flex" : "flex"
              } items-center gap-3 rounded-[16px] p-3 ${isYou ? "bg-[#f2ecfe]" : ""}`}
            >
              {m.avatar ? (
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="h-9 w-9 rounded-full border border-[rgba(110,86,207,0.4)] object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(110,86,207,0.4)] bg-[rgba(110,86,207,0.2)]">
                  <span className="text-[12px] font-medium text-[#6E56CF]">
                    {m.initials}
                  </span>
                </div>
              )}
              <div className="flex flex-1 flex-col">
                <span
                  className={`text-[12px] md:text-[13px] lg:text-[14px] text-[#4b5563] ${
                    isYou ? "font-bold" : ""
                  }`}
                >
                  {m.name}
                </span>
                <StatusBadge status={status} reduce={reduce} />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-[#e5e7eb] pt-4 text-[12px] md:text-[13px] lg:text-[14px]">
        <span className="text-[#737373]">In deep work</span>
        <span className="font-semibold italic text-[#0b0b0b]">
          {/* Matches the number of members actually shown per breakpoint. */}
          <span className="md:hidden">{deepCountSm}/3 members</span>
          <span className="hidden md:inline">{deepCountMd}/5 members</span>
        </span>
      </div>
    </div>
  );
}

function DailyStatsCard() {
  const days = [
    { label: "Mon", value: 0.55 },
    { label: "Tue", value: 0.72 },
    { label: "Wed", value: 0.48 },
    { label: "Thu", value: 0.85 },
    { label: "Fri", value: 0.65 },
  ];
  const yTicks = [8, 6, 4, 2, 0];

  return (
    <div className="rounded-[16px] border border-[#e5e7eb] bg-white p-4 shadow-sm md:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[20px] bg-[rgba(110,86,207,0.2)]">
          <BarChart3 className="h-5 w-5 text-[#6E56CF]" />
        </div>
        <div>
          <h3 className="text-[14px] md:text-[15px] lg:text-[16px] font-semibold text-[#111827]">
            Daily Stats
          </h3>
          <p className="text-[10px] md:text-[11px] lg:text-[12px] text-[#6b7280]">Last 5 days</p>
        </div>
      </div>

      <div className="my-4 h-px bg-[#e5e7eb]" />

      {/* Chart with y-axis */}
      <div className="flex gap-2">
        <div className="flex h-[140px] flex-col justify-between py-1 text-[9px] md:text-[10px] lg:text-[11px] text-[#6b7280]">
          {yTicks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="flex flex-1 items-end justify-between gap-3 border-l border-[#e5e7eb] pl-3">
          {days.map((d) => (
            <div
              key={d.label}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${d.value * 120}px`,
                  background:
                    "linear-gradient(180deg, #8B79E6 0%, #6E56CF 100%)",
                  boxShadow: "0 0 6px rgba(170,153,236,0.4)",
                }}
              />
              <span className="text-[9px] md:text-[10px] lg:text-[11px] text-[#6b7280]">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#e5e7eb] pt-4">
        <div>
          <p className="text-[10px] md:text-[11px] lg:text-[12px] text-[#737373]">Weekly Average</p>
          <p className="mt-1 text-[13px] md:text-[14px] lg:text-[15px] font-semibold text-[#0b0b0b]">
            5.0 hours/day
          </p>
        </div>
        <div className="flex items-center gap-1 text-[12px] md:text-[13px] lg:text-[14px] font-medium text-[#00a63e]">
          <BarChart3 className="h-4 w-4" />
          +12%
        </div>
      </div>
    </div>
  );
}
