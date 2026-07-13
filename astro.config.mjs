import { defineConfig, fontProviders, sessionDrivers } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://superbenefit.org',
  output: 'server',
  integrations: [
    sitemap({
      // Draft-gated pages are noindex via _headers and BaseLayout, so they
      // should not appear in the sitemap. Update this list when a draft ships
      // (flip `pageIsDraft` in the page frontmatter and remove the path here).
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
  }),
  session: {
    driver: sessionDrivers.lruCache(),
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  vite: {
    plugins: [tailwindcss()],
  },
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
});
