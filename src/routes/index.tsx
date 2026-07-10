import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { ContextSwitching } from "@/components/landing/ContextSwitching";
import DotField from "@/components/landing/DotField";
import { SiteGradualBlur } from "@/components/landing/SiteGradualBlur";
import { PageLoader } from "@/components/landing/PageLoader";
import { scheduleStRefresh } from "@/lib/scrolltrigger-refresh";

// Below-the-fold sections are code-split so the initial mobile bundle only
// parses the shell + hero. React 19 streaming SSR still renders them on the
// server (full HTML for SEO / no fallback flash); on the client each chunk
// hydrates independently. Header/Hero/ContextSwitching stay eager —
// ContextSwitching shares the mockup-scale handshake with Hero.
const Features = lazy(() =>
  import("@/components/landing/Features").then((m) => ({ default: m.Features })),
);
const TestimonialsSection = lazy(() =>
  import("@/components/landing/TestimonialsSection").then((m) => ({
    default: m.TestimonialsSection,
  })),
);
const RoiCalculator = lazy(() =>
  import("@/components/landing/RoiCalculator").then((m) => ({ default: m.RoiCalculator })),
);
const Pricing = lazy(() =>
  import("@/components/landing/Pricing").then((m) => ({ default: m.Pricing })),
);
const FAQSection = lazy(() =>
  import("@/components/landing/FAQSection").then((m) => ({ default: m.FAQSection })),
);
const ContactSection = lazy(() =>
  import("@/components/landing/ContactSection").then((m) => ({ default: m.ContactSection })),
);
const Footer = lazy(() =>
  import("@/components/landing/Footer").then((m) => ({ default: m.Footer })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FocusFlow — Multiplayer focus for modern tech teams" },
      {
        name: "description",
        content:
          "FocusFlow syncs deep work across your engineering team, auto-mutes notifications across all your tools, and protects the team's most valuable asset: their time.",
      },
      {
        property: "og:title",
        content: "FocusFlow — Multiplayer focus for modern tech teams",
      },
      {
        property: "og:description",
        content:
          "Sync deep work states, auto-mute distractions across Slack, Teams, Gmail and more, and protect your team's time.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

gsap.registerPlugin(ScrollTrigger);

/** Fires a debounced ScrollTrigger.refresh() when a lazy section's real
 *  content mounts. Rendered INSIDE the Suspense boundary, after the section,
 *  so it only runs once the chunk has arrived and changed the page height —
 *  keeping every trigger's start/end positions correct (the fragile part of
 *  this page's scroll choreography). */
function MountRefresh() {
  useEffect(() => {
    scheduleStRefresh();
  }, []);
  return null;
}

/** Suspense wrapper for a code-split section: reserves an approximate height
 *  while the chunk loads (pre-hydration only — the post-mount refresh corrects
 *  the real layout), then refreshes ScrollTrigger when the content lands. */
function LazySection({ minHeight, children }: { minHeight: number; children: ReactNode }) {
  return (
    <Suspense fallback={<div style={{ minHeight }} aria-hidden />}>
      {children}
      <MountRefresh />
    </Suspense>
  );
}

/** A single dot-field + #F8F9FB base shared behind a run of sections, so the
 *  dots read as one continuous field across their boundaries instead of each
 *  section being individually dotted-or-not. Full-strength to every edge (no
 *  fade), so the dots meet the neighbouring sections without a blank/white gap —
 *  neighbours are either dark (Pricing) or carry their own gradient (Features). */
function SharedDotsGroup({ children }: { children: ReactNode }) {
  return (
    <div className="relative" style={{ backgroundColor: "#F8F9FB" }}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
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
      {children}
    </div>
  );
}

function Index() {
  // Web fonts (Poppins / Instrument Serif) and late-loading images/mockups shift
  // the layout AFTER each section's ScrollTrigger has already measured its start
  // position — and the pinned Features section only reserves its ~1800px of
  // pin-spacer once ScrollTrigger settles. Both push everything below down, so
  // reveals created against the initial (too-short) layout would otherwise sit
  // above their trigger line and fire before you scroll to them. Recompute all
  // start/end positions once the layout stabilises.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    const timers = [window.setTimeout(refresh, 200), window.setTimeout(refresh, 900)];
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(refresh);
    }
    window.addEventListener("load", refresh);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("load", refresh);
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip">
      {/* One-time page-load intro overlay (initial document load only). */}
      <PageLoader />
      {/* Keyboard escape hatch past the fixed header + animated hero. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[10px] focus:bg-[#6E56CF] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      {/* header/footer live OUTSIDE <main> so banner/contentinfo landmarks are
          exposed correctly to assistive tech. */}
      <Header />
      <main id="main-content">
        {/* One continuous dotted background from the Hero all the way to the ROI
            calculator — every section in this run is transparent and paints above
            the shared field, so the dots never stop/restart at a seam. Features'
            own violet gradient wash covers the dots through its body and releases
            them at its faded edges. (Section order: hero → context switching →
            features, then social proof validates the claims, the ROI calculator
            quantifies them, pricing closes.) */}
        <SharedDotsGroup>
          <Hero />
          <ContextSwitching />
          <LazySection minHeight={1200}>
            <Features />
          </LazySection>
          <LazySection minHeight={800}>
            <TestimonialsSection />
          </LazySection>
          <LazySection minHeight={700}>
            <RoiCalculator />
          </LazySection>
        </SharedDotsGroup>
        <LazySection minHeight={900}>
          <Pricing />
        </LazySection>
        <SharedDotsGroup>
          <LazySection minHeight={700}>
            <FAQSection />
          </LazySection>
          <LazySection minHeight={600}>
            <ContactSection />
          </LazySection>
        </SharedDotsGroup>
      </main>
      <div id="site-footer">
        <LazySection minHeight={500}>
          <Footer />
        </LazySection>
      </div>
      {/* Site-wide gradual blur pinned to the viewport bottom; fades out at the footer. */}
      <SiteGradualBlur />
    </div>
  );
}
