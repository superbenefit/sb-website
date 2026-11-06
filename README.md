# SuperBenefit Website

Public website for [SuperBenefit](https://superbenefit.org) — a community exploring governance, DAOs, and systems innovation.

## Stack

- [Astro 7](https://astro.build) — server output with every page prerendered
- [@astrojs/cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) — Cloudflare Workers adapter
- [Wrangler 4](https://developers.cloudflare.com/workers/wrangler/) — local dev and deployment
- TypeScript (strict)

## Prerequisites

- Node.js ≥ 22
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

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `KNOWLEDGE_API_URL` | No | HTTPS endpoint for the SuperBenefit knowledge server (host must be `knowledge.superbenefit.org`). Omit to use bundled mock data. |
| `CONTACT_EMAIL` | Production | Recipient of the `/contact` form. A Worker secret in production (`wrangler secret put CONTACT_EMAIL`). |
| `TURNSTILE_SECRET_KEY` | Production | Turnstile secret for the `/contact` form. A Worker secret in production; local dev uses the always-pass test key. |
| `PUBLIC_TURNSTILE_SITE_KEY` | No | Overrides the Turnstile site key for local dev. |

See `.env.example` for a template.

## Project Structure

```
src/
  assets/         # Images imported by Astro (processed at build time)
  actions/        # Astro server actions (the /contact form)
  components/     # Reusable Astro components
  data/           # Static JSON mock data (used when API is unavailable)
  layouts/        # Page layout wrappers (BaseLayout.astro)
  loaders/        # Custom Astro content loaders (knowledge server, projects)
  pages/          # File-based routes
  styles/         # Global CSS, design tokens, animations
  utils/          # HTML sanitizer, nav helpers
public/
  images/         # Static images served as-is
  robots.txt
wrangler.jsonc    # Cloudflare Workers configuration
astro.config.mjs  # Astro configuration
```

## Architecture Notes

**Rendering strategy** — `output: 'server'` with per-page `export const prerender = true`. Every page currently opts in, including `/updates/*`, so the Worker only runs server actions (the contact form). `/about`, `/projects`, `/services`, `/support` and `/updates/*` are drafts: they show a "Coming soon" placeholder in production builds until their `pageIsDraft` flag is set to `false`.

**Content loaders** — `src/loaders/knowledge-server.ts` loads the `updates` collection from `KNOWLEDGE_API_URL` at build time, and falls back to `src/data/mock-updates.json` when it is unset, not an allowed HTTPS host, or unreachable. `src/loaders/projects.ts` is called with no endpoint, so `projects` always comes from `src/data/mock-projects.json`.

**Security headers** — none are set by this repo: there is no `public/_headers` file.

**Contact form** — `src/actions/contact.ts` verifies the Turnstile token and sends the message through the `EMAIL` send-email binding declared in `wrangler.jsonc`.
