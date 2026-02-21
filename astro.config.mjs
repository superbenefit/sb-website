import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://superbenefit.org',
  output: 'server',
  integrations: [sitemap()],
  adapter: cloudflare({
    imageService: 'compile',
  }),
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: 'Playfair Display',
        cssVariable: '--font-playfair',
        weights: ['400 900'],
        styles: ['normal'],
        display: 'swap',
        fallbacks: ['Georgia', 'Times New Roman', 'serif'],
      },
      {
        provider: fontProviders.google(),
        name: 'Inter',
        cssVariable: '--font-inter',
        weights: ['100 900'],
        styles: ['normal'],
        display: 'swap',
        fallbacks: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    ],
  },
});
