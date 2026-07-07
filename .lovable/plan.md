# Section 4 — Features (3D CardSwap, scroll-scrubbed)

A pinned section that ties a GSAP timeline to scroll progress: the top card on the 3D stack drops away while the left-column copy cross-fades to the next feature. Three states total.

## Figma assets

I pulled the three mockups from Figma via the desktop MCP and confirmed all three render correctly:

1. **Feature-Mute** (62:3606) — Integrations page with Slack/Discord/Teams/Figma/Gmail/WhatsApp toggle cards
2. **Feature-Visibility** (62:391) — Focus dashboard with the "Team Flow" panel highlighted (Avi, Sarah, Marcus, Emma, James, Olivia)
3. **Feature-Analytics** (62:3332) — Analytics dashboard with Focus Trend bar chart + Distraction Breakdown donut chart

The Figma Desktop MCP is read-only and its `localhost:3845` URLs aren't reachable from Lovable's sandbox, so I can't drop the raw Figma exports straight into the project. I'll **recreate each mockup as a pixel-faithful React component** using Tailwind + lucide-react icons + a small inline SVG chart for the analytics view. This keeps them crisp at any size, theme-able, and lighter than PNGs. (If you'd rather use real PNG exports, export them from Figma and drop them in chat — I'll swap them in.)

## Files

- `src/components/landing/CardSwap.tsx` — new. The component from your brief, with `setInterval` / `pauseOnHover` removed and a `progress` prop (0…1) wired into a GSAP timeline. Each scroll step plays one drop animation.
- `src/components/landing/mockups/MuteMockup.tsx`, `VisibilityMockup.tsx`, `AnalyticsMockup.tsx` — new. React/Tailwind recreations of the three Figma frames.
- `src/styles.css` — append the `.card-swap-container` / `.card` rules from your brief.
- `src/components/landing/Features.tsx` — new. The pinned section, headline, 2-col grid, ScrollTrigger wiring, cross-fading copy.
- `src/routes/index.tsx` — mount `<Features />` after `<ContextSwitching />`.

## Layout

```text
┌─ section py-32 bg-[#F8F9FB] (pinned) ─────────────────────┐
│   Badge: "How it works"  (purple)                          │
│   H2: Everything you need for deep, uninterrupted work.    │
│                                                            │
│   grid lg:grid-cols-2 gap-16 items-center max-w-7xl        │
│   ┌── Left: feature copy ──┐   ┌── Right: CardSwap ──┐    │
│   │ #01 (small label)      │   │   ╲                  │    │
│   │ Title (cross-fade)     │   │    ╲ tilted stack    │    │
│   │ Description            │   │     ╲ of 3 cards     │    │
│   │ 3 progress dots        │   │                      │    │
│   └────────────────────────┘   └──────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

## Animation

- Pin the section with ScrollTrigger: `start: "top top"`, `end: "+=2500"`, `pin: true`, `scrub: 1`.
- Timeline has 3 stages. Each stage = drop the current top card (`y: '+=500', opacity: 0`) and advance the remaining cards forward one slot (interpolating `x/y/z/zIndex`).
- A separate progress-driven swap of the left-column text: cross-fade the copy on each stage boundary using `gsap.to` with `overwrite: true`.
- Progress dots highlight the active index.
- Reduced motion: skip the pin/scrub and render the first card statically.

## Technical notes

- `gsap` and `gsap/ScrollTrigger` are already used elsewhere in the project (Hero / ContextSwitching), so no new deps.
- The CardSwap `useEffect` registers a single ScrollTrigger that owns the timeline; cleanup kills the trigger on unmount to avoid duplicate triggers during HMR.
- Card visuals: `w-full h-full rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-white` wrapping the mockup component.
- Card stack sized for desktop (`width=600, height=450`); on `<lg` the section unpins and renders a simple stacked vertical list of feature + mockup pairs so mobile stays usable.

When you approve, I'll implement everything in one pass and verify with a Playwright screenshot at the pinned scroll position.
