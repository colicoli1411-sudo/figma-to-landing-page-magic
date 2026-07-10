import { useEffect, useState } from "react";
import { useInView } from "@/hooks/use-in-view";
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
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CARD_SHADOW = "0px 1px 2px -1px rgba(0,0,0,0.05), 0px 1px 3px 0px rgba(0,0,0,0.08)";

export function MuteMockup() {
  // Reduced motion → show the resolved "all muted" state, no looping animation.
  const [on, setOn] = useState<boolean[]>(() => Array(APPS.length).fill(prefersReduced()));
  // Pause the demo loop entirely while the mockup is scrolled off-screen.
  const [rootRef, inView] = useInView<HTMLDivElement>();

  useEffect(() => {
    if (prefersReduced() || !inView) return;

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
          Only the frame padding (.mockup-mute-frame, styles.css) stays outside
          the unit — it's canvas framing, not product UI, and it tightens on
          narrow cards to hand its width back to the app grid. */}
      <div className="mockup-inner mockup-mute-frame absolute inset-0 flex flex-col justify-center">
        {/* Header */}
        <div
          className="rounded-[calc(1.4*var(--mu))] border border-[#E5E7EB] bg-white px-[calc(2.2*var(--mu))] py-[calc(1.9*var(--mu))]"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <h3
            className="text-[calc(2.6*var(--mu))] leading-none text-[#111827]"
            style={{ fontWeight: "var(--mock-title)" }}
          >
            Integrations
          </h3>
          <p className="mt-[calc(1*var(--mu))] text-[calc(1.3*var(--mu))] leading-snug text-[#6B7280]">
            Select which applications are automatically muted during your deep work sessions.
          </p>
        </div>

        {/* App grid — 3-up on desktop, 2-up in narrow cards (styles.css) */}
        <div className="mockup-grid-apps mt-[calc(2.6*var(--mu))] items-start gap-[calc(2*var(--mu))]">
          {APPS.map((app, i) => (
            <AppCard key={app.name} app={app} on={on[i]} />
          ))}
        </div>

        {/* Info bar */}
        <div
          className="mt-[calc(2.4*var(--mu))] flex items-start gap-[calc(1.6*var(--mu))] rounded-[calc(1.4*var(--mu))] border border-[#E5E7EB] bg-white p-[calc(1.9*var(--mu))]"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <div
            className="flex shrink-0 items-center justify-center rounded-[calc(1.2*var(--mu))]"
            style={{
              width: "calc(3.3 * var(--mu))",
              height: "calc(3.3 * var(--mu))",
              background: "rgba(110,86,207,0.1)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              style={{ width: "calc(1.7 * var(--mu))", height: "calc(1.7 * var(--mu))" }}
            >
              <circle cx="12" cy="12" r="9" stroke="#6E56CF" strokeWidth="2" />
              <path d="M12 11v5M12 8h.01" stroke="#6E56CF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[calc(1.35*var(--mu))] font-semibold leading-none text-[#111827]">
              How do integrations work?
            </div>
            <p className="mt-[calc(0.9*var(--mu))] text-[calc(1.15*var(--mu))] leading-snug text-[#6B7280]">
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
      className="flex flex-col rounded-[calc(1.5*var(--mu))] border border-[#E5E7EB] bg-white p-[calc(2*var(--mu))]"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <div className="flex items-center gap-[calc(1.4*var(--mu))]">
        {/* Icon tile — grey when muted-off, brand-tinted when active */}
        <div
          className="flex shrink-0 items-center justify-center rounded-[calc(1.4*var(--mu))]"
          style={{
            width: "calc(4.2 * var(--mu))",
            height: "calc(4.2 * var(--mu))",
            borderWidth: "max(calc(0.16 * var(--mu)), 1px)",
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
            <Icon style={{ width: "calc(2.2 * var(--mu))", height: "calc(2.2 * var(--mu))" }} />
          </div>
        </div>

        {/* Title + description */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[calc(1.45*var(--mu))] font-semibold leading-tight text-[#111827]">
            {name}
          </div>
          <div className="mt-[calc(0.4*var(--mu))] truncate text-[calc(1.2*var(--mu))] leading-tight text-[#6B7280]">
            {desc}
          </div>
        </div>

        {/* Switch */}
        <div
          className="flex shrink-0 items-center rounded-full p-[calc(0.24*var(--mu))]"
          style={{
            width: "calc(3.2 * var(--mu))",
            height: "calc(1.9 * var(--mu))",
            backgroundColor: on ? ON_TRACK : OFF_TRACK,
            transition: "background-color 0.35s ease",
          }}
        >
          <div
            className="rounded-full bg-white"
            style={{
              width: "calc(1.42 * var(--mu))",
              height: "calc(1.42 * var(--mu))",
              boxShadow: "0 calc(0.15 * var(--mu)) calc(0.3 * var(--mu)) rgba(0,0,0,0.2)",
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
            className="flex items-center gap-[calc(1*var(--mu))] border-t border-[#E5E7EB] pt-[calc(1.4*var(--mu))]"
            style={{ marginTop: "calc(1.5 * var(--mu))" }}
          >
            <span
              className="shrink-0 rounded-full"
              style={{
                width: "calc(0.85 * var(--mu))",
                height: "calc(0.85 * var(--mu))",
                background: ON_TRACK,
              }}
            />
            <span
              className="text-[calc(1.15*var(--mu))] font-medium leading-none"
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
