import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getPlan, type PlanId } from "@/data/plans";
import { Footer } from "@/components/landing/Footer";
import { Logo } from "@/components/landing/Logo";
import { cn } from "@/lib/utils";
import { CTA_PRIMARY, GlareHover } from "@/components/landing/cta";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  // Only personal/pro self-serve here; anything else (incl. legacy "free") falls back to personal.
  validateSearch: (search: Record<string, unknown>): { plan: PlanId } => {
    const plan = search.plan;
    return { plan: plan === "pro" ? "pro" : "personal" };
  },
});

const fieldLabel = "text-[13px] font-medium text-neutral-600";
const fieldClass =
  "h-11 rounded-[10px] border-neutral-200 bg-white px-3.5 text-[15px] text-neutral-900 shadow-none placeholder:text-neutral-400 focus-visible:border-[#6E56CF] focus-visible:ring-2 focus-visible:ring-[rgba(110,86,207,0.25)]";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={fieldLabel}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SignupPage() {
  const { plan: initialPlan } = Route.useSearch();
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const [submitted, setSubmitted] = useState(false);

  const active = getPlan(plan);
  const isPro = plan === "pro";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <main
        className="relative min-h-screen overflow-x-clip px-4 pb-16 pt-6 sm:px-6 md:pb-24"
        style={{ backgroundColor: "#F8F9FB" }}
      >
        {/* Ambient brand glows — subtle, matching the site. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-[12%] -top-[10%] h-[560px] w-[560px] rounded-full opacity-60"
            style={{
              background:
                "radial-gradient(circle at 40% 40%, rgba(110,86,207,0.22) 0%, transparent 70%)",
              filter: "blur(120px)",
            }}
          />
          <div
            className="absolute -right-[12%] bottom-[-10%] h-[560px] w-[560px] rounded-full opacity-50"
            style={{
              background:
                "radial-gradient(circle at 60% 50%, rgba(135,212,196,0.20) 0%, transparent 72%)",
              filter: "blur(130px)",
            }}
          />
        </div>

        {/* Top bar */}
        <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" aria-label="FocusFlow home">
            <Logo size={26} />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-neutral-500 transition-colors hover:text-[#6E56CF]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
        </header>

        <div className="relative z-10 mx-auto mt-10 max-w-5xl md:mt-16">
          {submitted ? (
            <SuccessCard />
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
              {/* ── Form (below the summary on mobile, left at lg+) ── */}
              <div className="order-2 rounded-[24px] border border-black/5 bg-white p-7 shadow-[0_20px_60px_-30px_rgba(16,24,40,0.25)] md:p-9 lg:order-1">
                <h1 className="text-[26px] font-bold tracking-tight text-neutral-900 md:text-[30px]">
                  Start your free trial
                </h1>
                <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
                  {isPro
                    ? "14 days of FocusFlow Pro, free. Cancel anytime before it ends and you won't be charged."
                    : "14 days of FocusFlow Personal, free. Then $3/month — cancel anytime before the trial ends and you won't be charged."}
                </p>

                <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
                  <Field label="Full name" htmlFor="su-name">
                    <Input id="su-name" name="name" required placeholder="Jane Cooper" className={fieldClass} />
                  </Field>
                  <Field label="Work email" htmlFor="su-email">
                    <Input id="su-email" name="email" type="email" required placeholder="jane@company.com" className={fieldClass} />
                  </Field>
                  <Field label="Password" htmlFor="su-password">
                    <Input id="su-password" name="password" type="password" required placeholder="At least 8 characters" minLength={8} className={fieldClass} />
                  </Field>

                  {/* Both self-serve plans start a card-backed 14-day trial. */}
                  <div className="mt-1 rounded-[16px] border border-black/5 bg-[#faf9fe] p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-[#6E56CF]" />
                      <span className="text-[13px] font-semibold text-neutral-800">
                        Payment details
                      </span>
                    </div>
                    <div className="flex flex-col gap-4">
                      <Field label="Card number" htmlFor="su-card">
                        <Input id="su-card" name="card" inputMode="numeric" required placeholder="1234 1234 1234 1234" className={fieldClass} />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Expiry" htmlFor="su-exp">
                          <Input id="su-exp" name="expiry" required placeholder="MM / YY" className={fieldClass} />
                        </Field>
                        <Field label="CVC" htmlFor="su-cvc">
                          <Input id="su-cvc" name="cvc" inputMode="numeric" required placeholder="123" className={fieldClass} />
                        </Field>
                      </div>
                    </div>
                    <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-neutral-500">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      You won't be charged during your 14-day trial. We'll remind
                      you 3 days before it ends.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className={cn(CTA_PRIMARY, "mt-1 px-6 py-3.5 text-[15px] hover:scale-[1.01]")}
                    style={{ boxShadow: "0 10px 30px -12px rgba(110,86,207,0.6)" }}
                  >
                    <GlareHover />
                    <span className="relative">Start free trial</span>
                    <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>

                  <p className="text-center text-[13px] text-neutral-500">
                    Already have an account?{" "}
                    <a href="#" className="font-medium text-[#6E56CF] hover:underline">
                      Sign in
                    </a>
                  </p>
                </form>
              </div>

              {/* ── Order summary (first on mobile, right at lg+) ── */}
              <aside className="relative order-1 overflow-hidden rounded-[24px] p-7 text-white md:p-8 lg:order-2">
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(155deg, #1b1533 0%, #241b46 46%, #142438 100%)",
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(170,153,236,0.40) 0%, transparent 70%)", filter: "blur(24px)" }}
                />

                <div className="relative">
                  {/* Plan toggle */}
                  <div className="inline-flex rounded-full bg-white/10 p-1 text-[13px] font-medium">
                    {(["personal", "pro"] as PlanId[]).map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPlan(id)}
                        className={`rounded-full px-4 py-1.5 transition-colors ${
                          plan === id ? "bg-white text-neutral-900" : "text-white/70 hover:text-white"
                        }`}
                      >
                        {getPlan(id).title}
                      </button>
                    ))}
                  </div>

                  <p className="mt-7 text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">
                    Your plan
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-[44px] font-bold leading-none tracking-tight">
                      {active.price}
                    </span>
                    <span className="text-[14px] text-white/60">{active.period}</span>
                  </div>

                  <div className="mt-5 rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[13px] leading-relaxed text-white/80">
                    <span className="font-semibold text-white">14 days free</span>, then{" "}
                    {active.price} {active.period}. Cancel anytime.
                  </div>

                  <div className="mt-6 h-px w-full bg-white/[0.08]" />

                  <ul className="mt-6 flex flex-col gap-3">
                    {active.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-[14px] text-white/85">
                        <Check className="h-4 w-4 shrink-0 text-[#C4B8F3]" strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-7 text-[12px] leading-relaxed text-white/45">
                    Prices in USD. Need more than {getPlan("pro").features[0].toLowerCase()}?{" "}
                    <Link to="/" hash="contact" className="text-white/70 underline hover:text-white">
                      Talk to sales
                    </Link>
                    .
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function SuccessCard() {
  return (
    <div className="mx-auto max-w-xl rounded-[24px] border border-black/5 bg-white p-9 text-center shadow-[0_20px_60px_-30px_rgba(16,24,40,0.25)] md:p-12">
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: "rgba(110,86,207,0.12)" }}
      >
        <Sparkles className="h-7 w-7 text-[#6E56CF]" strokeWidth={2} />
      </div>
      <h1 className="mt-6 text-[28px] font-bold tracking-tight text-neutral-900">
        Okay… a small confession.
      </h1>
      <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-neutral-500">
        FocusFlow isn't a real product. This whole site is a fictional SaaS
        concept, designed and built end-to-end as a portfolio piece. No account
        was created, and your payment details were never stored or charged —
        the form never left this page.
      </p>
      <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-neutral-500">
        Sorry for the little tease — and thank you, sincerely, for clicking all
        the way through. Getting you this far was exactly what the design was
        hoping for.
      </p>
      <div className="mt-8 flex items-center justify-center">
        <Link
          to="/"
          className={cn(CTA_PRIMARY, "px-6 py-3")}
          style={{ boxShadow: "0 10px 30px -12px rgba(110,86,207,0.6)" }}
        >
          <GlareHover />
          <span className="relative">Back to the site</span>
          <ArrowRight className="relative h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
