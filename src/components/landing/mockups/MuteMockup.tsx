import { useEffect, useState } from "react";
import {
  SlackIcon,
  DiscordIcon,
  WhatsAppIcon,
  TeamsIcon,
  FigmaIcon,
  GmailIcon,
} from "../BrandIcons";

/**
 * "Auto-Mute Distractions" feature mockup.
 *
 * A live recreation of the in-product Integrations panel (from Figma): six app
 * cards start fully OFF, then switch ON one-by-one — row 1 left→right, then
 * row 2 — each flipping its toggle to green, tinting its icon tile in the app's
 * brand colour, and revealing an "Active during Focus Sessions" row (the card
 * grows). Once all six are on it holds a few seconds, then every toggle turns
 * off together and the sequence loops.
 *
 * Sized in container-query units (cqw) against the card width so it keeps its
 * proportions on the desktop stack and the mobile carousel. Toggle visuals are
 * driven by plain CSS transitions (no JS animation loop) so they can't flash or
 * stall.
 */

type App = {
  name: string;
  desc: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Brand colour used for the icon tile tint in the ON state. */
  color: string;
};

// Row-major order = the toggle-on order (row 1 L→R, then row 2 L→R).
const APPS: App[] = [
  { name: "Slack", desc: "Mute all notifications", Icon: SlackIcon, color: "#E01E5A" },
  { name: "Discord", desc: "Allow direct messages only", Icon: DiscordIcon, color: "#5865F2" },
  { name: "WhatsApp", desc: "Mute all notifications", Icon: WhatsAppIcon, color: "#25D366" },
  { name: "Microsoft Teams", desc: "Mute all notifications", Icon: TeamsIcon, color: "#6264A7" },
  { name: "Figma", desc: "Disable notifications", Icon: FigmaIcon, color: "#F24E1E" },
  { name: "Gmail", desc: "Pause inbox notifications", Icon: GmailIcon, color: "#EA4335" },
];

const ON_TRACK = "#34D399"; // emerald switch track + "active" accent
const OFF_TRACK = "#E5E5E5";

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CARD_SHADOW =
  "0px 1px 2px -1px rgba(0,0,0,0.05), 0px 1px 3px 0px rgba(0,0,0,0.08)";

export function MuteMockup() {
  // Reduced motion → show the resolved "all muted" state, no looping animation.
  const [on, setOn] = useState<boolean[]>(() => Array(APPS.length).fill(prefersReduced()));

  useEffect(() => {
    if (prefersReduced()) return;

    const STAGGER = 620; // gap between consecutive cards switching on
    const HOLD = 3000; // hold once all are on
    const RESET_GAP = 1100; // beat after the simultaneous reset, before replay
    const START = 700; // initial beat before the first card flips

    let step = 0; // 0..5 flip card `step` on · 6 hold · 7 reset+loop
    let id: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (step < APPS.length) {
        const i = step;
        setOn((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        step++;
        id = setTimeout(tick, STAGGER);
      } else if (step === APPS.length) {
        step++;
        id = setTimeout(tick, HOLD);
      } else {
        setOn(Array(APPS.length).fill(false)); // all off together
        step = 0;
        id = setTimeout(tick, RESET_GAP);
      }
    };

    id = setTimeout(tick, START);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: "#F2ECFE", containerType: "inline-size" }}
    >
      <div className="absolute inset-0 flex flex-col justify-center px-[4.5cqw] py-[4cqw]">
        {/* Header */}
        <div
          className="rounded-[1.4cqw] border border-[#E5E7EB] bg-white px-[2.2cqw] py-[1.9cqw]"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <h3 className="text-[2.6cqw] font-bold leading-none text-[#111827]">Integrations</h3>
          <p className="mt-[1cqw] text-[1.3cqw] leading-snug text-[#6B7280]">
            Select which applications are automatically muted during your deep work sessions.
          </p>
        </div>

        {/* App grid */}
        <div className="mt-[2.6cqw] grid grid-cols-3 items-start gap-[2cqw]">
          {APPS.map((app, i) => (
            <AppCard key={app.name} app={app} on={on[i]} />
          ))}
        </div>

        {/* Info bar */}
        <div
          className="mt-[2.4cqw] flex items-start gap-[1.6cqw] rounded-[1.4cqw] border border-[#E5E7EB] bg-white p-[1.9cqw]"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <div
            className="flex shrink-0 items-center justify-center rounded-[1.2cqw]"
            style={{ width: "3.3cqw", height: "3.3cqw", background: "rgba(110,86,207,0.1)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" style={{ width: "1.7cqw", height: "1.7cqw" }}>
              <circle cx="12" cy="12" r="9" stroke="#6E56CF" strokeWidth="2" />
              <path d="M12 11v5M12 8h.01" stroke="#6E56CF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[1.35cqw] font-semibold leading-none text-[#111827]">
              How do integrations work?
            </div>
            <p className="mt-[0.9cqw] text-[1.15cqw] leading-snug text-[#6B7280]">
              When you start a Focus Session, FocusFlow automatically mutes notifications from
              enabled apps. Once your session ends, they're restored to their previous state.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppCard({ app, on }: { app: App; on: boolean }) {
  const { name, desc, Icon, color } = app;
  return (
    <div
      className="flex flex-col rounded-[1.5cqw] border border-[#E5E7EB] bg-white p-[2cqw]"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <div className="flex items-center gap-[1.4cqw]">
        {/* Icon tile — grey when muted-off, brand-tinted when active */}
        <div
          className="flex shrink-0 items-center justify-center rounded-[1.4cqw]"
          style={{
            width: "4.2cqw",
            height: "4.2cqw",
            borderWidth: "0.16cqw",
            borderStyle: "solid",
            backgroundColor: on ? rgba(color, 0.08) : "#F5F5F5",
            borderColor: on ? rgba(color, 0.19) : "#E5E7EB",
            transition: "background-color 0.4s ease, border-color 0.4s ease",
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              filter: on ? "grayscale(0)" : "grayscale(1)",
              opacity: on ? 1 : 0.55,
              transition: "filter 0.4s ease, opacity 0.4s ease",
            }}
          >
            <Icon style={{ width: "2.2cqw", height: "2.2cqw" }} />
          </div>
        </div>

        {/* Title + description */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[1.45cqw] font-semibold leading-tight text-[#111827]">
            {name}
          </div>
          <div className="mt-[0.4cqw] truncate text-[1.2cqw] leading-tight text-[#6B7280]">
            {desc}
          </div>
        </div>

        {/* Switch */}
        <div
          className="flex shrink-0 items-center rounded-full p-[0.24cqw]"
          style={{
            width: "3.2cqw",
            height: "1.9cqw",
            backgroundColor: on ? ON_TRACK : OFF_TRACK,
            transition: "background-color 0.35s ease",
          }}
        >
          <div
            className="rounded-full bg-white"
            style={{
              width: "1.42cqw",
              height: "1.42cqw",
              boxShadow: "0 0.15cqw 0.3cqw rgba(0,0,0,0.2)",
              transform: on ? "translateX(87%)" : "translateX(0)",
              transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        </div>
      </div>

      {/* "Active during Focus Sessions" — grows the card in on the ON state.
          grid-template-rows 0fr→1fr animates height with pure CSS. */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: on ? "1fr" : "0fr",
          opacity: on ? 1 : 0,
          transition: "grid-template-rows 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div
            className="flex items-center gap-[1cqw] border-t border-[#E5E7EB] pt-[1.4cqw]"
            style={{ marginTop: "1.5cqw" }}
          >
            <span
              className="shrink-0 rounded-full"
              style={{ width: "0.85cqw", height: "0.85cqw", background: ON_TRACK }}
            />
            <span
              className="text-[1.15cqw] font-medium leading-none"
              style={{ color: ON_TRACK }}
            >
              Active during Focus Sessions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
