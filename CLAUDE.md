# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **Bun** (`bun.lock` is the lockfile of record; a `package-lock.json` also exists but Bun is used).

```bash
bun install          # install deps
bun run dev          # Vite dev server (SSR)
bun run build        # production build (Nitro → Cloudflare target)
bun run build:dev    # build in development mode
bun run preview      # preview a production build
bun run lint         # ESLint over the repo
bun run format       # Prettier --write .
```

There is no test suite and no separate typecheck script; type errors surface through the Vite build and the editor.

## Architecture

This is a **single-page marketing site** ("FocusFlow") built on **TanStack Start** (React 19, SSR) and deployed to **Cloudflare** via **Nitro**. It originates from **Lovable** and syncs back to it.

### Build config — do not add plugins manually
`vite.config.ts` wraps `@lovable.dev/vite-tanstack-config`, which already bundles `tanstackStart`, `viteReact`, `tailwindcss`, `tsConfigPaths`, `nitro` (Cloudflare target), the dev-only `componentTagger`, `VITE_*` env injection, the `@/*` path alias, React/TanStack dedupe, and error-logger plugins. Re-adding any of these breaks the app with duplicate plugins. Pass extra config through `defineConfig({ vite: { ... } })`.

### Routing
File-based routing under `src/routes/` (see `src/routes/README.md` for conventions). `src/routes/__root.tsx` is the app shell (html/head/body, fonts, meta, error + 404 boundaries, `QueryClientProvider`). `src/routes/index.tsx` is the whole landing page — it composes the section components from `src/components/landing/` in order. `src/routeTree.gen.ts` is **auto-generated — never edit by hand**. `src/router.tsx` creates the router with a `QueryClient` in context and `scrollRestoration: false` (scroll reset is handled manually in `__root.tsx`).

### SSR error handling (custom, layered)
- `src/server.ts` — the SSR server entry (redirected here via `tanstackStart.server.entry`). Wraps the TanStack handler and converts catastrophic 500s — including errors h3 silently swallows into `{"unhandled":true,"message":"HTTPError"}` — into a rendered error page.
- `src/start.ts` — `createStart` request middleware that catches thrown errors and renders the error page (re-throwing `statusCode`-bearing responses).
- `src/lib/error-capture.ts`, `error-page.ts`, `lovable-error-reporting.ts` — capture/report plumbing (client errors reported to Lovable from the root error boundary).

### UI layers
- `src/components/ui/` — **shadcn/ui** (new-york style, `slate` base). Add components via the shadcn MCP server / CLI; `components.json` holds config and aliases.
- `src/components/landing/` — the page's own section components (`Hero`, `ContextSwitching`, `Features`, `Pricing`, etc.) plus mockups in `landing/mockups/`.
- **React Bits** components (`.jsx` + `.css`): `MagicBento`, `LogoLoop`, `GradualBlur`, `TextPressure`, `SplitText`, `DotField`. These come from the `@react-bits` registry (see `components.json` `registries`) and are vendored as JSX; keep their JSX/CSS pairing.

### Styling & design system
Tailwind **v4**, CSS-first config — there is no `tailwind.config`. All theme tokens live in `src/styles.css` under `@theme inline`: shadcn CSS-variable colors plus **Focus Flow brand tokens** (brand violet `#6E56CF`, a refined Radix "Violet" scale that overrides Tailwind's default violet, mint secondary accent, glows). Fonts (Poppins, Instrument Serif, Roboto Flex) load from Google Fonts in `__root.tsx`. Prettier: 100 col, double quotes, semicolons, trailing commas.

**CTAs are centralized** in `src/components/landing/cta.tsx` — use the exported `CTA_PRIMARY` / `CTA_SECONDARY_LIGHT` / `CTA_SECONDARY_DARK` class strings (compose with `cn()` and append per-call sizing) plus `<GlareHover />` on primaries. Don't hand-roll button styles.

### Animation choreography (the fragile part)
The page relies on **GSAP ScrollTrigger** (registered in `index.tsx`) and **Framer Motion**. Two coupled mechanisms:

1. **Layout-settling refresh** — `index.tsx` calls `ScrollTrigger.refresh()` on a timer, on `fonts.ready`, and on `window load`. Late-loading fonts/images/mockups and the pinned `Features` section shift start positions after triggers are measured; without these refreshes, reveals fire early. Preserve this when adding scroll animations.
2. **Page-load intro handshake** — `src/lib/page-load-intro.ts` coordinates the one-time `PageLoader` overlay with the `Hero` entrance via module-scoped (not effect-based, to avoid races) state and a promise (`whenIntroReveals()` / `revealIntro()`, timed by `INTRO_REVEAL_MS` / `INTRO_TOTAL_MS`).

`src/lib/mockup-scale.ts` shares the hero mockup's scroll-grow target scale between `Hero.tsx` and `ContextSwitching.tsx` so the cover card emerges matching the mockup's final width — keep them consistent.

## Lovable sync — git constraints
This project is connected to Lovable (`AGENTS.md`). Commits pushed to the connected branch sync back and appear in the Lovable editor, so keep the branch in a working state. **Do not rewrite published history** — no force-push, rebase, amend, or squash of already-pushed commits, or the user loses project history on Lovable's side.
