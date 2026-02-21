# SuperBenefit Website

Public website for [SuperBenefit](https://superbenefit.org) — a community exploring governance, DAOs, and systems innovation.

## Stack

- [Astro 5](https://astro.build) — static + SSR hybrid rendering
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
npm run check    # run TypeScript type-check (astro check)
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
| `KNOWLEDGE_API_URL` | No | HTTPS endpoint for the SuperBenefit knowledge server. Omit to use bundled mock data. |

See `.env.example` for a template.

## Project Structure

```
src/
  assets/         # Images imported by Astro (processed at build time)
  components/     # Reusable Astro components
  content/        # Local content collections (blog markdown, etc.)
  data/           # Static JSON mock data (used when API is unavailable)
  layouts/        # Page layout wrappers (BaseLayout.astro)
  loaders/        # Custom Astro content loaders (knowledge server, projects)
  pages/          # File-based routes
  styles/         # Global CSS, design tokens, animations
public/
  _headers        # Cloudflare-served HTTP response headers (CSP, HSTS, etc.)
  images/         # Static images served as-is
  robots.txt
wrangler.jsonc    # Cloudflare Workers configuration
astro.config.mjs  # Astro configuration
```

## Architecture Notes

**Rendering strategy** — `output: 'server'` with per-page `export const prerender = true` on static pages. Dynamic routes (blog slug, project slug) run on the Worker edge.

**Content loaders** — `src/loaders/knowledge-server.ts` and `src/loaders/projects.ts` fetch from the SuperBenefit knowledge API at build time. If `KNOWLEDGE_API_URL` is unset or the server is unreachable, loaders fall back to `src/data/mock-*.json` files automatically.

**Security headers** — `public/_headers` is served by Cloudflare Workers Static Assets and applies CSP, HSTS, `X-Frame-Options`, and other headers to every response without a Worker invocation.

**Smart Placement** — `wrangler.jsonc` enables Cloudflare Smart Placement to colocate Worker execution near `knowledge.superbenefit.org`, reducing API fetch latency.
