# EmDash notes

Verified 2026-11-20 against EmDash docs and source at commit a8c417f. That commit is unreleased main; npm `emdash` 1.5.0 is tag 549c6b5, and the docs site tracks main. Re-verify against current docs before relying on any of it.

## Rendering: EmDash does not require SSR for site pages
- A prerendered page runs `getEmDashCollection` / `getEmDashEntry` at build time; a server-rendered page runs it per request. (docs: concepts/architecture, guides/querying-content, why-emdash)
- Only routes EmDash injects (admin, API, its sitemap.xml and robots.txt) always render on demand, so a server adapter is still required. Since 0.42.0, `output: "static"` builds cleanly and the site's own pages prerender.
- Middleware has explicit `context.isPrerendered` branches (packages/core/src/astro/middleware.ts).
- Templates and the "existing project" guide default to `output: "server"`; that is a default, not a requirement.

## Chosen pattern (official docs, 2026-11-20)
Follow [Deploy to Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/) as written: `output: "server"`, `cloudflare()` with no options, `d1({ binding: "DB" })`, `r2({ binding: "MEDIA" })`, `src/worker.ts` with `createScheduledHandler()`. Pages render on demand behind Workers Cache (`cacheCloudflare()` + `routeRules` tagged by collection); EmDash purges on publish. Admin auth is Cloudflare Access on `/_emdash/*` with `access({ teamDomain, audienceEnvVar })`. No SIWE, no build-time D1, no rebuild hooks. Details in `validation.md`.

## Other integration facts
- Needs `@astrojs/react` (admin UI), D1 `DB`, R2 `MEDIA`, KV `SESSION` (Astro sessions), `src/live.config.ts` with `emdashLoader()`. `EMDASH_ENCRYPTION_KEY` is only needed for plugin secrets. Set `EMDASH_SITE_URL` before setup.
- Cloudflare template sets `main: src/worker.ts` with a `scheduled` handler plus a cron trigger for scheduled publishing.
- First person to finish the setup wizard becomes admin; passkeys are bound to the setup hostname.
- Sandboxed plugins need Dynamic Workers (Workers Paid).
- Existing file-based `src/content.config.ts` collections keep working alongside the live config.

## Sources
- https://docs.emdashcms.com/
- https://github.com/emdash-cms/emdash
- https://developers.cloudflare.com/workers/framework-guides/web-apps/emdash/
