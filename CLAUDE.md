# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SuperBenefit public website — an Astro 5 site deployed to Cloudflare Workers. The site presents SuperBenefit's work across governance, DAOs, and systems innovation through a visual storytelling homepage with themed content sections.

## Commands

**Setup** (first time):
```bash
npm install
cp .env.example .env   # optional; leave KNOWLEDGE_API_URL blank to use mock data
```

- `npm run dev` — Start dev server (localhost:4321)
- `npm run build` — Build to `dist/`
- `npm run check` — TypeScript and Astro validation
- `npm run preview` — Preview built site locally
- `npm run deploy` — Build + deploy to Cloudflare Workers via Wrangler

No test runner or linter is configured.

## Gotchas

- **Dev server holds stdin** — Run `npm run dev` in a dedicated background process. Do not chain it with other commands or the shell will appear unresponsive.
- **Placeholder routes** — The homepage links to `/events`, `/gatherings`, and `/projects` but these pages don't exist yet. Only `/`, `/about`, and `/blog/*` have page files.

## Architecture

### Rendering & Deployment
- **Output mode**: `server` (SSR via Cloudflare Workers, with per-page `prerender` opt-in)
- **Adapter**: `@astrojs/cloudflare` with Smart Placement (colocates Worker near `knowledge.superbenefit.org`)
- **Static assets**: Served from `dist/client` by Cloudflare; security headers in `public/_headers`

### Content Collections & Data Loading
- Two collections defined in `src/content.config.ts`: `blog` and `projects`
- Custom Astro loaders in `src/loaders/` fetch from an external knowledge API at build time
- `KNOWLEDGE_API_URL` env var controls the endpoint; if unset or unreachable, loaders fall back to `src/data/mock-*.json`
- Loader endpoint validation: HTTPS-only, host allowlist restricted to `knowledge.superbenefit.org`

### Homepage Composition (src/pages/index.astro)
The homepage renders in sequence: Hero → SectionDivider (wave) → MissionStatement → CardsStage (dark charcoal wrapper containing three StorySection cards) → CallToAction.

**StorySection** (`src/components/StorySection.astro`) is the core parameterized component. It accepts a `theme` prop (`'green' | 'orange' | 'red'`), a background image, and content data. Each instance renders as an elevated card (20px border-radius, box-shadow, 3px accent-colored top stripe) floating over the dark CardsStage. Cards have 48px vertical gaps and the first/last cards overlap into the adjacent cream/orange sections by ~60px.

StorySection has two layout variants controlled by the `variant` prop:
- `'default'` — featured card + 2-column grid + CTA slot
- `'compact'` — 4-column fluid grid of all items

### Styling Approach
- **Plain CSS** — no Tailwind. Component-scoped `<style>` blocks in `.astro` files plus two global stylesheets.
- **Design tokens** in `src/styles/global.css` as CSS custom properties (colors, typography, spacing, shadows, transitions).
- **Fonts**: Playfair Display (serif, `--font-serif`) and Inter (sans, `--font-sans`) loaded via Astro experimental fonts. CSS vars `--font-playfair` and `--font-inter` are also available.
- **Fluid typography**: `clamp()`-based scale from `--text-xs` to `--text-hero`.

### Animations (src/styles/animations.css)
All scroll-driven — no JavaScript animation libraries:
- **Reveal**: `data-animate="fade-up|fade-left|fade-right|scale-in"` attributes trigger CSS `animation-timeline: view()` animations
- **Parallax**: `data-parallax` attribute on background elements, GPU-composited via `transform: translateY()`
- **Header solidify**: Transparent → blurred background over first 300px of scroll via `animation-timeline: scroll()`
- **Stagger**: Components pass `--stagger` CSS variable for sequential reveal delays
- **Reduced motion**: Respected via `@media (prefers-reduced-motion: reduce)`

### TypeScript
- Strict mode with `strictNullChecks`
- Path aliases: `@components/*`, `@layouts/*`, `@styles/*`, `@loaders/*`
- Requires Node.js ≥ 22

### Security
- `src/utils/sanitize.ts` strips dangerous HTML from blog content before rendering with `set:html`
- Loaders validate endpoint URLs (HTTPS, host allowlist)
- `public/_headers` sets CSP, HSTS, X-Frame-Options at the Cloudflare edge

## Code Style

- **Component theming**: Uses `data-theme` attribute selectors (`[data-theme="green"]`), not CSS classes or custom properties, for theme-specific styles.
- **Prerender opt-in**: Static pages declare `export const prerender = true` in frontmatter. Without this, pages render on the Worker at request time.
- **Responsive breakpoints**: 1024px (tablet landscape), 768px (tablet), 480px (mobile) — used consistently across all components.
