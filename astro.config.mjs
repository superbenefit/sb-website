import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { cacheCloudflare } from '@astrojs/cloudflare/cache';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import emdash from 'emdash/astro';
import { access, d1, r2 } from '@emdash-cms/cloudflare';

// EmDash on Cloudflare, as https://docs.emdashcms.com/deployment/cloudflare/
// describes. No `siteUrl` here: production sets EMDASH_SITE_URL in
// wrangler.jsonc `vars`, because a `siteUrl` is built into every preview.
// No `sandboxRunner`: the site uses no marketplace, registry or sandboxed
// plugins.
// Sign-in is Cloudflare Access with GitHub, as
// https://docs.emdashcms.com/guides/authentication/#cloudflare-access
// describes. The AUD tag is the Worker secret CF_ACCESS_AUDIENCE (production
// and Previews Base), never a value in this repo. `npm run dev` has no Access
// JWT, and EmDash 1.5.0 offers no passkey while access() is configured: local
// sign-in uses /_emdash/api/auth/dev-bypass (docs/relaunch/architecture.md,
// Auth).
//
// Route caching, as https://docs.emdashcms.com/deployment/route-caching/
// describes (architecture.md, Caching): cacheCloudflare() stores responses in
// the Workers Cache; the adapter then writes "cache": { "enabled": true } into
// the generated dist/server/wrangler.json, which `wrangler preview` also uses
// for Previews. One rule per public route, tagged with the collections it
// renders (architecture.md, Rendering per route), so EmDash's purge on
// publish matches it. The layout adds the settings, menu and closing-band
// hints. Those hints carry tags but no lifetime, so a BaseLayout page whose
// route has no rule here is still served `Cloudflare-CDN-Cache-Control:
// public` (no max-age): Cloudflare then caches it for its heuristic TTL, and a
// publish in its collection does not purge it. Every new public route adds
// its rule in the same change (findings.md, K2). /404 and /500 stay uncached
// because they pass cache={false} to the layout; responses with no hints at
// all (/_emdash/*, /robots.txt) get no-store from the adapter. `astro dev`
// never caches.
const DAY = 86_400;
const WEEK = 604_800;
const rule = (tags) => ({ maxAge: DAY, swr: WEEK, tags });

export default defineConfig({
  site: 'https://superbenefit.org',
  output: 'server',
  // 'ignore' (Astro's default): EmDash admin URLs have no trailing slash. https://docs.astro.build/en/reference/configuration-reference/#trailingslash
  trailingSlash: 'ignore',
  cache: { provider: cacheCloudflare() },
  // The old accelerator URLs, as Astro's configured redirects
  // (https://docs.astro.build/en/guides/routing/#configured-redirects). They
  // are in the build, not the database, so they work on any database with no
  // data step (architecture.md, Rendering per route). The build writes them,
  // in both slash forms, into dist/client/_redirects
  // (@astrojs/cloudflare/dist/index.js, @astrojs/underscore-redirects), which
  // Workers static assets answer before the Worker runs
  // (https://developers.cloudflare.com/workers/static-assets/redirects/).
  // `astro dev` answers them in Astro's handler instead, which uses
  // `status` only when the destination is a route's own path, so there a GET
  // gets 301 and other methods 308 (astro/dist/core/redirects/render.js).
  redirects: {
    '/support': { status: 301, destination: '/accelerator/' },
    '/supports': { status: 301, destination: '/accelerator/' },
  },
  // Patterns match the request path, with or without the trailing slash
  // (trailingSlash 'ignore'). /projects/[slug] shows the project's updates,
  // so it is tagged with both collections. /home has no rule: it is a 301 to /
  // that calls Astro.cache.set(false). /support and /supports have none
  // either: they are the configured `redirects` above, answered before any
  // page renders.
  // The home page also lists the titles of the services and supports entries.
  routeRules: {
    '/': rule(['pages', 'projects', 'updates', 'services', 'supports']),
    '/about': rule(['pages']),
    '/accelerator': rule(['pages', 'supports']),
    '/contact': rule(['pages']),
    '/projects': rule(['pages', 'projects']),
    '/projects/[slug]': rule(['projects', 'updates']),
    '/services': rule(['pages', 'services']),
    // The index shows the `updates` pages entry and each update's project;
    // an update shows its project's card.
    '/updates': rule(['pages', 'updates', 'projects']),
    '/updates/page/[page]': rule(['pages', 'updates', 'projects']),
    '/updates/[...slug]': rule(['updates', 'projects']),
    // The site's own sitemap routes (src/pages/sitemap*.xml.ts), which list
    // the routable collections with SEO (src/utils/sitemap.ts). services and
    // supports are not routable (seed/seed.json), so not listed.
    '/sitemap.xml': rule(['pages', 'projects', 'updates']),
    '/sitemap-[collection].xml': rule(['pages', 'projects', 'updates']),
  },
  integrations: [
    react(), // Required: the admin UI is a React app
    emdash({
      database: d1({ binding: 'DB' }),
      storage: r2({ binding: 'MEDIA' }),
      auth: access({
        teamDomain: 'superbenefit.cloudflareaccess.com',
        audienceEnvVar: 'CF_ACCESS_AUDIENCE',
        // Contributor (drafts only) for every member the Access policy lets
        // in; Editor for the "Knowledge Stewardship" GitHub team; Admin for
        // "Web Admins". Keys are compared, exactly and case-sensitively, with
        // the group names Access returns; the first matching group wins.
        // EmDash 1.5.0 reads the identity's `groups`; GitHub sign-in returns
        // teams under `teams`, so the mapping matches nothing yet and an
        // Admin sets these roles under Users (architecture.md, Auth; R1).
        defaultRole: 20,
        roleMapping: { 'Web Admins': 50, 'Knowledge Stewardship': 40 },
      }),
      // Recommended for cached sites: public HTML is the same for everyone;
      // editors get an Edit pill that opens a fresh, uncached ?_edit render.
      // https://docs.emdashcms.com/deployment/route-caching/#editors-and-cached-pages
      toolbar: 'client',
    }),
  ],
  build: {
    // Inline all component CSS into the HTML response. Total CSS is ~10 KB
    // (well under the 4 KB default auto-inlining threshold exceeded by
    // BaseLayout.css), so eliminating the render-blocking round-trip is
    // the largest single FCP win available. See:
    // https://docs.astro.build/en/reference/configuration-reference/#buildinlinestylesheets
    inlineStylesheets: 'always',
  },
  adapter: cloudflare(),
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  vite: { plugins: [tailwindcss()] },
  fonts: [
    { provider: fontProviders.google(), name: 'Playfair Display', cssVariable: '--font-playfair', weights: ['400 900'], styles: ['normal'], display: 'swap', fallbacks: ['Georgia', 'Times New Roman', 'serif'] },
    { provider: fontProviders.google(), name: 'Inter', cssVariable: '--font-inter', weights: ['100 900'], styles: ['normal'], display: 'swap', fallbacks: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'] },
  ],
});
