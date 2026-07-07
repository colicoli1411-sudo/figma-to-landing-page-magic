import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SplitText } from "./SplitText";
import DotField from "./DotField";
import { useIsMobile } from "@/hooks/use-mobile";

const faqs = [
  {
    question: "Does the system track or spy on my employees?",
    answer:
      "Absolutely not. We measure focus blocks, not keystrokes or mouse movements. FocusFlow is built on trust and team visibility.",
  },
  {
    question: "Which applications can be automatically muted?",
    answer:
      "We seamlessly integrate with Slack, Microsoft Teams, Discord, WhatsApp Web, Gmail, and Figma. You can customize the muting rules per team.",
  },
  {
    question: "How does team visibility work in practice?",
    answer:
      "When someone enters a deep work block, their status is automatically synced across connected apps, silently signaling colleagues to respect maker time.",
  },
  {
    question: "What happens if I hit the limit on the Personal plan?",
    answer:
      "After your 15 weekly focus sessions, you can keep starting sessions manually — automated muting and status sync pause until the week resets. Upgrade to Pro anytime for unlimited sessions.",
  },
  {
    question: "How long does it take to set up FocusFlow for my team?",
    answer:
      "Most teams are up and running in under 10 minutes. Connect your tools with a couple of clicks, invite your teammates, and FocusFlow starts protecting deep work right away — no IT project required.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Yes. All data is encrypted in transit and at rest, and we never sell or share it. FocusFlow is GDPR-compliant and we only store the minimum needed to sync focus states across your team.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  panelId,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  panelId: string;
}) {
  return (
    <div className="group relative border-t-2 border-[#6E56CF]">
      {/* Brand glow that sweeps along the top line while the answer is open
          (or previewed on hover), echoing the rotating card border glow. */}
      <div
        aria-hidden
        className={`faq-glow-line pointer-events-none absolute inset-x-0 -top-0.5 h-0.5 ${
          isOpen ? "faq-glow-line--open" : ""
        }`}
      />
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center justify-center gap-2.5 px-6 py-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
        >
          <span className="text-lg md:text-xl font-semibold text-neutral-900 leading-snug tracking-tight">
            {question}
          </span>
          {/* Chevron is a touch affordance — desktop opens on hover like the
              original design, so it hides at lg. */}
          <ChevronDown
            aria-hidden
            className={`h-4 w-4 shrink-0 text-[#6E56CF] transition-transform duration-300 lg:hidden ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </h3>
      {/* Open drivers: click state (tablet/mobile) below lg; pure hover on
          desktop (lg+), exactly like the original interaction. 280ms with a
          standard material curve — the previous 500ms ease-out read as slow
          and stuttery on mobile (grid-rows animation reflows every frame). */}
      <div
        id={panelId}
        className={`mx-auto grid w-full max-w-3xl transition-[grid-template-rows] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] lg:group-hover:grid-rows-[1fr] ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          {/* Answer fades in slightly behind the height expansion — softens the
              reveal so the motion reads smooth instead of abrupt. */}
          <p
            className={`px-6 pb-6 text-base md:text-lg text-neutral-700 leading-relaxed transition-opacity duration-[320ms] ease-out lg:group-hover:opacity-100 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Mobile: the two ambient blobs stay static — continuously animating large
  // blurred layers is GPU-expensive and made the accordion open janky.
  const isMobile = useIsMobile();

  // Click-toggle drives tablet/mobile only; on desktop (lg+) items open on
  // hover exactly like the original design, so clicks are ignored there.
  const toggle = (i: number) => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) return;
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section
      id="faq"
      className="relative z-10 py-24 md:py-32"
      style={{ backgroundColor: "#F8F9FB" }}
    >
      {/* Interactive dot-field background — same treatment as the hero, sitting
          behind the aurora mesh and all content. Edge-masked so the dots
          dissolve at the section boundaries instead of stopping on a line. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 10%, black 88%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 10%, black 88%, transparent 100%)",
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

      {/* ── Ambient mesh glow — dedicated background layer ─────────────────────
          A separate absolute inset-0 layer (NOT in the content flow), clipped by
          the section's relative + overflow-hidden. Diagonal "ping-pong": a faint
          mint wash top-left, a faint violet wash bottom-right, each drifting
          slowly + independently. Very low opacity + heavy blur + deep corner
          offsets mean only a soft halo enters — the top stays white and the
          colour fades to nothing at the edges, so it blends with the sections
          above and below. The section clips only on the X axis (overflow-x-clip)
          while the Y axis stays visible, so each blob bleeds past the top/bottom
          edge into the neighbouring section — a little mint into Testimonials
          above, a little violet into Contact below. The heavy blur makes the
          crossover seamless, so no edge mask is needed. */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Secondary-mint — mostly off the top-left corner; only a faint wash reaches in. */}
        <motion.div
          className="absolute -left-[22%] -top-[30%] h-[520px] w-[520px] rounded-full bg-[#87D4C4]/10 blur-[130px] md:h-[720px] md:w-[720px] md:blur-[160px]"
          style={{ willChange: "transform" }}
          animate={
            isMobile
              ? undefined
              : {
                  x: [0, 45, 18, 52, 0],
                  y: [0, 30, 58, 22, 0],
                  scale: [1, 1.07, 0.97, 1.04, 1],
                }
          }
          transition={{
            duration: 22,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
        {/* Violet — mostly off the bottom-right corner; only a faint wash reaches in. */}
        <motion.div
          className="absolute -bottom-[38%] -right-[20%] h-[560px] w-[560px] rounded-full bg-violet-400/12 blur-[130px] md:h-[760px] md:w-[760px] md:blur-[160px]"
          style={{ willChange: "transform" }}
          animate={
            isMobile
              ? undefined
              : {
                  x: [0, -42, -12, -50, 0],
                  y: [0, -28, -55, -18, 0],
                  scale: [1, 1.05, 0.96, 1.03, 1],
                }
          }
          transition={{
            duration: 27,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        {/* Margin lives on a wrapper — SplitText hard-resets its own margin. */}
        <div className="mb-14 md:mb-20">
          <SplitText
            as="h2"
            reveal
            className="text-balance text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl"
          >
            Frequently <span className="italic font-serif font-normal text-violet-700">asked</span>{" "}
            questions
          </SplitText>
        </div>
        <SplitText
          as="div"
          reveal
          revealDelay={0.15}
          className="w-full border-b-2 border-[#6E56CF]"
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
              panelId={`faq-panel-${i}`}
            />
          ))}
        </SplitText>
      </div>
    </section>
  );
}
