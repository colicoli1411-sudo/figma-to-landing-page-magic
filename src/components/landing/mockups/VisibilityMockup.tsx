import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Users } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

/**
 * "Team Focus Visibility" feature mockup.
 *
 * Concept: the real Focus Flow dashboard sits blurred in the background while the
 * authentic Team Flow panel is pulled forward, sharp and highlighted — mirroring
 * the in-product card from the hero mockup (HeroMockup → TeamFlowCard).
 *
 * Everything is sized in container-query units (cqw) against a 640px reference
 * width, so the panel keeps the exact same proportions on the desktop card stack
 * and the mobile carousel without clipping.
 */

type Status = "available" | "deep-work" | "break";

/** The three default statuses, in the order each member cycles through them. */
const STATUS_ORDER: Status[] = ["available", "deep-work", "break"];

const STATUS_STYLES: Record<Status, { label: string; bg: string; color: string; glow: string }> = {
  available: {
    label: "Available",
    bg: "#d1fae5",
    color: "#047857",
    glow: "0 0 10px rgba(135,212,196,0.35)",
  },
  "deep-work": {
    label: "In Deep Work",
    bg: "rgba(110,86,207,0.1)",
    color: "#6E56CF",
    glow: "0 0 10px rgba(170,153,236,0.4)",
  },
  break: {
    label: "On Break",
    bg: "#e5e7eb",
    color: "#374151",
    glow: "0 0 10px rgba(107,114,128,0.25)",
  },
};

const MEMBERS: {
  initials: string;
  name: string;
  status: Status;
  avatar: string;
}[] = [
  { initials: "V", name: "Avi (You)", status: "available", avatar: "/images/avi-avatar.png" },
  { initials: "SC", name: "Sarah Chen", status: "deep-work", avatar: "/images/sarah-chen.jpg" },
  {
    initials: "MR",
    name: "Marcus Rodriguez",
    status: "deep-work",
    avatar: "/images/marcus-rodriguez.jpg",
  },
  { initials: "EW", name: "Emma Wilson", status: "available", avatar: "/images/emma-wilson.jpg" },
  { initials: "JP", name: "James Park", status: "available", avatar: "/images/james-park.jpg" },
  {
    initials: "OM",
    name: "Olivia Martinez",
    status: "break",
    avatar: "/images/olivia-martinez.jpg",
  },
];

export function VisibilityMockup() {
  // Each member's current status, as an index into STATUS_ORDER. A "wave" sweeps
  // down the list (first → last), advancing one member's status per tick, then
  // loops — so the board keeps evolving every few seconds.
  const [statusIdx, setStatusIdx] = useState<number[]>(() =>
    MEMBERS.map((m) => STATUS_ORDER.indexOf(m.status)),
  );
  // Pause the status-wave loop while the mockup is scrolled off-screen.
  const [rootRef, inView] = useInView<HTMLDivElement>();

  useEffect(() => {
    if (!inView) return;
    const STEP = 650; // gap between consecutive members in a sweep
    const PAUSE = 2000; // hold after a full sweep, before it restarts
    let member = 0;
    let id: ReturnType<typeof setTimeout>;

    const tick = () => {
      setStatusIdx((prev) => {
        const next = [...prev];
        next[member] = (next[member] + 1) % STATUS_ORDER.length;
        return next;
      });
      const wasLast = member === MEMBERS.length - 1;
      member = (member + 1) % MEMBERS.length;
      // Pause for 2s once the wave reaches the last member, then loop.
      id = setTimeout(tick, wasLast ? PAUSE : STEP);
    };

    id = setTimeout(tick, STEP);
    return () => clearTimeout(id);
  }, [inView]);

  return (
    <div
      ref={rootRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: "#EDE9FE", containerType: "inline-size" }}
    >
      {/* ---------- Blurred app background (sidebar collapsed) ---------- */}
      {/* Just the purple app canvas with the content panel floating on it — the
          sidebar is closed, so the left stays purple instead of a white rail.
          On mobile the panel spans full width (there was never a sidebar there);
          on sm+ it's inset from the left where the sidebar used to sit. */}
      <div className="absolute inset-0" style={{ filter: "blur(3px)" }} aria-hidden>
        <div className="h-full p-[4cqw]">
          {/* App header bar */}
          <div className="mb-[2.6cqw] flex items-center justify-between rounded-[1.8cqw] border border-[#e5e7eb] bg-white px-[2.4cqw] py-[1.8cqw]">
            <div className="flex flex-col gap-[1cqw]">
              <div className="h-[1.9cqw] w-[15cqw] rounded bg-neutral-300" />
              <div className="h-[1.2cqw] w-[22cqw] rounded bg-neutral-200" />
            </div>
            <div className="h-[3.4cqw] w-[16cqw] rounded-full bg-[rgba(110,86,207,0.12)]" />
          </div>

          {/* Focus timer card */}
          <div className="flex items-center justify-center rounded-[1.8cqw] border border-[#e5e7eb] bg-white py-[6cqw]">
            <div className="relative flex aspect-square w-[27cqw] items-center justify-center rounded-full border-[1.1cqw] border-[rgba(110,86,207,0.18)]">
              <span className="text-[5.2cqw] font-bold leading-none text-[#0b0b0b]">25:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Focus scrim: pushes the background back ---------- */}
      <div className="absolute inset-0 bg-white/35" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 78% at 70% 50%, rgba(110,86,207,0.10) 0%, transparent 62%)",
        }}
      />

      {/* ---------- Sharp, authentic Team Flow panel ----------
          .mockup-inner supplies --mu (one uniform design unit — see styles.css)
          so the panel scales as an intact replica of its desktop self, and
          .mockup-vis-panel widens it on narrow cards. */}
      <div
        className="mockup-inner mockup-vis-panel absolute right-[3.5%] top-1/2 -translate-y-1/2 rounded-[calc(2.4*var(--mu))] border border-[#e5e7eb] bg-white p-[calc(2.4*var(--mu))] ring-1 ring-violet-100"
        style={{
          boxShadow:
            "0 22px 48px -18px rgba(31,29,66,0.45), 0 10px 24px -16px rgba(110,86,207,0.32)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-[calc(1.6*var(--mu))]">
          <div className="flex h-[calc(4.4*var(--mu))] w-[calc(4.4*var(--mu))] items-center justify-center rounded-[calc(1.5*var(--mu))] bg-[rgba(110,86,207,0.2)]">
            <Users className="h-[calc(2.5*var(--mu))] w-[calc(2.5*var(--mu))] text-[#6E56CF]" />
          </div>
          <h3
            className="text-[calc(2.2*var(--mu))] leading-none text-[#111827]"
            style={{ fontWeight: "var(--mock-title)" }}
          >
            Team Flow
          </h3>
        </div>

        <div className="my-[calc(1.8*var(--mu))] h-px bg-[#e5e7eb]" />

        {/* Members */}
        <ul className="flex flex-col gap-[calc(0.7*var(--mu))]">
          {MEMBERS.map((m, i) => {
            const status = STATUS_ORDER[statusIdx[i]];
            const s = STATUS_STYLES[status];
            const isYou = i === 0;
            return (
              <li
                key={m.name}
                className="flex items-center gap-[calc(1.5*var(--mu))] rounded-[calc(1.6*var(--mu))] p-[calc(0.9*var(--mu))]"
                style={isYou ? { background: "#EDE9FE" } : undefined}
              >
                <img
                  src={m.avatar}
                  alt={m.name}
                  width={36}
                  height={36}
                  loading="lazy"
                  decoding="async"
                  className="h-[calc(4*var(--mu))] w-[calc(4*var(--mu))] shrink-0 rounded-full border border-[rgba(110,86,207,0.4)] object-cover"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-[calc(0.5*var(--mu))]">
                  <span
                    className={`truncate text-[calc(1.75*var(--mu))] leading-none text-[#4b5563] ${
                      isYou ? "font-bold" : ""
                    }`}
                  >
                    {m.name}
                  </span>
                  {/* Status pill swaps with a quick fade/scale each time this
                      member's status changes in the wave. */}
                  <div className="flex">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={status}
                        className="inline-flex w-fit items-center rounded-[calc(1.6*var(--mu))] px-[calc(1*var(--mu))] py-[calc(0.45*var(--mu))] text-[calc(1.4*var(--mu))] leading-none"
                        style={{ background: s.bg, color: s.color, boxShadow: s.glow }}
                        initial={{ opacity: 0, y: 3, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -3, scale: 0.85 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {s.label}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="mt-[calc(1.8*var(--mu))] flex items-center justify-between border-t border-[#e5e7eb] pt-[calc(1.6*var(--mu))] text-[calc(1.7*var(--mu))]">
          <span className="text-[#737373]">In deep work</span>
          <span className="font-semibold italic text-[#0b0b0b]">2/5 members</span>
        </div>
      </div>
    </div>
  );
}
