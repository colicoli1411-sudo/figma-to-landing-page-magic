import { useEffect, useId, useState } from "react";
import { Clock, CalendarDays, Award, TrendingUp } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

/**
 * "Capacity Analytics" feature mockup.
 *
 * A live recreation of the in-product Analytics page (from Figma). On load the
 * charts animate in one after another: the Focus Trend bar chart grows up from
 * empty (bar by bar), then the Distraction Breakdown donut draws itself in.
 * It holds, then resets and loops.
 *
 * Sized in container-query units (cqw) against the card width. Chart motion is
 * pure CSS transitions (no JS animation loop) so it can't flash or stall.
 */

const BRAND = "#6E56CF"; // new brand violet (was #7C3AED)
const LIGHT_VIOLET = "#8B79E6"; // new light violet (was #A78BFA)
const TEAL = "#2DD4BF";
const GREY = "#9CA3AF";
const GREEN = "#10B981";
const CARD_SHADOW = "0px 1px 3px 0px rgba(0,0,0,0.08), 0px 1px 2px -1px rgba(0,0,0,0.1)";

// Shared close duration — the bar chart and the donut collapse in lockstep, so
// this single value drives both transitions (see `closing` branches below).
const CLOSE_MS = 600;
// Donut draw-in duration (opening) — snappier than the old 800ms.
const OPEN_PIE_MS = 450;

// Focus Trend — Mon…Sun, scale 0–12 (matches the Figma y-axis).
const BARS = [
  { label: "Mon", v: 5 },
  { label: "Tue", v: 6.5 },
  { label: "Wed", v: 5 },
  { label: "Thu", v: 8 },
  { label: "Fri", v: 6 },
  { label: "Sat", v: 1.5 },
  { label: "Sun", v: 0.8 },
];
const Y_MAX = 12;

// Distraction Breakdown — order round the ring.
const SEGMENTS = [
  { label: "Finished task early", pct: 45, color: TEAL },
  { label: "Colleague or message", pct: 30, color: BRAND },
  { label: "Quick break", pct: 15, color: LIGHT_VIOLET },
  { label: "Phone/Social", pct: 10, color: GREY },
];

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function AnalyticsMockup() {
  const [barsOn, setBarsOn] = useState(prefersReduced);
  const [pieOn, setPieOn] = useState(prefersReduced);
  // True only during the close phase — switches both charts to the shared,
  // un-staggered CLOSE_MS transition so they collapse as one motion.
  const [closing, setClosing] = useState(false);
  // Pause the chart choreography while the mockup is scrolled off-screen.
  const [rootRef, inView] = useInView<HTMLDivElement>();

  useEffect(() => {
    if (prefersReduced() || !inView) return;
    // Open in sequence (grow bars → draw snake → hold), then close BOTH charts
    // at once: same duration, no stagger, so they start and finish together.
    let step = 0;
    let id: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (step === 0) {
        setClosing(false);
        setBarsOn(true); // grow bars (staggered)
        step = 1;
        id = setTimeout(tick, 1000);
      } else if (step === 1) {
        setPieOn(true); // draw the snake, then hold
        step = 2;
        id = setTimeout(tick, OPEN_PIE_MS + 1600);
      } else {
        setClosing(true); // collapse bars + empty snake in lockstep
        setBarsOn(false);
        setPieOn(false);
        step = 0;
        id = setTimeout(tick, CLOSE_MS + 200);
      }
    };
    id = setTimeout(tick, 500);
    return () => clearTimeout(id);
  }, [inView]);

  return (
    <div
      ref={rootRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: "#F2ECFE", containerType: "inline-size" }}
    >
      {/* .mockup-inner supplies --mu — one design unit (1cqw × --ms, styles.css)
          applied to EVERY dimension below, so each panel is an exact
          proportional replica of the 640px desktop design at any card width.
          Side/bottom frame padding stays in plain cqw (canvas framing); the TOP
          padding scales with --mu so the header gets proportionally more air on
          the enlarged mobile card (where plain-cqw framing reads as cramped).
          The generously tall charts (flex-1) absorb the extra top space. */}
      <div className="mockup-inner absolute inset-0 flex flex-col px-[3cqw] pb-[2.6cqw] pt-[calc(4*var(--mu))]">
        {/* Header — title + one-line subtitle, mirroring the Integrations panel. */}
        <div
          className="rounded-[calc(1.4*var(--mu))] border border-[#E5E7EB] bg-white px-[calc(2.2*var(--mu))] py-[calc(1.4*var(--mu))]"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <span
            className="block text-[calc(2.3*var(--mu))] leading-none text-[#0B0B0B]"
            style={{ fontWeight: "var(--mock-title)" }}
          >
            Analytics
          </span>
          <p className="mt-[calc(1*var(--mu))] text-[calc(1.3*var(--mu))] leading-snug text-[#6B7280]">
            Track your deep work capacity and where your focus time goes.
          </p>
        </div>

        {/* Tabs + Weekly/Monthly toggle */}
        <div className="mt-[calc(2*var(--mu))] flex items-center justify-between border-b border-[#E5E7EB] pb-[calc(1.2*var(--mu))]">
          <div className="flex items-end gap-[calc(2.4*var(--mu))]">
            <span className="relative pb-[calc(0.6*var(--mu))] text-[calc(1.5*var(--mu))] font-semibold text-[#0B0B0B]">
              My Stats
              <span
                className="absolute inset-x-0 bottom-0 h-[max(calc(0.2*var(--mu)),1.5px)] rounded-full"
                style={{ background: BRAND }}
              />
            </span>
            <span className="text-[calc(1.5*var(--mu))] font-semibold text-[#737373]">
              Team Insights
            </span>
          </div>
          <div
            className="flex items-center gap-[calc(0.4*var(--mu))] rounded-[calc(1.2*var(--mu))] border border-[#E5E7EB] p-[calc(0.4*var(--mu))]"
            style={{ background: "#F2ECFE" }}
          >
            <span
              className="rounded-[calc(0.9*var(--mu))] px-[calc(1.5*var(--mu))] py-[calc(0.5*var(--mu))] text-[calc(1.35*var(--mu))] font-medium text-white"
              style={{ background: BRAND, boxShadow: CARD_SHADOW }}
            >
              Weekly
            </span>
            <span className="rounded-[calc(0.9*var(--mu))] px-[calc(1.5*var(--mu))] py-[calc(0.5*var(--mu))] text-[calc(1.35*var(--mu))] font-medium text-[#737373]">
              Monthly
            </span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-[calc(2*var(--mu))] grid grid-cols-3 gap-[calc(1.4*var(--mu))]">
          <StatCard
            Icon={Clock}
            label="Total Focus Time"
            value="32h 15m"
            delta="+12% vs last week"
          />
          <StatCard Icon={CalendarDays} label="Daily Average" value="6h 25m" delta="+5%" />
          <StatCard Icon={Award} label="Focus Score" value="88/100" delta="Excellent" />
        </div>

        {/* Charts — side-by-side on desktop, stacked in narrow cards (styles.css) */}
        <div className="mockup-grid-charts mt-[calc(1.8*var(--mu))] min-h-0 flex-1 gap-[calc(1.4*var(--mu))]">
          {/* Focus Trend — bar chart */}
          <div
            className="flex min-h-0 flex-col rounded-[calc(1.6*var(--mu))] border border-[#E5E7EB] bg-white p-[calc(1.8*var(--mu))]"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <span className="text-[calc(1.5*var(--mu))] font-semibold leading-none text-[#0B0B0B]">
              Focus Trend
            </span>
            <div className="mt-[calc(1.4*var(--mu))] flex min-h-0 flex-1 gap-[calc(1*var(--mu))]">
              {/* y-axis */}
              <div className="flex flex-col justify-between py-[calc(0.2*var(--mu))] text-right text-[calc(1*var(--mu))] leading-none text-[#9CA3AF]">
                {[12, 9, 6, 3, 0].map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
              {/* plot */}
              <div className="relative flex min-h-0 flex-1 flex-col">
                {/* gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-px w-full bg-[#F1F1F4]" />
                  ))}
                </div>
                {/* bars */}
                <div className="relative flex flex-1 items-end justify-between gap-[calc(1.1*var(--mu))]">
                  {BARS.map((b, i) => (
                    <div
                      key={b.label}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <div
                        className="flex w-full items-end justify-center"
                        style={{ height: `${(b.v / Y_MAX) * 100}%` }}
                      >
                        <div
                          className="w-[80%] rounded-t-[calc(0.5*var(--mu))]"
                          style={{
                            height: "100%",
                            transformOrigin: "bottom",
                            transform: barsOn ? "scaleY(1)" : "scaleY(0)",
                            transition: closing
                              ? `transform ${CLOSE_MS}ms ease`
                              : `transform 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 70}ms`,
                            background: `linear-gradient(180deg, ${LIGHT_VIOLET} 0%, ${BRAND} 100%)`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* x-axis labels */}
                <div className="mt-[calc(0.7*var(--mu))] flex justify-between gap-[calc(1.1*var(--mu))] text-[calc(1.05*var(--mu))] leading-none text-[#9CA3AF]">
                  {BARS.map((b) => (
                    <span key={b.label} className="flex-1 text-center">
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Distraction Breakdown — donut + legend */}
          <div
            className="flex min-h-0 flex-col rounded-[calc(1.6*var(--mu))] border border-[#E5E7EB] bg-white p-[calc(1.8*var(--mu))]"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <span className="text-[calc(1.5*var(--mu))] font-semibold leading-none text-[#0B0B0B]">
              Distraction Breakdown
            </span>
            <div className="mt-[calc(1*var(--mu))] flex min-h-0 flex-1 items-center gap-[calc(2*var(--mu))]">
              <Donut on={pieOn} closing={closing} />
              <ul className="flex flex-col gap-[calc(1*var(--mu))]">
                {SEGMENTS.map((s) => (
                  <li key={s.label} className="flex items-center gap-[calc(1*var(--mu))]">
                    <span
                      className="shrink-0 rounded-full"
                      style={{
                        width: "calc(1.1 * var(--mu))",
                        height: "calc(1.1 * var(--mu))",
                        background: s.color,
                      }}
                    />
                    <div className="flex flex-col leading-none">
                      <span className="text-[calc(1.2*var(--mu))] text-[#0B0B0B]">{s.label}</span>
                      <span className="mt-[calc(0.3*var(--mu))] text-[calc(1.05*var(--mu))] text-[#737373]">
                        {s.pct}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  Icon,
  label,
  value,
  delta,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div
      className="flex flex-col rounded-[calc(1.6*var(--mu))] border border-[#E5E7EB] bg-white p-[calc(1.6*var(--mu))]"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-[calc(1.2*var(--mu))] leading-tight text-[#737373]">{label}</span>
          <span
            className="mt-[calc(0.8*var(--mu))] text-[calc(var(--mock-stat)*var(--mu))] leading-none text-[#0B0B0B]"
            style={{ fontWeight: "var(--mock-bold)" }}
          >
            {value}
          </span>
        </div>
        <span
          className="flex shrink-0 items-center justify-center rounded-[calc(1*var(--mu))]"
          style={{
            width: "calc(3.4 * var(--mu))",
            height: "calc(3.4 * var(--mu))",
            background: "rgba(110,86,207,0.1)",
          }}
        >
          {/* 3.75 units = the 24px lucide default at the 640px reference width,
              so desktop is unchanged and narrow cards scale it with the tile. */}
          <Icon
            className="h-[calc(3.75*var(--mu))] w-[calc(3.75*var(--mu))] text-[#6E56CF]"
            strokeWidth={2}
          />
        </span>
      </div>
      <div
        className="mt-[calc(1.1*var(--mu))] flex items-center gap-[calc(0.6*var(--mu))]"
        style={{ color: GREEN }}
      >
        <TrendingUp className="h-[calc(1.4*var(--mu))] w-[calc(1.4*var(--mu))]" strokeWidth={2.5} />
        <span className="text-[calc(1.2*var(--mu))] font-medium leading-none">{delta}</span>
      </div>
    </div>
  );
}

function Donut({ on, closing }: { on: boolean; closing: boolean }) {
  const R = 32;
  const SW = 13;
  const maskId = useId();

  // Static multi-colour ring; a single white arc sweeps over it as one mask so
  // the fill AND the empty read as one continuous "snake" (never per-segment).
  let cum = 0;
  const segs = SEGMENTS.map((s) => {
    const seg = { ...s, start: cum };
    cum += s.pct;
    return seg;
  });

  return (
    <svg viewBox="0 0 100 100" style={{ width: "40%", height: "auto", flexShrink: 0 }}>
      <defs>
        <mask id={maskId}>
          {/* black hides, the growing white arc reveals — one continuous sweep */}
          <rect x="0" y="0" width="100" height="100" fill="black" />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="#fff"
            strokeWidth={SW + 2}
            pathLength={100}
            transform="rotate(-90 50 50)"
            style={{
              strokeLinecap: "butt",
              strokeDasharray: on ? "100 100" : "0 100",
              transition: closing
                ? `stroke-dasharray ${CLOSE_MS}ms ease`
                : `stroke-dasharray ${OPEN_PIE_MS}ms linear`,
            }}
          />
        </mask>
      </defs>

      {/* track (always visible) */}
      <circle cx="50" cy="50" r={R} fill="none" stroke="#F1F1F4" strokeWidth={SW} />

      {/* colour segments, static, revealed by the sweeping mask */}
      <g mask={`url(#${maskId})`}>
        {segs.map((s) => (
          <circle
            key={s.label}
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={SW}
            pathLength={100}
            strokeLinecap="butt"
            strokeDasharray={`${s.pct} 100`}
            transform={`rotate(${s.start * 3.6 - 90} 50 50)`}
          />
        ))}
      </g>
    </svg>
  );
}
