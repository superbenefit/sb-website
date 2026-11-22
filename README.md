# SuperBenefit Website

Public website for [SuperBenefit](https://superbenefit.org) — a community exploring governance, DAOs, and systems innovation.

## Stack

- [Astro 7](https://astro.build) — server output, every page rendered on demand
- [EmDash](https://docs.emdashcms.com) 1.5.0 — CMS, installed per its [Deploy to Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/) guide (admin at `/_emdash/admin/`)
- [@astrojs/cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) — Cloudflare Workers adapter
- [Wrangler 4](https://developers.cloudflare.com/workers/wrangler/) — local dev and deployment
- TypeScript (strict)

## Prerequisites

- Node.js ≥ 22.23.4 (`.nvmrc` selects 24)
- npm ≥ 10

## Setup

```bash
npm install
cp .env.example .env   # then edit as needed
```

## Development

```bash
npm run dev      # start Astro dev server on localhost:4321
npm run check    # generate Worker types, then type-check (astro check)
```

> **Note:** Run `npm run dev` in a dedicated terminal — the process holds stdin and can cause shells to appear unresponsive if mixed with other commands.

## Build & Deploy

```bash
npm run build    # compile to dist/
npm run deploy   # build + wrangler deploy to Cloudflare Workers
```

Workers Builds is connected to this repository: `main` deploys to production, and every other branch gets a preview URL.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `KNOWLEDGE_API_URL` | No | HTTPS endpoint for the SuperBenefit knowledge server (host must be `knowledge.superbenefit.org`). Omit to use bundled mock data. |
| `CONTACT_EMAIL` | Production | Recipient of the `/contact` form. A Worker secret in production (`wrangler secret put CONTACT_EMAIL`). |
| `TURNSTILE_SECRET_KEY` | Production | Turnstile secret for the `/contact` form. A Worker secret in production; local dev uses the always-pass test key. |
| `EMDASH_SITE_URL` | Production | Origin EmDash uses for setup, emails and the sitemap. Production sets `https://superbenefit.org` in `vars` in `wrangler.jsonc`; branch previews set none. Local dev reads those `vars` too, so `.env` overrides it with `http://localhost:4321`. |
| `CF_ACCESS_AUDIENCE` | Previews and production | Application Audience (AUD) tag of the Cloudflare Access application in front of the CMS, which EmDash checks the Access JWT against. A Worker secret set in the dashboard: one value under Previews Base (the previews Access application), one under Production (the `superbenefit.org/_emdash/*` application). Never in the repo or `.env`; local dev does not use it. Unset, every admin request returns 401 "Authentication failed". |
| `PUBLIC_TURNSTILE_SITE_KEY` | No | Turnstile site key, fixed at build time. `.env` sets the test key for local dev; other builds take the production key from `vars` in `wrangler.jsonc`. |

See `.env.example` for a template.

## Project Structure

```
src/
  assets/         # Images imported by Astro (processed at build time)
  actions/        # Astro server actions (the /contact form)
  components/     # Reusable Astro components
  data/           # Static JSON mock data (used when API is unavailable)
  layouts/        # BaseLayout.astro: head (EmDashHead), header, closing band, footer
  loaders/        # Custom Astro content loaders (knowledge server, projects)
  pages/          # File-based routes
  styles/         # Global CSS, design tokens, animations
  utils/          # HTML sanitizer, nav helpers
  live.config.ts  # EmDash live content collection
  worker.ts       # Worker entry: Astro handler, EmDash scheduled handler, EMDASH_ROOMS export
public/
  images/         # Static images served as-is
wrangler.jsonc    # Cloudflare Workers configuration
astro.config.mjs  # Astro configuration
```

## Architecture Notes

**Rendering strategy** — `output: 'server'`, and every page renders on demand on the Worker: the layout reads the header and footer menus and the closing band from EmDash on each request, so an edit in the admin shows without a rebuild (`docs/relaunch/architecture.md`, Rendering per route). EmDash also serves its admin and API under `/_emdash/`, `/sitemap.xml` and `/robots.txt`. `/about` is a draft: it shows a "Coming soon" placeholder in production builds until its `pageIsDraft` flag is set to `false`. `/accelerator`, `/services`, `/projects/` and `/projects/{slug}/` are finished; `/updates/`, `/updates/page/{n}/` and `/updates/{slug}/` read their content from EmDash and have no draft flag (C7, #41). `/support` and `/supports` are 301 redirects to `/accelerator/` from Astro's `redirects` option in `astro.config.mjs`; the build writes them into `dist/client/_redirects`, so they need nothing in the database.

**URLs** — `trailingSlash: 'ignore'`, Astro's [default](https://docs.astro.build/en/reference/configuration-reference/#trailingslash) (owner decision 2026-11-22; `'always'` made the EmDash admin's URLs without a trailing slash return 404, see finding T1 in `docs/relaunch/findings.md`). Internal links end in `/`. Pages render on demand, so both `/about` and `/about/` answer 200; the canonical uses the slash form.

**Content loaders** — `src/loaders/knowledge-server.ts` loads the `updates` collection from `KNOWLEDGE_API_URL` at build time, and falls back to `src/data/mock-updates.json` when it is unset, not an allowed HTTPS host, or unreachable. `src/loaders/projects.ts` is called with no endpoint, so `projects` always comes from `src/data/mock-projects.json`.

**Security headers** — none are set by this repo: there is no `public/_headers` file.

**CMS sign-in** — Cloudflare Access with GitHub, configured with `access()` in `astro.config.mjs` ([EmDash guide](https://docs.emdashcms.com/guides/authentication/#cloudflare-access)). Org members get the Contributor role on first sign-in; members of the GitHub team "Knowledge Stewardship" get Editor, and members of "Web Admins" get Admin. With GitHub sign-in this mapping does not take effect in EmDash 1.5.0 (finding R1): every new account is a Contributor, and an Admin sets Editor and Admin under Users in the CMS.
- Production: Access protects `superbenefit.org/_emdash/*` and asks for GitHub; a Bypass application keeps `/_emdash/api/media/file/*` public for share images, file downloads and media the optimiser does not handle. The Worker verifies the Access JWT against `CF_ACCESS_AUDIENCE`.
- Previews: the whole `<branch-name>.superbenefit.dev` hostname is behind Access, so signing in to the preview signs you in to its admin.
- Signing out: the admin's Log out button does not end the Access session; open `/cdn-cgi/access/logout` on the same hostname.
- Locally: there is no Access, and EmDash 1.5.0 offers no passkey while `access()` is configured. After the setup wizard, open `http://localhost:4321/_emdash/api/auth/dev-bypass?redirect=/_emdash/admin` to sign in as a local development Admin.

Details and the owner's dashboard steps: `docs/relaunch/architecture.md` (Auth) and `docs/relaunch/issues.md` (B3).

**Contact form** — `src/actions/contact.ts` verifies the Turnstile token and sends the message through the `EMAIL` send-email binding declared in `wrangler.jsonc`.
