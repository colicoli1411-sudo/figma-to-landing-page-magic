import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { ContextSwitching } from "@/components/landing/ContextSwitching";
import { Features } from "@/components/landing/Features";
import { RoiCalculator } from "@/components/landing/RoiCalculator";
import { Pricing } from "@/components/landing/Pricing";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";
import { SiteGradualBlur } from "@/components/landing/SiteGradualBlur";
import { PageLoader } from "@/components/landing/PageLoader";



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
        <Hero />
        <ContextSwitching />
        <Features />
        {/* Social proof lands before the buying decision: testimonials validate
            the claims, the ROI calculator quantifies them, pricing closes. */}
        <TestimonialsSection />
        <RoiCalculator />
        <Pricing />
        <FAQSection />
        <ContactSection />
      </main>
      <div id="site-footer">
        <Footer />
      </div>
      {/* Site-wide gradual blur pinned to the viewport bottom; fades out at the footer. */}
      <SiteGradualBlur />
    </div>
  );
}
