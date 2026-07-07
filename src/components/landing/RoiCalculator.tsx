import React, { useEffect, useMemo, useState } from "react";
import { SplitText } from "./SplitText";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { ArrowRight, Info } from "lucide-react";
import { IntegrationStrip } from "./Integrations";
import DotField from "./DotField";
import { cn } from "@/lib/utils";
import { CTA_PRIMARY, GlareHover } from "./cta";

/* ── Model constants (disclosed in the footnote so the numbers stay credible) ── */
const WORK_HOURS_PER_YEAR = 2080; // 52 weeks × 40h
const RECOVERY_RATE = 0.6; // FocusFlow reclaims ~60% of lost focus time
const CAPACITY_LOST_PCT = 20; // fixed industry stat (matches the headline claim)

/* Refined, softly-diffused elevation — mostly neutral ambient depth with just a
   faint brand-violet bloom far below the card (no heavy coloured halo). */
const CARD_SHADOW =
  "0 2px 4px rgba(16,24,40,0.03), 0 12px 28px -12px rgba(16,24,40,0.07), 0 44px 88px -40px rgba(110,86,207,0.14), inset 0 1px 0 rgba(255,255,255,0.85)";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Brand-violet slider (Radix primitives styled directly, since the shared
 *  ui/slider colours its range with the theme's dark `--primary`). */
function BrandSlider({
  value,
  min,
  max,
  step = 1,
  onValueChange,
  ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (v: number) => void;
  ariaLabel: string;
}) {
  return (
    <SliderPrimitive.Root
      className="relative flex w-full touch-none select-none items-center py-2"
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onValueChange(v[0])}
      aria-label={ariaLabel}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[rgba(110,86,207,0.15)]">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-[#6E56CF]" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="block h-5 w-5 rounded-full border-2 border-[#6E56CF] bg-white transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(110,86,207,0.4)] focus-visible:ring-offset-2"
        style={{ boxShadow: "0 2px 10px rgba(170,153,236,0.5)" }}
      />
    </SliderPrimitive.Root>
  );
}

/** A single labelled input row: caption + live value + slider. */
function InputRow({
  label,
  displayValue,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  displayValue: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[14px] font-medium text-[#4b5563]">{label}</span>
        <span className="text-[15px] font-bold tabular-nums text-[#1d1d23]">{displayValue}</span>
      </div>
      <BrandSlider
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={onChange}
        ariaLabel={label}
      />
    </div>
  );
}

/** Money value that smoothly counts up whenever `value` changes. */
function AnimatedMoney({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => currency.format(Math.round(v)));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.3, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv, reduce]);

  return <motion.span>{text}</motion.span>;
}

/** Card wrapper whose 2px border carries a conic-gradient glow that sweeps
 *  clockwise around the card continuously, pausing while hovered. */
function GlowBorder({ children }: { children: React.ReactNode }) {
  return (
    <div className="glow-border relative mx-auto max-w-4xl rounded-[26px] p-[2px]">{children}</div>
  );
}

export function RoiCalculator() {
  const [teamSize, setTeamSize] = useState(10);
  const [monthlySalary, setMonthlySalary] = useState(10000);

  const { moneySavedPerYear, hoursReclaimedPerWeek } = useMemo(() => {
    const p = CAPACITY_LOST_PCT / 100;
    const annualSalary = monthlySalary * 12;
    const reclaimedHoursPerYear = teamSize * WORK_HOURS_PER_YEAR * p * RECOVERY_RATE;
    return {
      moneySavedPerYear: teamSize * annualSalary * p * RECOVERY_RATE,
      hoursReclaimedPerWeek: Math.round(reclaimedHoursPerYear / 52),
    };
  }, [teamSize, monthlySalary]);

  return (
    <section
      id="roi-calculator"
      className="relative overflow-hidden py-24 md:py-32"
      style={{ backgroundColor: "#F8F9FB" }}
    >
      {/* Interactive dot-field background — same treatment as the hero, sitting
          behind the aurora mesh and all content. Edge-masked so the dots
          dissolve at the section boundaries instead of starting on a line. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
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

      {/* Ambient aurora mesh — echoes Features, kept subtle. Edge-masked so the
          blurred blobs dissolve before the overflow-hidden boundary. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        <div
          className="absolute -left-[18%] -top-[12%] h-[760px] w-[760px] rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, rgba(110,86,207,0.26) 0%, rgba(170,153,236,0.12) 35%, transparent 70%)",
            filter: "blur(110px)",
          }}
        />
        <div
          className="absolute -right-[16%] bottom-[-10%] h-[720px] w-[720px] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle at 60% 50%, rgba(135,212,196,0.28) 0%, rgba(135,212,196,0.15) 40%, transparent 75%)",
            filter: "blur(120px)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Heading */}
        <div className="mb-14 flex flex-col items-center gap-4 text-center md:mb-20">
          <SplitText
            as="h2"
            reveal
            className="text-balance text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl"
          >
            Put a <span className="italic font-serif font-normal text-violet-700">number</span> on
            your team's focus.
          </SplitText>
          <SplitText
            as="p"
            reveal
            revealDelay={0.12}
            className="max-w-[560px] text-[15px] font-light leading-relaxed text-[#6b7280] sm:text-[16px]"
          >
            Context switching quietly drains your team's capacity. Drag the sliders to see what
            FocusFlow reclaims — in dollars and in hours.
          </SplitText>
        </div>

        {/* Calculator card */}
        <SplitText as="div" reveal revealDelay={0.24}>
          <GlowBorder>
            <div
              className="grid w-full grid-cols-1 overflow-hidden rounded-[24px] bg-white lg:grid-cols-2"
              style={{ boxShadow: CARD_SHADOW }}
            >
              {/* Inputs */}
              <div className="flex flex-col gap-7 p-7 md:p-9">
                <InputRow
                  label="Team size"
                  displayValue={`${teamSize}`}
                  value={teamSize}
                  min={1}
                  max={200}
                  onChange={setTeamSize}
                />
                <InputRow
                  label="Avg. monthly salary"
                  displayValue={`${currency.format(monthlySalary)}/mo`}
                  value={monthlySalary}
                  min={3000}
                  max={20000}
                  step={500}
                  onChange={setMonthlySalary}
                />

                {/* Fixed, research-backed stat — kept minimal (a subtle divider +
                small info glyph) so it reads as a given, not a control, while
                staying visually quiet next to the adjustable sliders. */}
                <div className="border-t border-black/5 pt-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-[14px] font-medium text-[#4b5563]">
                      Capacity lost to context-switching
                      <Info className="h-3.5 w-3.5 text-[#4b5563]/40" strokeWidth={2} />
                    </span>
                    <span className="text-[15px] font-bold tabular-nums text-[#1d1d23]">
                      {CAPACITY_LOST_PCT}%
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#6b7280]">
                    Industry estimate · interruption-recovery research: Mark et al., UC Irvine.
                  </p>
                </div>
              </div>

              {/* Results — Apple-style premium panel: deep gradient, generous
              whitespace, hairline dividers and a soft ambient bloom. */}
              <div className="relative flex flex-col justify-center gap-8 overflow-hidden p-8 md:p-10">
                {/* Deep base gradient (violet → indigo → cool blue) */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(155deg, #1b1533 0%, #241b46 46%, #142438 100%)",
                  }}
                />
                {/* Ambient blooms echoing the site's violet + mint palette */}
                <div
                  className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(170,153,236,0.40) 0%, transparent 70%)",
                    filter: "blur(24px)",
                  }}
                />
                <div
                  className="pointer-events-none absolute -bottom-24 -left-12 h-60 w-60 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(135,212,196,0.22) 0%, transparent 70%)",
                    filter: "blur(28px)",
                  }}
                />
                {/* Fine top highlight — the classic Apple glass edge */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                <div className="relative">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/65">
                    Reclaimed per year
                  </p>
                  <div className="mt-2.5 text-[44px] font-bold leading-[0.95] tracking-tight text-white tabular-nums sm:text-[60px] md:text-[76px]">
                    <AnimatedMoney value={moneySavedPerYear} />
                  </div>
                </div>

                <div className="relative h-px w-full bg-white/[0.08]" />

                <div className="relative">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/65">
                    Focus hours reclaimed / week
                  </p>
                  <p className="mt-2 text-[20px] font-medium leading-none tracking-tight text-white/70 tabular-nums md:text-[22px]">
                    {hoursReclaimedPerWeek.toLocaleString("en-US")}
                    <span className="ml-1.5 text-[13px] font-normal text-white/65">hrs</span>
                  </p>
                </div>

                <a
                  href="/signup?plan=pro"
                  className={cn(
                    CTA_PRIMARY,
                    "mt-1 px-6 py-3.5 text-[15px] focus-visible:ring-offset-[#1b1533]",
                  )}
                >
                  <GlareHover />
                  <span className="relative">Start free trial</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </a>

                <p className="relative text-[11px] leading-relaxed text-white/60">
                  Estimate assumes {WORK_HOURS_PER_YEAR.toLocaleString("en-US")} working hours/year
                  and {CAPACITY_LOST_PCT}% capacity lost to context switching. The ~
                  {Math.round(RECOVERY_RATE * 100)}% recovery rate is FocusFlow's modeled
                  assumption.
                </p>
              </div>
            </div>
          </GlowBorder>
        </SplitText>

        {/* Supporting "works with your tools" strip — separated from the card
            purely by whitespace (no divider line). */}
        <div id="integrations" className="mx-auto mt-24 max-w-4xl scroll-mt-24">
          <IntegrationStrip />
        </div>
      </div>
    </section>
  );
}

export default RoiCalculator;
