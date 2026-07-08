import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { PurpleGlow } from "./PurpleGlow";
import DotField from "./DotField";
import { HeroMockup, STATUS_STYLES, type Status } from "./HeroMockup";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isIntroActive, whenIntroReveals, INTRO_TOTAL_MS } from "@/lib/page-load-intro";
import { computeMockupTargetScale } from "@/lib/mockup-scale";
import { cn } from "@/lib/utils";
import { CTA_PRIMARY, CTA_SECONDARY_LIGHT, GlareHover } from "./cta";
import "./TrueFocus.css";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  // Mockup scroll-driven expand: starts the moment the user scrolls and scales the
  // whole unit (dashboard + floating cards) up to full viewport width.
  const heroRef = useRef<HTMLElement>(null);
  const mockupScaleRef = useRef<HTMLDivElement>(null);
  // Mirrors Sarah Chen's status from the mockup's Team Flow so her floating pill
  // starts "Available" and flips to "In Deep Work" in sync with the demo.
  const [sarahStatus, setSarahStatus] = useState<Status>("available");

  // "Rack focus" entrance — plays once on load. Content resolves from blur to
  // sharp, echoing the camera-focus brackets around the title. useLayoutEffect
  // so the from-state is applied before first paint (no flash of final layout).
  // On the initial document load the timeline is built paused and played the
  // moment the page-load intro overlay reveals the page, so the loader's
  // bracket → wordmark motion flows straight into the hero. On any other load
  // (SPA navigation) it plays immediately, as before.
  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const targets = [
      ".hero-title",
      ".hero-eyebrow",
      ".hero-subtitle",
      ".hero-cta",
      ".hero-preview",
      ".focus-bracket-left",
      ".focus-bracket-right",
    ];

    let cancelled = false;

    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // Reduced motion: show everything in its final state, no timeline.
        gsap.set(targets, { clearProps: "all" });
        return;
      }

      // Paused: `.from()` still applies the hidden from-state synchronously
      // (immediateRender) so there's no flash while we wait for the reveal.
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, paused: true });

      tl.from(".focus-bracket-left", { x: -40, opacity: 0, duration: 0.9, ease: "power4.out" }, 0)
        .from(".focus-bracket-right", { x: 40, opacity: 0, duration: 0.9, ease: "power4.out" }, 0)
        .from(
          ".hero-title",
          { filter: "blur(18px)", opacity: 0, scale: 1.06, duration: 1.2, ease: "power2.out" },
          0.15,
        )
        .from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.8 }, 0.35)
        .from(
          [".hero-subtitle", ".hero-cta"],
          { y: 24, opacity: 0, duration: 0.7, stagger: 0.12 },
          0.6,
        )
        .from(
          ".hero-preview",
          { y: 60, opacity: 0, scale: 0.98, duration: 1.1, ease: "power2.out" },
          0.8,
        );

      if (isIntroActive()) {
        // Start when the loader reveals the page; fall back to a timeout so the
        // hero always appears even if the hand-off never fires.
        Promise.race([
          whenIntroReveals(),
          new Promise<void>((resolve) => setTimeout(resolve, INTRO_TOTAL_MS + 500)),
        ]).then(() => {
          if (!cancelled) tl.play();
        });
      } else {
        tl.play();
      }
    }, hero);

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const scaleEl = mockupScaleRef.current;
    if (!hero || !scaleEl) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const tween = gsap.fromTo(
        scaleEl,
        { scale: 1 },
        {
          // Grow the whole unit (dashboard + floating cards) until it fills the
          // viewport — shared with ContextSwitching, whose cover card starts at
          // exactly the mockup's final width (see lib/mockup-scale.ts).
          scale: () => computeMockupTargetScale(scaleEl),
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            // Begins immediately as the user starts scrolling from the top.
            start: "top top",
            // Normally 520px of scroll — but on very tall viewports the cover
            // pin (hero bottom hits viewport bottom) can arrive sooner than
            // that, so cap the range to end exactly at pin start. Keeps the
            // mockup from still growing while it's supposed to be frozen.
            end: () => "+=" + Math.min(520, Math.max(1, hero.offsetHeight - window.innerHeight)),
            // Catch-up smoothing (~1s) instead of a hard wheel lock.
            scrub: 1,
            invalidateOnRefresh: true,
          },
        },
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, []);

  // Cover pin: when the hero's bottom reaches the viewport bottom (the user
  // hits the end of the mockup), the ENTIRE hero — background included — pins
  // in place with no spacer, so the next section's card scrolls up OVER it.
  // Pure pin, no timeline: the cover choreography (this hero's recede
  // included — see [data-hero-recede] on the wrapper below) is driven by ONE
  // synced timeline in ContextSwitching. Scoped via gsap.context so a single
  // revert() tears down the pin cleanly on HMR/remount (same pattern as the
  // Features pin).
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const st = ScrollTrigger.create({
          trigger: hero,
          // Freeze while the mockup still reads nearly whole on screen — its
          // end at ~75% of the viewport height, not grazing the very bottom.
          start: "bottom 75%",
          // Release as soon as the (nearly viewport-sized) card reaches the
          // top of the screen — it covers the whole viewport at that moment,
          // so the unpin is invisible and the page frees up quickly instead
          // of feeling stuck for the whole section.
          endTrigger: "#context-cover-card",
          end: "top top",
          pin: true,
          // No spacer: the following section keeps its document position and
          // rides up over the pinned hero — the canonical cover pattern.
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        return () => st.kill();
      });
    }, hero);

    return () => ctx.revert();
  }, []);

  // Shared "lifted off the screen" treatment for the floating cards: a layered
  // ambient + brand-tinted shadow with a crisp top highlight, so they read as
  // physically hovering above the page rather than pasted onto it.
  const floatCardShadow =
    "0 1px 2px rgba(16,24,40,0.04), 0 8px 16px -4px rgba(16,24,40,0.08), 0 20px 36px -10px rgba(16,24,40,0.12), 0 36px 70px -18px rgba(110,86,207,0.28), inset 0 1px 0 rgba(255,255,255,0.95)";

  return (
    <section
      ref={heroRef}
      className="relative w-full overflow-x-clip"
      style={{ backgroundColor: "#F8F9FB" }}
      data-edit-section="Hero"
    >
      {/* Interactive dot-field background — sits behind the purple glow and all
          hero content, spanning the full hero. Bottom-masked so the dots
          dissolve into the next section instead of stopping on a hard line.
          Deliberately OUTSIDE the recede wrapper: while the pinned hero is
          covered, the glow/copy/mockup fade away but the dotted backdrop stays
          visible behind the rising white card. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 86%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, black 0%, black 86%, transparent 100%)",
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

      {/* Content wrapper — carries the hero's top padding so the absolute
          background layers span the full hero box. The pinned hero itself no
          longer scales or fades during the cover; the "next chapter" feel
          comes from the scrim below, which darkens everything gently. */}
      <div className="relative w-full pt-28 md:pt-[200px]">
      <PurpleGlow />

      <div className="relative z-10 mx-auto flex w-full flex-col items-center gap-[72px] px-6 pt-[10px] md:gap-[120px] md:px-12 lg:px-20 xl:px-32 2xl:px-48">
        {/* Hero copy */}
        <div className="flex w-full max-w-[960px] flex-col items-center gap-9">
          <div className="flex w-full flex-col items-center gap-7">
            {/* Headline */}
            <h1
              className="w-full text-center text-[2.25rem] font-bold text-neutral-900 sm:text-[3.25rem] lg:text-[5rem] xl:text-[5.5rem]"
              style={{ letterSpacing: "-0.02em", lineHeight: "0.98" }}
            >
              <span className="hero-eyebrow block whitespace-nowrap font-light text-[1.45rem] leading-tight text-[#3d3d4a] sm:text-[2rem] lg:text-[2.7rem] xl:text-[3.1rem]">
                Stop busywork.
              </span>
              <div className="mt-2 flex w-full flex-row items-baseline justify-center sm:whitespace-nowrap">
                <span className="relative inline-block px-4 py-2 sm:px-5 sm:py-2.5">
                  {/* TrueFocus static frame — both words enclosed. The corners
                      "breathe": framer pulses opacity here, while a CSS keyframe
                      (.corner, see TrueFocus.css) pulses the bracket + glow
                      between deep and light violet — a purple-only glow, no cyan.
                      Colour lives in CSS because framer can't reliably
                      interpolate unregistered CSS-variable colours. */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <span className="corner top-left focus-bracket-left" />
                    <span className="corner top-right focus-bracket-right" />
                    <span className="corner bottom-left focus-bracket-left" />
                    <span className="corner bottom-right focus-bracket-right" />
                  </motion.div>

                  <span className="hero-title inline-block">Start focused work.</span>
                </span>
              </div>
            </h1>

            {/* Sub — sculpted into a centered inverted pyramid: each line is
                progressively shorter so the block funnels the eye down toward
                the CTAs and mockup, ending on the emphasized value phrase.
                Forced line breaks only apply on lg+ (where there's room); on
                smaller screens it wraps naturally with balanced lines. */}
            <p
              className="hero-subtitle max-w-[520px] text-pretty text-center text-[13px] font-light leading-[1.65] tracking-[-0.01em] text-neutral-500 sm:text-[17px] sm:leading-[1.72] lg:max-w-[680px]"
              data-edit-id="hero-subtitle"
              data-edit-label="Subtitle"
            >
              The first multiplayer focus platform for modern tech teams. Sync deep work states,
              <br className="hidden lg:block" />
              auto-mute distractions, and protect your team's most
              <br className="hidden lg:block" />
              valuable asset: <span className="font-normal text-neutral-700">their time</span>.
            </p>
          </div>

          {/* CTAs */}
          <div
            className="hero-cta flex w-full flex-row items-stretch justify-center gap-3 sm:w-auto sm:items-center sm:gap-[22px]"
            data-edit-id="hero-cta-group"
            data-edit-label="CTA group"
          >
            <a
              href="/signup"
              className={cn(
                CTA_PRIMARY,
                "flex-1 whitespace-nowrap px-3 py-2.5 text-[13px] sm:flex-none sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-[15px]",
              )}
              data-edit-id="hero-cta-primary"
              data-edit-label="Primary CTA"
            >
              <GlareHover />
              <span className="relative">Start free trial</span>
              <ArrowRight className="relative h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
            <a
              href="#features"
              className={cn(
                CTA_SECONDARY_LIGHT,
                "flex-1 whitespace-nowrap px-3 py-2.5 text-[13px] sm:flex-none sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-[15px]",
              )}
              data-edit-id="hero-cta-secondary"
              data-edit-label="Secondary CTA"
            >
              <Play className="h-3.5 w-3.5 shrink-0" fill="#1d1d23" />
              <span className="sm:hidden">How it works</span>
              <span className="hidden sm:inline">See how it works</span>
            </a>
          </div>
          {/* Trial trust line — every self-serve plan starts with a 14-day
              free trial. */}
          <p className="hero-cta text-[13px] font-medium text-neutral-500">
            14-day free trial · Cancel anytime
          </p>
        </div>

        {/* Mockup with floating overlays — static at the top, then scroll-driven
            expand to full viewport width. Dashboard + floating cards form one unit. */}
        <div
          className="hero-preview relative w-full pb-[80px] lg:-mb-[220px] lg:pb-0"
          data-edit-section="Dashboard mockup"
        >
          <div>
            {/* Scroll-scaled mockup (origin top-center so it grows downward). */}
            <div ref={mockupScaleRef} className="relative origin-top will-change-transform">
              {/* Main dashboard — bottom fades out, hiding the lower chrome */}
              <div
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 68%, rgba(0,0,0,0.82) 80%, rgba(0,0,0,0.4) 90%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to bottom, black 68%, rgba(0,0,0,0.82) 80%, rgba(0,0,0,0.4) 90%, transparent 100%)",
                }}
                data-edit-id="mockup-dashboard"
                data-edit-label="Dashboard mockup"
              >
                <HeroMockup onSarahStatusChange={setSarahStatus} />
              </div>

              {/* Floating cards are part of the same unit, so they scale and
                  bounce together with the dashboard. */}
              {/* Left floating: Daily Stats mini card */}
              <div
                className="absolute -left-20 top-[34%] z-20 hidden w-[248px] rounded-2xl border border-white/60 bg-white/55 p-5 backdrop-blur-xl backdrop-saturate-150 lg:block"
                style={{ boxShadow: floatCardShadow }}
                data-edit-id="float-daily-stats"
                data-edit-label="Floating: Daily Stats"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(110,86,207,0.15)]">
                    <svg
                      className="h-4 w-4 text-[#6E56CF]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 3v18h18M7 16V10M12 16V6M17 16v-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#111827]">Daily Stats</p>
                    <p className="text-[10px] text-[#6b7280]">Last 5 days</p>
                  </div>
                </div>
                <div className="mt-4 flex h-[88px] items-end justify-between gap-2">
                  {[0.5, 0.65, 0.45, 0.85, 0.6].map((v, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                      <div
                        className="w-full rounded-t-sm"
                        style={{
                          height: `${v * 70}px`,
                          background: "linear-gradient(180deg, #8B79E6 0%, #6E56CF 100%)",
                        }}
                      />
                      <span className="text-[9px] text-[#6b7280]">
                        {["Mon", "Tue", "Wed", "Thu", "Fri"][i]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-t border-[#e5e7eb] pt-3">
                  <p className="text-[10px] text-[#6b7280]">Weekly Average</p>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[15px] font-bold text-[#1d1d23]">5.0 hours/day</span>
                    <span className="text-[11px] font-semibold text-emerald-600">+12%</span>
                  </div>
                </div>
              </div>

              {/* Right floating: Sarah Chen pill */}
              <div
                className="absolute -right-16 top-[16%] z-20 hidden w-[240px] items-center gap-3 rounded-[16px] border border-white/60 bg-white/55 p-3 backdrop-blur-xl backdrop-saturate-150 lg:flex"
                style={{ boxShadow: floatCardShadow }}
                data-edit-id="float-sarah-pill"
                data-edit-label="Floating: Sarah Chen pill"
              >
                <img
                  src="/images/sarah-chen.jpg"
                  alt="Sarah Chen"
                  className="h-9 w-9 shrink-0 rounded-full border border-[rgba(110,86,207,0.4)] object-cover"
                />
                <div className="flex flex-1 flex-col">
                  <span className="text-[14px] text-[#4b5563]">Sarah Chen</span>
                  <span
                    className="mt-1 inline-flex w-fit items-center rounded-[12px] px-2 py-0.5 text-[12px]"
                    style={{
                      backgroundColor: STATUS_STYLES[sarahStatus].bg,
                      color: STATUS_STYLES[sarahStatus].color,
                      boxShadow: STATUS_STYLES[sarahStatus].glow,
                      transition:
                        "background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease",
                    }}
                  >
                    {STATUS_STYLES[sarahStatus].label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* end content wrapper */}
      </div>

      {/* Chapter scrim — a neutral dark veil over the ENTIRE pinned hero
          (dot field included). ContextSwitching's cover timeline fades it
          0 → ~0.4 as the bright card rises, so the frozen backdrop gently
          darkens and the card pops — "turning to the next chapter". */}
      <div
        aria-hidden
        data-hero-scrim
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{ backgroundColor: "#0f0f14" }}
      />
    </section>
  );
}
