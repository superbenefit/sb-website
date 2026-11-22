import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
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
export default defineConfig({
  site: 'https://superbenefit.org',
  output: 'server',
  // 'ignore' (Astro's default): EmDash admin URLs have no trailing slash. https://docs.astro.build/en/reference/configuration-reference/#trailingslash
  trailingSlash: 'ignore',
  integrations: [
    react(), // Required: the admin UI is a React app
    emdash({
      database: d1({ binding: 'DB' }),
      storage: r2({ binding: 'MEDIA' }),
      auth: access({
        teamDomain: 'superbenefit.cloudflareaccess.com',
        audienceEnvVar: 'CF_ACCESS_AUDIENCE',
        // Contributor for every member the Access policy lets in; Admin for
        // the "Web Admins" GitHub team. Keys are compared, exactly and
        // case-sensitively, with the group names Access returns.
        defaultRole: 20,
        roleMapping: { 'Web Admins': 50 },
      }),
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
