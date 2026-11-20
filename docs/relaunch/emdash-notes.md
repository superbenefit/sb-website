# EmDash notes

Verified 2026-11-20 against EmDash docs and source at commit a8c417f (npm `emdash` 1.5.0). Re-verify against current docs before relying on any of it.

## Rendering: EmDash does not require SSR for site pages
- A prerendered page runs `getEmDashCollection` / `getEmDashEntry` at build time; a server-rendered page runs it per request. (docs: concepts/architecture, guides/querying-content, why-emdash)
- Only routes EmDash injects (admin, API, its sitemap.xml and robots.txt) always render on demand, so a server adapter is still required. Since 0.42.0, `output: "static"` builds cleanly and the site's own pages prerender.
- Middleware has explicit `context.isPrerendered` branches (packages/core/src/astro/middleware.ts).
- Templates and the "existing project" guide default to `output: "server"`; that is a default, not a requirement.

## Options
- A. Prerender: static HTML as today; edits appear after rebuild + deploy.
- B. On demand + route cache: `cacheCloudflare()` from `@astrojs/cloudflare/cache`, `routeRules` with collection-name tags; EmDash purges `[collection, id]` tags on publish; cache hits do not run the Worker.
- C. Mixed per route (likely choice).

## Unverified, test in a spike
- Build-time access to D1 content for prerendered pages. This repo sets `prerenderEnvironment: 'node'`, where the D1 binding is absent; a workerd prerender sees local D1 unless remote bindings are enabled. No EmDash doc found on this.
- No documented publish-to-rebuild hook for option A.
- Cloudflare Access auth adapter with the SIWE OIDC bridge.

## Other integration facts
- Needs `@astrojs/react` (admin UI), D1 `DB`, R2 `MEDIA`, `src/live.config.ts` with `emdashLoader()`, `EMDASH_ENCRYPTION_KEY`.
- Cloudflare template sets `main: src/worker.ts` with a `scheduled` handler plus a cron trigger for scheduled publishing.
- First person to finish the setup wizard becomes admin; passkeys are bound to the setup hostname.
- Sandboxed plugins need Dynamic Workers (Workers Paid).
- Existing file-based `src/content.config.ts` collections keep working alongside the live config.

## Sources
- https://docs.emdashcms.com/
- https://github.com/emdash-cms/emdash
- https://developers.cloudflare.com/workers/framework-guides/web-apps/emdash/
