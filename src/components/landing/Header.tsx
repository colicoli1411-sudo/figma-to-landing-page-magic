import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "./Logo";

const NAV_ITEMS: { label: string; href: string; id: string }[] = [
  { label: "Features", href: "#features", id: "features" },
  { label: "Customers", href: "#testimonials", id: "testimonials" },
  { label: "Calculator", href: "#roi-calculator", id: "roi-calculator" },
  { label: "Pricing", href: "#pricing", id: "pricing" },
  { label: "FAQ", href: "#faq", id: "faq" },
  { label: "Contact", href: "#contact", id: "contact" },
];

function handleScrollToSection(e: React.MouseEvent, targetId: string) {
  e.preventDefault();
  const element = document.getElementById(targetId);
  if (element) {
    // Land at the very top of the section (no header offset — the header
    // auto-hides on scroll-down, so it never overlaps the target).
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [activeId, setActiveId] = useState<string>("");
  const lastY = useRef(0);
  const reduce = useReducedMotion();

  // Stagger entrance for each menu item; reduced-motion → fade only, no slide.
  const itemVariants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.2, 0.7, 0.2, 1] as const },
        },
      };

  // Scroll direction → show/hide
  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < 80) {
        setVisible(true);
      } else if (delta > 6) {
        setVisible(false);
        setOpen(false);
      } else if (delta < -6) {
        setVisible(true);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section via IntersectionObserver
  useEffect(() => {
    const sections = NAV_ITEMS
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visibleEntries[0]) {
          setActiveId(visibleEntries[0].target.id);
        } else if (sections[0].getBoundingClientRect().top > 0) {
          // Scrolled back above the first tracked section — nothing is in the
          // observed band, so clear the highlight instead of leaving it stuck
          // on whichever section was last active.
          setActiveId("");
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // While the mobile overlay is open: lock background scroll and close on Escape.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-3 z-50 mx-auto w-full max-w-[1400px] px-4 transition-transform duration-300 ease-out sm:px-6 md:top-4 md:px-8 ${
        visible ? "translate-y-0" : "-translate-y-[150%]"
      }`}
      data-edit-section="Header"
    >
      <div
        className="relative z-50 flex items-center justify-between gap-4 rounded-[20px] border bg-white/70 px-4 py-2 backdrop-blur-md sm:px-6 md:px-[30px] md:py-[10px]"
        style={{ borderColor: "var(--color-stroke-brand)" }}
        data-edit-id="header-bar"
        data-edit-label="Header bar"
      >
        {/* Logo */}
        <a
          href="/"
          className="flex shrink-0 items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0"
          data-edit-id="header-logo"
          data-edit-label="Logo"
        >
          <Logo size={30} />
        </a>

        {/* Nav (desktop) */}
        <nav
          className="hidden flex-1 items-center justify-center gap-6 lg:flex xl:gap-10"
          data-edit-id="header-nav"
          data-edit-label="Nav links"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeId === item.id;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleScrollToSection(e, item.id)}
                className="group relative py-1 text-[14px] font-medium text-[#1d1d23] transition-colors hover:text-[#6E56CF] xl:text-[15px]"
                data-edit-id={`nav-${item.label.toLowerCase()}`}
                data-edit-label={`Nav: ${item.label}`}
              >
                {item.label}
                <span
                  aria-hidden
                  className={`nav-underline-glow pointer-events-none absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full bg-gradient-to-r from-[#8B79E6] to-[#6E56CF] transition-transform duration-500 ease-out ${
                    active ? "nav-underline-glow--active" : ""
                  }`}
                  style={{
                    transform: active ? "scaleX(1)" : "scaleX(0)",
                    boxShadow: active ? "0 0 8px rgba(110,86,207,0.55)" : "none",
                  }}
                />
                <span
                  aria-hidden
                  className="nav-underline-glow nav-underline-glow--hover pointer-events-none absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#8B79E6] to-[#6E56CF] transition-transform duration-300 ease-out group-hover:scale-x-100"
                  style={{ opacity: active ? 0 : 0.5 }}
                />
              </a>
            );
          })}
        </nav>

        {/* CTA (desktop/tablet) — self-serve signup, real navigation. */}
        <a
          href="/signup"
          className="hidden shrink-0 items-center gap-2 rounded-[12px] bg-[#6E56CF] px-3.5 py-2 text-[14px] font-semibold text-white drop-shadow-[0_0_10px_rgba(170,153,236,0.3)] transition-[transform,filter] duration-200 hover:scale-[1.02] hover:drop-shadow-[0_0_16px_rgba(170,153,236,0.45)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 sm:inline-flex sm:px-4 sm:text-[14px]"
          data-edit-id="header-cta"
          data-edit-label="Header CTA"
        >
          <span className="hidden sm:inline">Start free trial</span>
          <span className="sm:hidden">Start</span>
        </a>

        {/* Mobile menu toggle — three bars morph into an X */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-stroke-brand)] bg-white/60 text-[#1d1d23] lg:hidden"
        >
          <span className="relative block h-3.5 w-[18px]" aria-hidden>
            <motion.span
              className="absolute left-0 block h-0.5 w-full rounded-full bg-[#6E56CF]"
              style={{ top: 0 }}
              animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
              transition={{ duration: 0.42, ease: [0.5, 0.2, 0.1, 1.35] }}
            />
            <motion.span
              className="absolute left-0 block h-0.5 w-full rounded-full bg-[#6E56CF]"
              style={{ top: 6 }}
              animate={open ? { opacity: 0, scaleX: 0.2 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            <motion.span
              className="absolute left-0 block h-0.5 w-full rounded-full bg-[#6E56CF]"
              style={{ top: 12 }}
              animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }}
              transition={{ duration: 0.42, ease: [0.5, 0.2, 0.1, 1.35] }}
            />
          </span>
        </button>
      </div>

      {/* Mobile fullscreen menu overlay. Sits at z-40 (below the z-50 header
          bar) so the morphing X stays visible and tappable to close. Any click
          on the frosted backdrop also closes it. */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-white/80 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={() => setOpen(false)}
          >
            <motion.nav
              className="flex h-full w-full flex-col items-center justify-center gap-3 px-8"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
              }}
              initial="hidden"
              animate="visible"
            >
              {NAV_ITEMS.map((item) => {
                const active = activeId === item.id;
                return (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    variants={itemVariants}
                    onClick={(e) => {
                      setOpen(false);
                      handleScrollToSection(e, item.id);
                    }}
                    className={`text-3xl font-semibold tracking-tight transition-colors ${
                      active ? "text-[#6E56CF]" : "text-[#1d1d23]"
                    }`}
                  >
                    {item.label}
                  </motion.a>
                );
              })}
              {/* Primary CTA — on phones the header button is hidden, so the
                  overlay must carry the conversion action. */}
              <motion.a
                href="/signup"
                variants={itemVariants}
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex items-center justify-center rounded-[14px] bg-[#6E56CF] px-8 py-3 text-lg font-semibold text-white drop-shadow-[0_0_16px_rgba(170,153,236,0.4)] transition-transform duration-200 active:scale-[0.98]"
              >
                Start free trial
              </motion.a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
