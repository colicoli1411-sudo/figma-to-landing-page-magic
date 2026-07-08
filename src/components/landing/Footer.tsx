import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiX, SiGithub, SiYoutube } from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa6";
import TextPressure from "./TextPressure";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { CTA_SECONDARY_DARK } from "./cta";

// Kept in sync with the header nav (Header.tsx NAV_ITEMS).
const productLinks = [
  { label: "Features", href: "#features" },
  { label: "Customers", href: "#testimonials" },
  { label: "Calculator", href: "#roi-calculator" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

function handleScrollToSection(e: React.MouseEvent, targetId: string) {
  e.preventDefault();
  const element = document.getElementById(targetId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    // Footer can render on routes other than the landing page (e.g. /signup),
    // where the target section doesn't exist — navigate home to the anchor.
    window.location.assign(`/#${targetId}`);
  }
}

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(120% 90% at 100% 100%, #E4DEFC 0%, #AA99EC 18%, #6E56CF 38%, #4C3D9E 58%, #241C46 78%, #0A0A0F 100%)",
      }}
    >
      {/* Subtle grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Soft top edge fade for blending with section above */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/5 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-10 lg:px-10 lg:pt-32">
        {/* TOP BLOCK — mobile/tablet: a slim single row, logo one side / CTA the
            other; desktop (lg+): the interactive TextPressure mega-CTA, unchanged. */}
        <div className="border-b border-white/10 pb-10 lg:pb-20">
          {/* Mobile/tablet — the desktop mega-CTA, scaled down: a large, dramatic
              centered logo lockup, then a divider leading into a marketing line
              (left) + action button (right). Mirrors the desktop composition. */}
          <div className="lg:hidden">
            <div className="flex justify-center">
              {/* Wordmark only (no lock mark) — sized large & dramatic, clamped
                  so "FocusFlow" always stays on one line across mobile widths. */}
              <span
                className="whitespace-nowrap text-[clamp(3.5rem,16vw,5rem)] font-semibold leading-none text-white"
                style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.03em" }}
              >
                Focus<span style={{ color: "#D7CFF9" }}>Flow</span>
              </span>
            </div>
            <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
              <p className="max-w-[52%] text-[14px] leading-snug text-white/60">
                Ready to reclaim focus?
              </p>
              <a
                href="/signup"
                className={cn(
                  CTA_SECONDARY_DARK,
                  "shrink-0 gap-2 px-5 py-3 text-[14px] focus-visible:ring-offset-[#0A0A0F]",
                )}
              >
                Start free trial
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* Desktop mega CTA — TextPressure (unchanged) */}
          <div className="hidden lg:block">
            <div
              className="relative w-full max-w-5xl mx-auto h-[200px] flex items-center justify-start overflow-hidden"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
                WebkitMaskComposite: "source-in",
                maskComposite: "intersect",
              }}
            >
              <TextPressure
                text="FocusFlow"
                fontFamily="Roboto Flex"
                fontUrl="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=swap"
                flex={false}
                alpha={false}
                stroke={false}
                width={true}
                weight={true}
                italic={false}
                textColor="#ffffff"
                minFontSize={64}
                scrollDrive
              />
            </div>
            <div className="mt-10 flex flex-row items-center justify-between gap-6">
              <p className="max-w-md text-base text-white/70">Ready to reclaim focus?</p>
              <a
                href="/signup"
                className={cn(
                  CTA_SECONDARY_DARK,
                  "gap-3 px-6 py-3.5 text-[15px] focus-visible:ring-offset-[#0A0A0F]",
                )}
              >
                Start free trial
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>

        {/* EDITORIAL NAV ROW — brand + horizontal inline product nav.
            On mobile/tablet the brand block is hidden (the logo already leads
            the footer) and the nav centers — one quiet row of links. */}
        <div className="flex flex-col gap-10 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-12">
          {/* Brand block — desktop only */}
          <div className="hidden max-w-sm lg:block">
            <Link to="/" className="inline-flex items-center" aria-label="FocusFlow home">
              <Logo size={30} focusColor="#ffffff" flowColor="#D7CFF9" />
            </Link>
            <p className="mt-5 text-[14px] leading-relaxed text-white/70">
              Multiplayer focus for modern tech teams. Sync deep work, mute the noise, protect the
              calendar.
            </p>
          </div>

          {/* Product nav — horizontal inline list */}
          <nav className="flex flex-wrap items-center justify-center gap-x-9 gap-y-4 lg:justify-end">
            {productLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScrollToSection(e, link.href.slice(1))}
                className="group relative text-sm font-medium text-white/65 transition-colors duration-200 hover:text-white"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-white/70 transition-all duration-300 ease-out group-hover:w-full" />
              </a>
            ))}
          </nav>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col-reverse items-start justify-between gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <div className="flex flex-col gap-2 text-xs text-white/50 sm:flex-row sm:items-center sm:gap-6">
            <span>© {new Date().getFullYear()} FocusFlow Labs, Inc.</span>
            <a href="#" className="hover:text-white/80">
              Privacy
            </a>
            <a href="#" className="hover:text-white/80">
              Terms
            </a>
            <a href="#" className="hover:text-white/80">
              Security
            </a>
          </div>

          <div className="flex items-center gap-3">
            <SocialLink href="#" label="X (Twitter)">
              <SiX size={16} />
            </SocialLink>
            <SocialLink href="#" label="LinkedIn">
              <FaLinkedinIn size={16} />
            </SocialLink>
            <SocialLink href="#" label="GitHub">
              <SiGithub size={16} />
            </SocialLink>
            <SocialLink href="#" label="YouTube">
              <SiYoutube size={16} />
            </SocialLink>
          </div>
        </div>

        {/* Design & build credit — kept legible (not a faint whisper): the name
            sits in a light-violet brand tone so it reads with quiet confidence. */}
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-[13px] text-white/55">
          Designed &amp; developed by{" "}
          <a
            href={`https://wa.me/972543975773?text=${encodeURIComponent(
              "היי קורל, ראיתי את העבודות שלך ואשמח לדבר!",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#C4B8F3] underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Coral Tzioni
          </a>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-white/15 hover:text-white"
    >
      {children}
    </a>
  );
}
