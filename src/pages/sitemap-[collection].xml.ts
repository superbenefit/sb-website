/**
 * One collection's sitemap: `/sitemap-{collection}.xml` and, past 2,000
 * entries, `/sitemap-{collection}-{n}.xml` (the route receives `pages-2` as
 * `collection`, https://docs.emdashcms.com/guides/seo/#robotstxt). Each
 * `<url>` has the entry's canonical URL, its `lastmod` and its SEO image as
 * an `<image:image>`, as EmDash's built-in (emdash 1.5.0
 * src/astro/routes/sitemap-[collection].xml.ts), which this file replaces.
 * Unknown names, collections not listed (services, supports) and empty
 * collections or pages answer 404, as there. What is listed and why:
 * src/utils/sitemap.ts.
 *
 * Caching: the `/sitemap-[collection].xml` rule in astro.config.mjs; the
 * queries' hints are passed to the cache. 404s and failures are not cached.
 */
import type { APIRoute } from 'astro';
import { SITEMAP_PAGE_SIZE, escapeXml, getSitemapUrls, parseSitemapName, sitemapSiteUrl, xmlResponse } from '../utils/sitemap';

export const GET: APIRoute = async ({ params, url, cache }) => {
  const parsed = params.collection ? parseSitemapName(params.collection) : null;
  if (!parsed) {
    if (cache?.enabled) cache.set(false);
    return xmlResponse('<!-- Sitemap not found -->', 404);
  }

  try {
    const { siteUrl, cacheHint: settingsHint } = await sitemapSiteUrl(url);
    const { urls, cacheHint } = await getSitemapUrls(parsed.collection, siteUrl);
    const pageUrls = urls.slice((parsed.page - 1) * SITEMAP_PAGE_SIZE, parsed.page * SITEMAP_PAGE_SIZE);
    if (pageUrls.length === 0) {
      if (cache?.enabled) cache.set(false);
      return xmlResponse('<!-- Collection not found or empty -->', 404);
    }

    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ];
    for (const entry of pageUrls) {
      lines.push('  <url>');
      lines.push(`    <loc>${escapeXml(`${siteUrl}${entry.path}`)}</loc>`);
      lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      if (entry.image) {
        lines.push('    <image:image>');
        lines.push(`      <image:loc>${escapeXml(entry.image)}</image:loc>`);
        lines.push('    </image:image>');
      }
      lines.push('  </url>');
    }
    lines.push('</urlset>');
    if (cache?.enabled) {
      cache.set(settingsHint);
      cache.set(cacheHint);
    }
    return xmlResponse(lines.join('\n'));
  } catch (error) {
    console.error(`[sitemap] ${params.collection} failed:`, error);
    if (cache?.enabled) cache.set(false);
    return xmlResponse('<!-- Failed to generate sitemap -->', 500);
  }
};
