import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import emdash from 'emdash/astro';
import { d1, r2 } from '@emdash-cms/cloudflare';

// EmDash on Cloudflare, as https://docs.emdashcms.com/deployment/cloudflare/
// describes. No `siteUrl` here: production sets EMDASH_SITE_URL in
// wrangler.jsonc `vars`, because a `siteUrl` is built into every preview.
// No `sandboxRunner`: the site uses no marketplace, registry or sandboxed
// plugins.
export default defineConfig({
  site: 'https://superbenefit.org',
  output: 'server',
  trailingSlash: 'always',
  integrations: [
    react(), // Required: the admin UI is a React app
    emdash({
      database: d1({ binding: 'DB' }),
      storage: r2({ binding: 'MEDIA' }),
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
