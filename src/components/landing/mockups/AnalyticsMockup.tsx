import { useEffect, useId, useState } from "react";
import { Clock, CalendarDays, Award, TrendingUp } from "lucide-react";

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
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function AnalyticsMockup() {
  const [barsOn, setBarsOn] = useState(prefersReduced);
  const [pieOn, setPieOn] = useState(prefersReduced);

  useEffect(() => {
    if (prefersReduced()) return;
    // Fully sequenced so nothing overlaps: grow bars → draw snake → hold →
    // empty snake (bars stay) → collapse bars → loop.
    let step = 0;
    let id: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (step === 0) {
        setBarsOn(true); // grow bars
        step = 1;
        id = setTimeout(tick, 1000);
      } else if (step === 1) {
        setPieOn(true); // draw the snake (0.8s), then hold
        step = 2;
        id = setTimeout(tick, 800 + 1600);
      } else if (step === 2) {
        setPieOn(false); // empty the snake — wait until it's fully gone
        step = 3;
        id = setTimeout(tick, 800 + 250);
      } else {
        setBarsOn(false); // only now collapse the bars, then loop
        step = 0;
        id = setTimeout(tick, 700);
      }
    };
    id = setTimeout(tick, 500);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: "#F2ECFE", containerType: "inline-size" }}
    >
      {/* .mockup-inner supplies --ms — a type multiplier that steps up as the
          card narrows (see styles.css) so the UI stays readable in the phone
          carousel while staying bit-identical on the 640px desktop stack. */}
      <div className="mockup-inner absolute inset-0 flex flex-col p-[3cqw]">
        {/* Header */}
        <div
          className="flex items-center rounded-[1.4cqw] border border-[#E5E7EB] bg-white px-[2.2cqw] py-[1.4cqw]"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <span className="text-[calc(2.3cqw*var(--ms))] font-bold leading-none text-[#0B0B0B]">Analytics</span>
        </div>

        {/* Tabs + Weekly/Monthly toggle */}
        <div className="mt-[2cqw] flex items-center justify-between border-b border-[#E5E7EB] pb-[1.2cqw]">
          <div className="flex items-end gap-[2.4cqw]">
            <span className="relative pb-[0.6cqw] text-[calc(1.5cqw*var(--ms))] font-semibold text-[#0B0B0B]">
              My Stats
              <span
                className="absolute inset-x-0 bottom-0 h-[max(0.2cqw,1.5px)] rounded-full"
                style={{ background: BRAND }}
              />
            </span>
            <span className="text-[calc(1.5cqw*var(--ms))] font-semibold text-[#737373]">Team Insights</span>
          </div>
          <div
            className="flex items-center gap-[0.4cqw] rounded-[1.2cqw] border border-[#E5E7EB] p-[0.4cqw]"
            style={{ background: "#F2ECFE" }}
          >
            <span
              className="rounded-[0.9cqw] px-[1.5cqw] py-[0.5cqw] text-[calc(1.35cqw*var(--ms))] font-medium text-white"
              style={{ background: BRAND, boxShadow: CARD_SHADOW }}
            >
              Weekly
            </span>
            <span className="rounded-[0.9cqw] px-[1.5cqw] py-[0.5cqw] text-[calc(1.35cqw*var(--ms))] font-medium text-[#737373]">
              Monthly
            </span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-[2cqw] grid grid-cols-3 gap-[1.4cqw]">
          <StatCard Icon={Clock} label="Total Focus Time" value="32h 15m" delta="+12% vs last week" />
          <StatCard Icon={CalendarDays} label="Daily Average" value="6h 25m" delta="+5%" />
          <StatCard Icon={Award} label="Focus Score" value="88/100" delta="Excellent" />
        </div>

        {/* Charts — side-by-side on desktop, stacked in narrow cards (styles.css) */}
        <div className="mockup-grid-charts mt-[1.8cqw] min-h-0 flex-1 gap-[1.4cqw]">
          {/* Focus Trend — bar chart */}
          <div
            className="flex min-h-0 flex-col rounded-[1.6cqw] border border-[#E5E7EB] bg-white p-[1.8cqw]"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <span className="text-[calc(1.5cqw*var(--ms))] font-semibold leading-none text-[#0B0B0B]">Focus Trend</span>
            <div className="mt-[1.4cqw] flex min-h-0 flex-1 gap-[1cqw]">
              {/* y-axis */}
              <div className="flex flex-col justify-between py-[0.2cqw] text-right text-[calc(1cqw*var(--ms))] leading-none text-[#9CA3AF]">
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
                <div className="relative flex flex-1 items-end justify-between gap-[1.1cqw]">
                  {BARS.map((b, i) => (
                    <div key={b.label} className="flex h-full flex-1 flex-col items-center justify-end">
                      <div className="flex w-full items-end justify-center" style={{ height: `${(b.v / Y_MAX) * 100}%` }}>
                        <div
                          className="w-[80%] rounded-t-[0.5cqw]"
                          style={{
                            height: "100%",
                            transformOrigin: "bottom",
                            transform: barsOn ? "scaleY(1)" : "scaleY(0)",
                            transition: `transform 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 70}ms`,
                            background: `linear-gradient(180deg, ${LIGHT_VIOLET} 0%, ${BRAND} 100%)`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* x-axis labels */}
                <div className="mt-[0.7cqw] flex justify-between gap-[1.1cqw] text-[calc(1.05cqw*var(--ms))] leading-none text-[#9CA3AF]">
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
            className="flex min-h-0 flex-col rounded-[1.6cqw] border border-[#E5E7EB] bg-white p-[1.8cqw]"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <span className="text-[calc(1.5cqw*var(--ms))] font-semibold leading-none text-[#0B0B0B]">
              Distraction Breakdown
            </span>
            <div className="mt-[1cqw] flex min-h-0 flex-1 items-center gap-[2cqw]">
              <Donut on={pieOn} />
              <ul className="flex flex-col gap-[1cqw]">
                {SEGMENTS.map((s) => (
                  <li key={s.label} className="flex items-center gap-[1cqw]">
                    <span
                      className="shrink-0 rounded-full"
                      style={{
                        width: "calc(1.1cqw * var(--ms))",
                        height: "calc(1.1cqw * var(--ms))",
                        background: s.color,
                      }}
                    />
                    <div className="flex flex-col leading-none">
                      <span className="text-[calc(1.2cqw*var(--ms))] text-[#0B0B0B]">{s.label}</span>
                      <span className="mt-[0.3cqw] text-[calc(1.05cqw*var(--ms))] text-[#737373]">{s.pct}%</span>
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
      className="flex flex-col rounded-[1.6cqw] border border-[#E5E7EB] bg-white p-[1.6cqw]"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-[calc(1.2cqw*var(--ms))] leading-tight text-[#737373]">{label}</span>
          <span className="mt-[0.8cqw] text-[calc(2.2cqw*var(--ms))] font-bold leading-none text-[#0B0B0B]">
            {value}
          </span>
        </div>
        <span
          className="flex shrink-0 items-center justify-center rounded-[1cqw]"
          style={{
            width: "calc(3.4cqw * var(--ms))",
            height: "calc(3.4cqw * var(--ms))",
            background: "rgba(110,86,207,0.1)",
          }}
        >
          <Icon className="text-[#6E56CF]" strokeWidth={2} />
        </span>
      </div>
      <div className="mt-[1.1cqw] flex items-center gap-[0.6cqw]" style={{ color: GREEN }}>
        <TrendingUp className="h-[calc(1.4cqw*var(--ms))] w-[calc(1.4cqw*var(--ms))]" strokeWidth={2.5} />
        <span className="text-[calc(1.2cqw*var(--ms))] font-medium leading-none">{delta}</span>
      </div>
    </div>
  );
}

function Donut({ on }: { on: boolean }) {
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
              transition: "stroke-dasharray 0.8s linear",
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
