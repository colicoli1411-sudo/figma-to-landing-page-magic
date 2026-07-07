import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiX, SiGithub, SiYoutube } from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa6";
import TextPressure from "./TextPressure";
import { Logo } from "./Logo";

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
          "radial-gradient(120% 90% at 100% 100%, #E9D5FF 0%, #C084FC 18%, #9333EA 38%, #6B21A8 58%, #2A0B45 78%, #0A0A0F 100%)",
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
        {/* MEGA CTA — TextPressure */}
        <div className="border-b border-white/10 pb-20">
          <div
            className="relative w-full max-w-5xl mx-auto h-[150px] md:h-[200px] flex items-center justify-start overflow-hidden"
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
            />
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <p className="max-w-md text-base text-white/70">
              Quiet the noise. Ship the work.
            </p>
            <a
              href="/signup"
              className="group inline-flex items-center gap-3 rounded-[12px] border border-white/25 bg-white/10 px-6 py-3.5 text-[15px] font-semibold text-white transition duration-300 hover:scale-[1.02] hover:border-[#6E56CF] hover:bg-[#6E56CF] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
              style={{
                boxShadow: "0 0 24px rgba(170, 153, 236, 0.35)",
              }}
            >
              Start free trial
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        {/* EDITORIAL NAV ROW — brand + horizontal inline product nav */}
        <div className="flex flex-col gap-10 py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          {/* Brand block */}
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center" aria-label="FocusFlow home">
              <Logo size={30} focusColor="#ffffff" flowColor="#D7CFF9" />
            </Link>
            <p className="mt-5 text-[14px] leading-relaxed text-white/70">
              Multiplayer focus for modern tech teams. Sync deep work, mute the
              noise, protect the calendar.
            </p>
          </div>

          {/* Product nav — horizontal inline list */}
          <nav className="flex flex-wrap items-center gap-x-9 gap-y-3 lg:justify-end">
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
            <a href="#" className="hover:text-white/80">Privacy</a>
            <a href="#" className="hover:text-white/80">Terms</a>
            <a href="#" className="hover:text-white/80">Security</a>
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
