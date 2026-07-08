import { useEffect, useRef, useState } from "react";
import { SplitText } from "./SplitText";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useEmblaCarousel from "embla-carousel-react";
import { MuteMockup } from "./mockups/MuteMockup";
import { VisibilityMockup } from "./mockups/VisibilityMockup";
import { AnalyticsMockup } from "./mockups/AnalyticsMockup";

gsap.registerPlugin(ScrollTrigger);

type Feature = {
  title: string;
  description: string;
  Mockup: React.ComponentType;
};

const FEATURES: Feature[] = [
  {
    title: "Auto-Mute Distractions",
    description:
      "Automatically pauses Slack notifications, Teams messages, and emails the second you enter a flow state.",
    Mockup: MuteMockup,
  },
  {
    title: "Team Focus Visibility",
    description:
      "Instantly see who is in a flow state and who is available. Respect deep work boundaries without guessing when it's safe to ping your teammates.",
    Mockup: VisibilityMockup,
  },
  {
    title: "Capacity Analytics",
    description:
      "Track how much deep work your team is actually getting, and measure the exact budget saved from reduced context-switching.",
    Mockup: AnalyticsMockup,
  },
];

const CARD_W = 640;
const CARD_H = 457;
const DIST_X = 50;
const DIST_Y = 55;
const SKEW = 6;

function slot(i: number, total: number) {
  return {
    x: i * DIST_X,
    y: -i * DIST_Y,
    z: -i * DIST_X * 1.5,
    zIndex: total - i,
  };
}

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const total = FEATURES.length;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    const texts = textRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length !== total) return;

    // Scope every GSAP instance (sets, matchMedia, ScrollTrigger pin) to the
    // section so a single ctx.revert() on cleanup tears it all down and removes
    // the pin-spacer. Without this, a remount (HMR or the router error boundary)
    // can leave an orphaned pin-spacer wrapping the section, which makes React's
    // next removeChild throw and the page jump back to the top.
    const ctx = gsap.context(() => {
      // Initial placement
      cards.forEach((el, i) => {
        const s = slot(i, total);
        gsap.set(el, {
          x: s.x,
          y: s.y,
          z: s.z,
          xPercent: -50,
          yPercent: -50,
          skewY: SKEW,
          zIndex: s.zIndex,
          opacity: 1,
          transformOrigin: "center center",
          force3D: true,
        });
      });
      texts.forEach((t, i) => gsap.set(t, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 20 }));

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1280px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: `+=${(total - 1) * 900}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            onUpdate: (self) => {
              const idx = Math.min(total - 1, Math.round(self.progress * (total - 1)));
              setActiveIndex(idx);
            },
          },
        });

        // For each transition, drop the top card and promote the rest one slot forward.
        for (let step = 0; step < total - 1; step++) {
          const topCard = cards[step];
          tl.to(topCard, { y: "+=600", opacity: 0, duration: 1, ease: "power2.in" }, step);
          // Move remaining cards forward one slot
          for (let j = step + 1; j < total; j++) {
            const target = slot(j - step - 1, total);
            tl.to(
              cards[j],
              {
                x: target.x,
                y: target.y,
                z: target.z,
                duration: 1,
                ease: "power2.inOut",
              },
              step,
            );
          }
          // Cross-fade text
          tl.to(texts[step], { opacity: 0, y: -20, duration: 0.4, ease: "power2.in" }, step + 0.1);
          tl.to(
            texts[step + 1],
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
            step + 0.5,
          );
        }

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative overflow-hidden"
      style={{ backgroundColor: "#F8F9FB" }}
    >
      <div ref={innerRef} className="relative w-full py-24 md:py-32">
        {/* Violet gradient wash — faded to transparent at the top/bottom edges so it
          dissolves into the neighbouring sections instead of cutting against them. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(170deg, #F8F9FB 0%, #F3F0FC 25%, #EDE8FA 50%, #F3F0FC 75%, #F8F9FB 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 18%, black 92%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 18%, black 92%, transparent 100%)",
          }}
        />
        {/* Aurora layers — edge-masked as a group so the blurred blobs dissolve
          before the section boundary instead of being cut by overflow-hidden. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
          }}
        >
          {/* Soft aurora mesh — upper left */}
          <div
            className="pointer-events-none absolute -left-[20%] -top-[15%] h-[900px] w-[900px] rounded-full opacity-70"
            style={{
              background:
                "radial-gradient(circle at 40% 40%, rgba(110, 86, 207, 0.28) 0%, rgba(170, 153, 236, 0.14) 35%, transparent 70%)",
              filter: "blur(100px)",
            }}
          />
          {/* Mint counter-tone — lower right. Soft Apple-style accent, subordinate
            to the upper-left violet aurora. */}
          <div
            className="pointer-events-none absolute -right-[15%] bottom-[0%] h-[800px] w-[800px] rounded-full opacity-60"
            style={{
              background:
                "radial-gradient(circle at 60% 50%, rgba(135, 212, 196, 0.30) 0%, rgba(135, 212, 196, 0.16) 40%, transparent 75%)",
              filter: "blur(110px)",
            }}
          />
          {/* Center highlight for headline area */}
          <div
            className="pointer-events-none absolute left-1/2 top-[2%] h-[420px] w-[1000px] -translate-x-1/2 rounded-full opacity-30"
            style={{
              background: "radial-gradient(circle, rgba(229, 216, 251, 0.7) 0%, transparent 65%)",
              filter: "blur(70px)",
            }}
          />
        </div>
        {/* Subtle noise overlay for premium paper-like texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "96px 96px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            {/* Plays once (no `replay`): this section is pinned while the cards
              scroll, and a replaying SplitText would reset to opacity:0 mid-pin
              — making the heading vanish. Playing once keeps it in place until
              the section unpins after the last card. */}
            <SplitText
              as="h2"
              reveal
              className="text-balance text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl"
            >
              Everything you need for{" "}
              <span className="italic font-serif font-normal text-violet-700">
                deep, uninterrupted
              </span>{" "}
              work.
            </SplitText>
          </div>

          {/* Desktop: pinned 2-column with text cross-fade + 3D card stack */}
          <div className="mt-[100px] hidden items-center gap-16 xl:mt-[120px] xl:grid xl:grid-cols-12">
            {/* Left: text */}
            <div className="relative min-h-[280px] pt-5 md:pt-10 xl:col-span-5">
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  ref={(el) => {
                    textRefs.current[i] = el;
                  }}
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  <div className="mb-3 text-sm font-semibold text-violet-700">
                    {String(i + 1).padStart(2, "0")} / {String(FEATURES.length).padStart(2, "0")}
                  </div>
                  <h3 className="mb-5 text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
                    {f.title}
                  </h3>
                  <p className="text-lg leading-relaxed text-neutral-600">{f.description}</p>
                  <div className="mt-8 flex gap-2">
                    {FEATURES.map((_, j) => (
                      <span
                        key={j}
                        className={`h-1.5 rounded-full transition-all ${
                          j === activeIndex ? "w-8 bg-violet-700" : "w-4 bg-neutral-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right: card stack */}
            <div
              className="card-swap-container mx-auto translate-y-6 md:translate-y-10 xl:col-span-7"
              style={{ width: CARD_W, height: CARD_H, position: "relative" }}
            >
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className={`card overflow-hidden border ${i === activeIndex ? "border-[#6E56CF]" : "border-[#AA99EC]"}`}
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    boxShadow:
                      "0 30px 70px -32px rgba(31, 29, 66, 0.45), 0 12px 32px -20px rgba(110, 86, 207, 0.22)",
                  }}
                >
                  <f.Mockup />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: swipeable carousel */}
          <MobileCarousel />
        </div>
      </div>
    </section>
  );
}

function MobileCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "center" });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  return (
    // Full-bleed on phones (cancels the section's px-6) so the feature cards
    // get the widest possible stage; back inside the padding from sm up.
    <div className="-mx-6 sm:mx-0 xl:hidden">
      {/* Interior padding gives the cards' soft drop-shadow room to render before
          embla's required overflow-hidden clips the viewport — without it the
          shadow is sliced square at the bottom/side edges. */}
      <div className="overflow-hidden px-3 pb-14 pt-4" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="min-w-0 flex-[0_0_92%] px-2 sm:flex-[0_0_88%]">
              <div className="flex h-full flex-col">
                <div className="mb-6 space-y-3.5 px-1">
                  {/* Minimal numeric index */}
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold tracking-wide tabular-nums">
                    <span className="text-violet-700">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-neutral-300">/</span>
                    <span className="font-medium text-neutral-400">
                      {String(FEATURES.length).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="text-balance text-[26px] font-bold leading-[1.15] tracking-tight text-neutral-900 sm:text-[30px]">
                    {f.title}
                  </h3>
                  <p className="max-w-[44ch] text-[15px] leading-relaxed text-neutral-500 sm:text-base">
                    {f.description}
                  </p>
                </div>
                {/* Portrait on phones — the mockups reflow (see .mockup-inner in
                    styles.css) and need the vertical room; desktop ratio from sm. */}
                <div
                  className={`relative mt-auto aspect-[3/4] overflow-hidden rounded-2xl border bg-[#0a0a0e] sm:aspect-[640/457] ${i === selected ? "border-[#6E56CF]" : "border-[#AA99EC]"}`}
                  style={{
                    boxShadow:
                      "0 30px 70px -32px rgba(31, 29, 66, 0.45), 0 12px 32px -20px rgba(110, 86, 207, 0.22)",
                  }}
                >
                  <f.Mockup />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center">
        {FEATURES.map((_, i) => (
          // Button = comfortable touch target; inner span = the visual dot.
          <button
            key={i}
            type="button"
            aria-label={`Go to feature ${i + 1}`}
            onClick={() => emblaApi?.scrollTo(i)}
            className="flex h-9 items-center px-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60"
          >
            <span
              className={`h-1.5 rounded-full transition-all ${
                i === selected ? "w-8 bg-violet-700" : "w-4 bg-neutral-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
