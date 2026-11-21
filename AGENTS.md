# SuperBenefit Website

Public website for SuperBenefit — an Astro 7 site deployed to Cloudflare Workers. Presents SuperBenefit's work across governance, DAOs, and systems innovation through a scroll-animated homepage and a contact form.

## Relaunch in progress

The site is being relaunched on EmDash (CMS on D1 + R2). Work targets the `feature/relaunch` branch, not `main`. Read `docs/relaunch/brief.md` (goal and working rules), `architecture.md` (decided design), `mockups/README.md` (the owner's design, which pages are built to match) and `issues.md` (the work) before changing anything. Two rules from the brief apply to every task:
- Claims about Astro, EmDash or Cloudflare come from current official docs or source, with a link.
- Worker domain and Cloudflare Access settings are configured by a human in the dashboard. Do not put them in config files or change them through the API.

The sections below describe the code as it is today, before EmDash is installed.

## Commands

**Setup** (first time):
```bash
npm install
cp .env.example .env   # optional; leave KNOWLEDGE_API_URL blank to use mock data; holds local test keys for the contact form
```

- `npm run dev` — Start dev server (localhost:4321)
- `npm run build` — Generate Worker types (`wrangler types`), then build to `dist/`
- `npm run check` — Generate Worker types, then TypeScript and Astro validation
- `npm run preview` — Preview built site locally
- `npm run deploy` — Build + deploy to Cloudflare Workers via Wrangler

No test runner or linter is configured. Workers Builds builds every branch and posts a preview URL on pull requests; `main` deploys to production.

## Gotchas

- **Dev server holds stdin** — Run `npm run dev` in a dedicated background process. Do not chain it with other commands or the shell will appear unresponsive.
- **Draft pages** — `/about`, `/projects`, `/services`, `/support` and `/updates/*` set `pageIsDraft = true`: they render fully in `npm run dev` but show a "Coming soon" placeholder in production builds, and `astro.config.mjs` leaves them out of the sitemap. To ship one, set `pageIsDraft = false` and remove its path from the sitemap filter. The finished routes are `/`, `/contact`, `/404` and `/500`.

## Architecture

### Rendering & Deployment
- **Output mode**: `server` (SSR via Cloudflare Workers, with per-page `prerender` opt-in)
- **URLs**: `trailingSlash: 'always'`. Internal links end in `/` (`/contact/`, not `/contact`); Workers static assets 307 the extensionless form to it
- **Adapter**: `@astrojs/cloudflare`; Sharp optimizes images for prerendered pages at build time, and the Cloudflare Images binding serves any on-demand route
- **Static assets**: Served from `dist` through the `ASSETS` binding (`wrangler.jsonc`). No custom security headers are set: there is no `public/_headers` file
- **Every page is prerendered** (`export const prerender = true`), so the Worker only runs server actions such as the contact form
- **Styles**: all component CSS is inlined into the HTML (`build.inlineStylesheets: 'always'`)

### Content Collections & Data Loading
- Two collections defined in `src/content.config.ts`, `updates` and `projects`, sharing one `contentSchema`
- Custom Astro loaders in `src/loaders/` fetch from an external knowledge API at build time
- `KNOWLEDGE_API_URL` sets the `updates` endpoint; if it is unset, rejected or unreachable, the loader falls back to `src/data/mock-updates.json`. `projectsLoader()` is called with no endpoint, so `projects` always comes from `src/data/mock-projects.json`
- Loader endpoint validation: HTTPS-only, host allowlist restricted to `knowledge.superbenefit.org`

### Homepage Composition (src/pages/index.astro)
Hero → SectionDivider → MissionStatement → SectionDivider → InternalServices → SectionDivider → ExternalServices → SectionDivider → CallToAction.

**SectionDivider** (`src/components/SectionDivider.astro`) blends one section's background into the next; its `from` and `to` props take `'cream' | 'charcoal' | 'green' | 'orange' | 'black'`.

### Contact Form (src/pages/contact.astro, src/actions/contact.ts)
- An Astro server action validates the form, verifies the Cloudflare Turnstile token with `TURNSTILE_SECRET_KEY`, and sends the message through the `EMAIL` send-email binding to `CONTACT_EMAIL`
- In production, `CONTACT_EMAIL` and `TURNSTILE_SECRET_KEY` are Worker secrets (`wrangler secret put …`); the recipient must also be listed in `send_email` in `wrangler.jsonc`
- `name` and `subject` must not contain CR or LF; a line break returns a field error
- The `CONTACT_RATE_LIMITER` [`ratelimits` binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) allows 5 posts per client IP (`CF-Connecting-IP`) per 60 seconds and returns `TOO_MANY_REQUESTS` after that. Cloudflare counts per location and approximately. It is declared at the top level and again in `previews` (own `namespace_id`), because previews inherit no bindings
- Server faults (an unset secret, a missing binding) show visitors one generic message; the detail is logged with `console.error`. Do not put configuration detail in an `ActionError` message: Astro sends it to the browser as is
- `contact.astro` is prerendered, so the Turnstile site key is fixed at build time: `PUBLIC_TURNSTILE_SITE_KEY` from `.env` locally, otherwise from `vars` in `wrangler.jsonc`
- Turnstile uses explicit rendering. The widget is rendered and the form handler attached on `astro:page-load`, and the widget is removed on `astro:before-swap`, because `<ClientRouter />` runs a page's bundled script only once per visit

### Styling Approach
- **Design tokens** in `src/styles/global.css` are the single source of truth — all colors, typography, spacing, shadows, and transitions derive from CSS custom properties in `:root`.
- **Custom properties** in component-scoped `<style>` blocks remain the preferred pattern for site-layout Astro components where they provide better readability than utility classes.
- **Tailwind CSS v4** (through `@tailwindcss/vite`) is available; its utilities read from the same `:root` token block via `@theme inline`. `clsx` and `tailwind-merge` are installed for composing classes.
- **RGB channel variants** (`--color-black-rgb`, `--color-orange-rgb`, etc.) enable alpha compositing: `rgb(var(--color-black-rgb) / 0.8)`. Prefer these over hardcoded `rgba()` values.
- **fonts**: Playfair Display (serif, `--font-serif`) and Inter (sans, `--font-sans`) via Astro's `fonts` config. CSS vars `--font-playfair` and `--font-inter` also available.
- **Fluid typography**: `clamp()`-based scale from `--text-xs` to `--text-hero`.

### Animations (src/styles/animations.css)
All scroll-driven — no JavaScript animation libraries:
- **Reveal**: `data-animate="fade-up|fade-left|fade-right|scale-in"` triggers CSS `animation-timeline: view()`
- **Parallax**: `data-parallax` on background elements, GPU-composited via `transform: translateY()`
- **Header solidify**: Transparent → blurred over first 300px via `animation-timeline: scroll()`
- **Stagger**: Components pass `--stagger` CSS variable for sequential reveal delays
- **Reduced motion**: Respected via `@media (prefers-reduced-motion: reduce)`

### TypeScript
- Strict mode with `strictNullChecks`
- Path aliases: `@components/*`, `@layouts/*`, `@styles/*`, `@loaders/*`
- Requires Node.js >= 22.23.4 (Astro 7.4 minimum); `.nvmrc` selects Node 24

### Security
- `src/utils/sanitize.ts` strips dangerous HTML from update content before rendering with `set:html` (`src/pages/updates/[...slug].astro`)
- Loaders validate endpoint URLs (HTTPS, host allowlist)
- The contact form is protected by Turnstile, length limits on every field, a CR/LF check on `name` and `subject`, and a per-IP rate limit

## Code Style

- **Prerender opt-in**: Static pages declare `export const prerender = true` in frontmatter. Without this, pages render on the Worker at request time. Every current page opts in.
- **Responsive breakpoints**: 1024px (tablet landscape), 768px (tablet), 480px (mobile). 768px is the main one; reuse these values rather than adding new ones.
