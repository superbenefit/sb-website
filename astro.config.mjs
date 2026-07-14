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
  adapter: cloudflare({
    imageService: 'compile',
    prerenderEnvironment: 'node',
  }),
  session: { driver: sessionDrivers.lruCache() },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  vite: { plugins: [tailwindcss()] },
  fonts: [
    { provider: fontProviders.google(), name: 'Playfair Display', cssVariable: '--font-playfair', weights: ['400 900'], styles: ['normal'], display: 'swap', fallbacks: ['Georgia', 'Times New Roman', 'serif'] },
    { provider: fontProviders.google(), name: 'Inter', cssVariable: '--font-inter', weights: ['100 900'], styles: ['normal'], display: 'swap', fallbacks: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'] },
  ],
});
