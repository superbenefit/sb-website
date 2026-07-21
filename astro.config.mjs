import { defineConfig, sessionDrivers, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://superbenefit.org',
  output: 'server',
  integrations: [
    sitemap({
      filter: (page) =>
        ![
          'https://superbenefit.org/about/',
          'https://superbenefit.org/projects/',
          'https://superbenefit.org/services/',
          'https://superbenefit.org/support/',
          'https://superbenefit.org/updates/',
        ].some((draftPath) => page.startsWith(draftPath)),
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
  adapter: cloudflare({
    prerenderEnvironment: 'node',
    // Use Sharp at build time for prerendered pages;
    // Cloudflare Images binding handles any on-demand routes
    imageService: { build: 'compile', runtime: 'cloudflare-binding' },
  }),
  session: { driver: sessionDrivers.lruCache() },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  vite: { plugins: [tailwindcss()] },
  fonts: [
    { provider: fontProviders.google(), name: 'Playfair Display', cssVariable: '--font-playfair', weights: ['400 900'], styles: ['normal'], display: 'swap', fallbacks: ['Georgia', 'Times New Roman', 'serif'] },
    { provider: fontProviders.google(), name: 'Inter', cssVariable: '--font-inter', weights: ['100 900'], styles: ['normal'], display: 'swap', fallbacks: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'] },
  ],
});
