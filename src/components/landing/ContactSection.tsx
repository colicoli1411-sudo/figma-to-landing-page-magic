import React from "react";
import { ArrowRight } from "lucide-react";
import { SplitText } from "./SplitText";
import { cn } from "@/lib/utils";
import { CTA_PRIMARY, GlareHover } from "./cta";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Contact section, sits right before the Footer.
 * Structure inspired by the "Ready to grow" reference: big editorial headline
 * on the left, two-column form below. Dark canvas with a purple radial glow
 * anchored top-left (matching the supplied background), recolored to the
 * Focus Flow brand purple.
 */

const fieldLabel =
  "text-[11px] font-medium uppercase tracking-[0.22em] text-white/65";

// Shared underline-style fields tuned for the dark canvas.
const fieldClass =
  "h-11 rounded-none border-0 border-b border-white/20 bg-transparent px-0 text-base text-white shadow-none placeholder:text-white/60 focus-visible:border-[#8B79E6] focus-visible:ring-0";

const selectTriggerClass =
  "h-11 rounded-none border-0 border-b border-white/20 bg-transparent px-0 text-base text-white shadow-none data-[placeholder]:text-white/60 focus:ring-0 focus:border-[#8B79E6]";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className={fieldLabel}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function ContactSection() {
  const [submitted, setSubmitted] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section
      id="contact"
      className="relative w-full overflow-x-clip py-24 md:py-32"
    >
      {/* Ambient violet + sky glows on the light area around the card — keep the
          page-wide colour flow continuous from the FAQ above. Subtle, edge-fading. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-[8%] top-[3%] h-[560px] w-[560px] rounded-full opacity-55"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(110,86,207,0.20) 0%, transparent 70%)",
            filter: "blur(120px)",
          }}
        />
        <div
          className="absolute -right-[8%] bottom-[6%] h-[560px] w-[560px] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(135,212,196,0.18) 0%, transparent 70%)",
            filter: "blur(120px)",
          }}
        />
      </div>

      {/* Contained dark card rather than a full-bleed rectangle. Card edges are
          aligned to the header pill: the wrapper mirrors the header's outer box
          exactly (max-w-[1400px] then px-4 sm:px-6 md:px-8 — see Header.tsx), so
          the card spans the same width as the header at every breakpoint. */}
      <div className="relative mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8">
      <div
        className="relative w-full overflow-hidden rounded-[28px] text-white shadow-[0_30px_80px_-30px_rgba(110,86,207,0.45)] md:rounded-[40px]"
        style={{ backgroundColor: "#07070c" }}
      >
        {/* Purple radial glow anchored top-left, matching the reference background. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle 720px at 22% 30%, rgba(110, 86, 207, 0.85) 0%, rgba(76, 61, 158, 0.45) 28%, rgba(36, 28, 70, 0.35) 50%, rgba(7, 7, 12, 0) 72%)",
          }}
        />

        <div className="relative px-6 py-16 sm:px-10 md:px-14 md:py-20 lg:px-20">
        {/* Headline row */}
        <div className="mb-16 flex flex-col gap-5">
          <SplitText
            as="h2"
            reveal
            className="max-w-3xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Ready to give your team{" "}
            <span className="italic font-serif font-normal text-violet-300">
              focus
            </span>{" "}
            that scales?
          </SplitText>
          <SplitText as="p" reveal revealDelay={0.12} className="max-w-xl text-base leading-relaxed text-white/65">
            For teams and enterprise plans, tell us about your setup and we'll
            tailor FocusFlow for your org. We usually reply within one business day.
          </SplitText>
          <SplitText
            as="p"
            reveal
            revealDelay={0.18}
            className="text-sm text-white/50"
          >
            Just want to try it yourself?{" "}
            <a href="/signup" className="font-medium text-white/80 underline underline-offset-2 hover:text-white">
              Start a free trial
            </a>
            .
          </SplitText>
        </div>

        {/* Form */}
        <SplitText as="div" reveal revealDelay={0.24}>
        {submitted ? (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-[var(--color-stroke-brand)] bg-white/5 px-8 py-10 backdrop-blur-sm">
            <h3 className="text-2xl font-semibold text-white">
              Thanks — we've got it.
            </h3>
            <p className="max-w-md text-white/70">
              Our sales team will reach out at the email you provided within
              one business day.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-12">
            <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
              <Field label="Your name*" htmlFor="contact-name">
                <Input
                  id="contact-name"
                  name="name"
                  required
                  placeholder="Jane Cooper"
                  className={fieldClass}
                />
              </Field>

              <Field label="Work email*" htmlFor="contact-email">
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  placeholder="jane@company.com"
                  className={fieldClass}
                />
              </Field>

              <Field label="Company name" htmlFor="contact-company">
                <Input
                  id="contact-company"
                  name="company"
                  placeholder="Acme Inc."
                  className={fieldClass}
                />
              </Field>

              <Field label="How big is your team?">
                <Select name="teamSize">
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1–10 people</SelectItem>
                    <SelectItem value="11-50">11–50 people</SelectItem>
                    <SelectItem value="51-200">51–200 people</SelectItem>
                    <SelectItem value="200+">200+ people</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Which tools eat your team's focus?">
                <Select name="tools">
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Select your main distraction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="discord">Discord</SelectItem>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="all">All of the above</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="How did you hear about us?">
                <Select name="source">
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Select a source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="search">Search engine</SelectItem>
                    <SelectItem value="social">Social media</SelectItem>
                    <SelectItem value="referral">A colleague</SelectItem>
                    <SelectItem value="event">Event or podcast</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

            </div>

            {/* Submit — stacked (note above full-width button) on mobile, where
                the side-by-side row squeezed the note into a sliver. */}
            <div className="flex flex-col gap-5 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <p className="text-sm text-white/65 sm:max-w-[13rem]">
                By submitting you agree to be contacted about FocusFlow. No spam,
                ever.
              </p>
              <button
                type="submit"
                className={cn(CTA_PRIMARY, "shrink-0 gap-3 whitespace-nowrap px-6 py-3.5 text-[15px] focus-visible:ring-offset-[#07070c] sm:justify-start")}
                style={{ boxShadow: "0 0 24px rgba(170, 153, 236, 0.35)" }}
              >
                <GlareHover />
                <span className="relative">Talk to sales</span>
                <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </div>
          </form>
        )}
        </SplitText>
        </div>
      </div>
      </div>
    </section>
  );
}
