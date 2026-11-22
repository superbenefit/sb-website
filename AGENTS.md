# SuperBenefit Website

Public website for SuperBenefit — an Astro 7 site deployed to Cloudflare Workers. Presents SuperBenefit's work across governance, DAOs, and systems innovation through a homepage with an auto-advancing project selector, project and update pages, and a contact form.

## Relaunch in progress

The site is being relaunched on EmDash (CMS on D1 + R2). Work targets the `feature/relaunch` branch, not `main`. Read `docs/relaunch/brief.md` (goal and working rules), `architecture.md` (decided design), `mockups/README.md` (the owner's design, which pages are built to match) and `issues.md` (the work) before changing anything. Two rules from the brief apply to every task:
- Claims about Astro, EmDash or Cloudflare come from current official docs or source, with a link.
- Worker domain and Cloudflare Access settings are configured by a human in the dashboard. Do not put them in config files or change them through the API.

EmDash is installed (B2, issue #29): its admin is at `/_emdash/admin/`. The base layout (C1, issue #35) reads the header and footer menus and the closing band from EmDash and writes the head with `<EmDashHead>`. These page bodies read EmDash content: the home page (C3, issue #37); `/accelerator/` (C4, issue #38), the `pages` entry `accelerator` and the `supports` collection; `/services/` (C5, issue #39), the `pages` entry `services` and the `services` collection; `/projects/` and `/projects/{slug}/` (C6, issue #40), the `pages` entry `projects`, the `projects` collection and, on a project page, the `updates` that name it; `/updates/`, `/updates/page/{n}/` and `/updates/{slug}/` (C7, issue #41), the `pages` entry `updates` on the index, the `updates` collection and each update's `project`; `/about/` (C8, issue #42), the `pages` entry `about`; and `/contact/` (C9, issue #43), the `pages` entry `contact`. The other page bodies do not read EmDash content yet. `/support` and `/supports` 301 to `/accelerator/` through Astro's configured `redirects` in `astro.config.mjs`. The content model (five collections, three menus, the closing-band widget area) is `seed/seed.json` (B5, issue #32), applied by the setup wizard on an empty database; see `docs/relaunch/architecture.md`, Content model. URL patterns (B6, finding P1): `pages` is `/{slug}`, `projects` `/projects/{slug}`, `updates` `/updates/{slug}`; `services` (`/services`) and `supports` (`/accelerator`) are not routable, so they stay out of the sitemap and preview on the page that lists them. `src/pages/home.astro` 301s `/home` (the `home` entry's pattern URL) to `/`, keeping the query string so preview tokens reach `/`. Preview links only show drafts on pages that read their content with `getEmDashEntry()` or `getEmDashCollection()`. The sections below describe the code as it is today.

## Commands

**Setup** (first time):
```bash
npm install
cp .env.example .env   # leave KNOWLEDGE_API_URL blank to use mock data; holds local test keys for the contact form and the local EMDASH_SITE_URL
```

- `npm run dev` — Start dev server (localhost:4321)
- `npm run build` — Generate Worker types (`wrangler types`), type-check (`astro check`), then build to `dist/`. A type error fails the build
- `npm run check` — Generate Worker types, then TypeScript and Astro validation
- `npm run preview` — Preview built site locally
- `npm run deploy` — Build + deploy to Cloudflare Workers via Wrangler

No test runner or linter is configured. Workers Builds is the only CI: it runs `npm run build` (which type-checks) on every branch and posts a preview URL on pull requests; `main` deploys to production.

## Gotchas

- **Dev server holds stdin** — Run `npm run dev` in a dedicated background process. Do not chain it with other commands or the shell will appear unresponsive.
- **Draft pages** — no page sets `pageIsDraft` any more (C3 to C8 removed it), so no route shows a "Coming soon" placeholder in production builds. The finished routes are `/`, `/about`, `/accelerator`, `/contact`, `/projects/`, `/projects/{slug}/`, `/services`, `/updates/` (with `/updates/page/{n}/` and `/updates/{slug}/`), `/404` and `/500`.
- **Pages need a set-up database** — every page reads menus and the closing band from EmDash, so on a fresh local database finish setup first (`POST /_emdash/api/setup/dev-bypass` applies `seed/seed.json`, which holds the menus and the band). Until then the header and footer have no links and the band is not shown.
- **Local CMS setup** — `wrangler.jsonc` sets `EMDASH_SITE_URL=https://superbenefit.org` and local dev reads it, so `.env` sets `EMDASH_SITE_URL=http://localhost:4321` (as `.env.example` does). The local database, bucket and sessions live in `.wrangler/state`.
- **Local CMS sign-in** — `npm run dev` has no Access JWT. With Access configured, EmDash 1.5.0 offers no passkey locally (the wizard skips the administrator step and the login page redirects in a loop). Finish the setup wizard, then open `http://localhost:4321/_emdash/api/auth/dev-bypass?redirect=/_emdash/admin`, EmDash's documented development bypass: it signs in `dev@emdash.local` as Admin and only works under `astro dev`. Access roles cannot be tested locally. See `docs/relaunch/architecture.md`, Auth.
- **Generated files** — `wrangler types` writes `worker-configuration.d.ts`; builds write `.emdash/migrations.json`; `npm run dev` writes `emdash-env.d.ts` (collection types from the local database's schema). None are edited by hand. `emdash-env.d.ts` is committed and listed in `tsconfig.json`, as in EmDash's official templates, so builds without a dev server type-check against it; commit it again after a schema change.

## Architecture

### Rendering & Deployment
- **Output mode**: `server`; every page renders on demand on the Worker (`docs/relaunch/architecture.md`, Rendering per route). No page sets `prerender`
- **URLs**: `trailingSlash: 'ignore'`, Astro's [default](https://docs.astro.build/en/reference/configuration-reference/#trailingslash) (owner decision 2026-11-22, finding T1: `'always'` made the EmDash admin's URLs without a trailing slash 404). Internal links still end in `/` (`/contact/`, not `/contact`). Pages rendered on demand answer both forms with 200; the canonical uses the slash form
- **Adapter**: `@astrojs/cloudflare` with no options; images are transformed through the Cloudflare Images (`IMAGES`) binding, at build for prerendered pages and on demand otherwise. The adapter also adds the `SESSION` KV binding, the static assets config and `cache.enabled` (Workers Cache) to the Wrangler config it generates (`dist/server/wrangler.json`)
- **Worker entry**: `src/worker.ts`, EmDash's documented entry: Astro's handler, the co-editing room classes and the `scheduled` handler for the every-minute Cron Trigger (scheduled publishing, maintenance)
- **CMS**: EmDash on D1 (`DB`), R2 (`MEDIA`) and KV (`SESSION`), configured in `astro.config.mjs` and `wrangler.jsonc` as `docs/relaunch/architecture.md` describes. Admin and API under `/_emdash/`; `/sitemap.xml` and `/robots.txt` come from EmDash. Branch previews bind the shared staging resources in the `previews` block
- **CMS sign-in**: Cloudflare Access with GitHub (`access()` from `@emdash-cms/cloudflare` in `astro.config.mjs`), the only sign-in method on previews and production. The Worker checks the Access JWT on `/_emdash/admin` and the private `/_emdash/api` routes against the AUD tag in the secret `CF_ACCESS_AUDIENCE` and answers 401 "Authentication failed" without it. New accounts are Contributor; members of the GitHub team "Web Admins" become Admin (`roleMapping` keys are compared exactly with the group names Access returns). With GitHub sign-in this mapping does not take effect in EmDash 1.5.0 (finding R1): every new account is a Contributor, and an Admin sets Editor and Admin under Users in the CMS. Previews: the whole preview hostname is behind the previews Access application. Production: `superbenefit.org/_emdash/*` is behind its own Access application, with a Bypass application for `/_emdash/api/media/file/*`. Access applications and the secret are set by the owner in the dashboard (`docs/relaunch/issues.md`, B3)
- **Static assets**: Served from `dist/client`. No custom security headers are set: there is no `public/_headers` file
- **Every page renders on demand**: the layout reads EmDash menus and the closing band per request, so menu and band edits show without a rebuild
- **Route caching** (B6, `docs/relaunch/architecture.md`, Caching): Workers Cache through `cacheCloudflare()` (`cache` in `astro.config.mjs`); the adapter enables it in the generated Wrangler config. `routeRules` has one rule per public route (1 day, `swr` 7 days, tagged with the collections the route renders); the layout, `Header`, `Footer` and `ClosingBand` pass the settings, menu and widget-area cache hints to `Astro.cache.set()`, so EmDash purges cached pages on publish and on chrome edits. A new public route needs its rule in the same change: without one, a page using `BaseLayout` is still sent `Cloudflare-CDN-Cache-Control: public` (the layout's tag-only hints), so Cloudflare caches it for its heuristic TTL and a publish does not purge it (finding K2). A page that reads entries passes its query's `cacheHint`. `toolbar: "client"` keeps public HTML the same for editors. `astro dev` never caches, and `astro preview` sends the cache headers but has no Workers Cache, so hits and purges are only seen on Cloudflare
- **Layout** (`src/layouts/BaseLayout.astro`, built to `docs/relaunch/mockups/`): `<EmDashHead>` with a context from `createPublicPageContext()` writes the meta tags and JSON-LD; then `Header` (menu `header`; its last item is the Contact pill and the mobile sheet's button), the page, `ClosingBand` (widget area `closing-band`), `FooterFade` and `Footer` (menus `footer-site` and `footer-elsewhere`). Props: `bandFrom` (colour of the last section, for the wave), `bandLabel`/`bandHref` (the band's first button, default "Get in touch" to `/contact/`), `bandLead="band"` (contact: the band's own link leads as the accent button and `bandLabel`/`bandHref` follow as the outline button, left out without both), `closingBand={false}` (error pages), `canonical={null}` (error pages), `cache={false}` (error pages: `Astro.cache.set(false)`, and the parts set no hints after it)
- **Shared mockup parts** (`src/styles/parts/<class>.css`, mockup class groups used by more than one page, copied from `mockups.css` and imported by whatever uses them): `sec.css` (`sec`, its variants, `sec__head`, `sec__note`), `more.css`, `ledger.css`, `entries.css`, `slot.css` (C3), `split.css` (`split`, `split__body`) and `blocks.css` (`blocks`, `block`) (C4; `/about/` also uses `sec.css` and `split.css`, C8), `cc.css` (`cc`, `pgrid`) (C6). Components: `Ledger` (`ledger`; `rows` of items, text or a `more` link; also the services blocks' ledger, C5, and the project page's partner and website, C6), `EntryList` (`entries`/`entry`), `ImageSlot` (an EmDash image in a `slot` or `logo-slot`, or the mockup's placeholder or initial; optional `sizes` and `priority` for the image), `ProjectCard` (`cc`, in `<ul class="pgrid">`). `global.css` gets no new rules for page parts
- **Shared parts**: `PageHero` (`ph`; `variant` black, charcoal, gold, green, orange or red, `compact`, slots `meta`, `actions`, `art`), `WaveDivider` (`dv`; `bg` above, `fill` below, `bands`), `Button` (`btn--accent|ink|line`, `arrow`), `StatusBadge` (from `project_status`). Global classes in `global.css`: `.wrap`, `.caps`, `.display`, `.btn`, `.status`, `.stripe`, `:focus-visible`
- **Rich text** (`src/components/rich-text/`, C2): `<RichText value={entry.data.body} />` renders a Portable Text field with EmDash's `<PortableText>` inside `.prose` (rules in `global.css`, from `mockups.css`). It replaces EmDash's `image`, `code` and `iframe` renderers and wraps its `table`; YouTube and Vimeo iframes load only when Play is pressed. The project page (`/projects/{slug}/`), the update page (`/updates/{slug}/`) and `/about/` use it for the entry's `body`
- **Updates pages** (C7, `docs/relaunch/issues.md`, C7 notes): `/updates/` and `/updates/page/{n}/` (`UpdatesIndex.astro`, six per page, newest first by `published_at`; `/updates/page/1/` 301s to `/updates/`) and `/updates/{slug}/`. Content through `getEmDashEntry()`/`getEmDashCollection()`/`getEmDashReferences()` (`src/utils/updates.ts`): the `pages` entry `updates` for the hero, each update's `project` reference, author from EmDash bylines (`data.bylines`), date from `publishedAt`. Shared parts in `src/components/` (`EntryList`, `ProjectCard`, `ImageSlot`) with their mockup rules in `src/styles/parts/`
- **Styles**: all component CSS is inlined into the HTML (`build.inlineStylesheets: 'always'`)

### Content Collections & Data Loading
- Two collections defined in `src/content.config.ts`, `updates` and `projects`, sharing one `contentSchema`
- Custom Astro loaders in `src/loaders/` fetch from an external knowledge API at build time
- `KNOWLEDGE_API_URL` sets the `updates` endpoint; if it is unset, rejected or unreachable, the loader falls back to `src/data/mock-updates.json`. `projectsLoader()` is called with no endpoint, so `projects` always comes from `src/data/mock-projects.json`
- Loader endpoint validation: HTTPS-only, host allowlist restricted to `knowledge.superbenefit.org`

### Homepage Composition (src/pages/index.astro)
Built to `docs/relaunch/mockups/pages/home.html` (C3): hero (`hero`) → banded wave → about section (`sec about`) → the two audience panels (`doors`, `door` with `Ledger`) → projects (`sec--ink` with `ProjectSelector`) → the three newest updates (`EntryList`, left out when there are none) → the layout's closing band. Content: the `pages` entries `home`, `accelerator` and `services`; the titles of the `supports` and `services` entries ("What you get"); the featured `projects` in their `order`; the newest `updates` with their linked project (`getEmDashReferences`). Every query's cache hint goes to `Astro.cache.set()`. A missing field is not rendered; with no `home` entry the `<h1>` reads "Home". Page-only rules are in `src/styles/home.css`, a plain stylesheet so the cascade with the shared parts is the mockups' own (scoped styles add an attribute to every selector).

**ProjectSelector** (`src/components/ProjectSelector.astro`): the mockup's `sel` with the behaviour of `docs/relaunch/mockups/project-selector.reference.js`. At 900 px and wider, without reduced motion, the CSS fill on the active name runs 7 seconds and its `animationend` opens the next project; hover pauses the fill; Pause/Play, previous, next and choosing a name as the README describes. Without JavaScript the names are links to the project pages and the controls are hidden; the script turns them into buttons.

**SectionDivider** (`src/components/SectionDivider.astro`, legacy, no longer used by the home page) blends one section's background into the next; its `from` and `to` props take `'cream' | 'charcoal' | 'green' | 'orange' | 'black'`.

### Contact Form (src/pages/contact.astro, src/actions/contact.ts)
- An Astro server action validates the form, verifies the Cloudflare Turnstile token with `TURNSTILE_SECRET_KEY`, and sends the message through the `EMAIL` send-email binding to `CONTACT_EMAIL`
- In production, `CONTACT_EMAIL` and `TURNSTILE_SECRET_KEY` are Worker secrets (`wrangler secret put …`); the recipient must also be listed in `send_email` in `wrangler.jsonc`
- `name` and `subject` must not contain CR or LF; a line break returns a field error
- The `CONTACT_RATE_LIMITER` [`ratelimits` binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) allows 5 posts per client IP (`CF-Connecting-IP`) per 60 seconds and returns `TOO_MANY_REQUESTS` after that. Cloudflare counts per location and approximately. It is declared at the top level and again in `previews` (own `namespace_id`), because previews inherit no bindings
- Server faults (an unset secret, a missing binding) show visitors one generic message; the detail is logged with `console.error`. Do not put configuration detail in an `ActionError` message: Astro sends it to the browser as is
- The Turnstile site key is fixed at build time (`PUBLIC_` variables are inlined): `PUBLIC_TURNSTILE_SITE_KEY` from `.env` locally, otherwise from `vars` in `wrangler.jsonc`
- The page (C9, built to `mockups/pages/contact.html`) reads the `pages` entry `contact` with `getEmDashEntry()`. Field errors, submitting, success and server error use the mockup's `field--error`, `field__error`, `btn[aria-disabled]`, `spin` and `banner` rules; the state markup is in `<template>`s on the page. The browser's own `required` and `type="email"` checks still run first
- Turnstile uses explicit rendering. The widget is rendered and the form handler attached on `astro:page-load`, and the widget is removed on `astro:before-swap`, because `<ClientRouter />` runs a page's bundled script only once per visit

### Styling Approach
- **Design tokens** in `src/styles/global.css` are the single source of truth — all colors, typography, spacing, shadows, and transitions derive from CSS custom properties in `:root`.
- **Custom properties** in component-scoped `<style>` blocks remain the preferred pattern for site-layout Astro components where they provide better readability than utility classes.
- **Tailwind CSS v4** (through `@tailwindcss/vite`) is available; its utilities read from the same `:root` token block via `@theme inline`. `clsx` and `tailwind-merge` are installed for composing classes.
- **RGB channel variants** (`--color-black-rgb`, `--color-orange-rgb`, etc.) enable alpha compositing: `rgb(var(--color-black-rgb) / 0.8)`. Prefer these over hardcoded `rgba()` values.
- **fonts**: Playfair Display (serif, `--font-serif`) and Inter (sans, `--font-sans`) via Astro's `fonts` config. CSS vars `--font-playfair` and `--font-inter` also available.
- **Fluid typography**: `clamp()`-based scale from `--text-xs` to `--text-hero`.
- **Relaunch tokens** (from `docs/relaunch/mockups/mockups.css`): `--radius-sm|md|pill`, `--space-xl-half`, `--rule`, `--rule-dark`, `--stripe`. Shared parts use the mockups' class names and values; keep them in step with `mockups.css`.

### Animations (src/styles/animations.css)
All scroll-driven — no JavaScript animation libraries:
- **Reveal**: `data-animate="fade-up|fade-left|fade-right|scale-in"` triggers CSS `animation-timeline: view()`
- **Parallax**: `data-parallax` on background elements, GPU-composited via `transform: translateY()`
- **Stagger**: Components pass `--stagger` CSS variable for sequential reveal delays
- **Reduced motion**: Respected via `@media (prefers-reduced-motion: reduce)`

### TypeScript
- Strict mode with `strictNullChecks`
- Worker runtime and binding types come from `wrangler types` (`worker-configuration.d.ts`, listed in `tsconfig.json` `types`); secrets are declared in `src/env.d.ts`
- Path aliases: `@components/*`, `@layouts/*`, `@styles/*`, `@loaders/*`
- Requires Node.js >= 22.23.4 (Astro 7.4 minimum); `.nvmrc` selects Node 24

### Security
- `src/utils/sanitize.ts` (legacy, no longer imported since C7; deleted in B7) stripped dangerous HTML from legacy update content; EmDash entries render through `RichText` instead
- Loaders validate endpoint URLs (HTTPS, host allowlist)
- The contact form is protected by Turnstile, length limits on every field, a CR/LF check on `name` and `subject`, and a per-IP rate limit

## Code Style

- **Rendering**: pages do not set `prerender`; they render on the Worker at request time, as `docs/relaunch/architecture.md` decides. A prerendered page would freeze the layout's menus and band at build time.
- **Responsive breakpoints**: 1024px (tablet landscape), 768px (tablet), 480px (mobile). 768px is the main one; reuse these values rather than adding new ones.
