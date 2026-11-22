/**
 * Sitemap index: one child sitemap per page of each collection with listed
 * entries, `/sitemap-{collection}.xml` and from the second page
 * `/sitemap-{collection}-{n}.xml`, each with the latest `lastmod` on that
 * page, as EmDash's built-in index (emdash 1.5.0
 * src/astro/routes/sitemap.xml.ts). This file replaces EmDash's route
 * (https://docs.emdashcms.com/guides/seo/#robotstxt); what it lists and why
 * is in src/utils/sitemap.ts.
 *
 * Caching: the `/sitemap.xml` rule in astro.config.mjs sets the lifetime and
 * the collection tags; the queries' hints are passed as pages pass theirs
 * (https://docs.emdashcms.com/deployment/route-caching/). Failures are not
 * cached.
 */
import type { APIRoute } from 'astro';
import {
  SITEMAP_COLLECTIONS,
  SITEMAP_PAGE_SIZE,
  escapeXml,
  getSitemapUrls,
  sitemapName,
  sitemapSiteUrl,
  xmlResponse,
  type SitemapCollection,
} from '../utils/sitemap';

export const GET: APIRoute = async ({ url, cache }) => {
  try {
    const { siteUrl, cacheHint: settingsHint } = await sitemapSiteUrl(url);
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ];
    const hints = [settingsHint];
    for (const collection of Object.keys(SITEMAP_COLLECTIONS) as SitemapCollection[]) {
      const { urls, cacheHint } = await getSitemapUrls(collection, siteUrl);
      hints.push(cacheHint);
      for (let start = 0, page = 1; start < urls.length; start += SITEMAP_PAGE_SIZE, page++) {
        const lastmod = urls
          .slice(start, start + SITEMAP_PAGE_SIZE)
          .map((entry) => entry.lastmod)
          .reduce((latest, value) => (value > latest ? value : latest), '');
        lines.push('  <sitemap>');
        lines.push(`    <loc>${escapeXml(`${siteUrl}/sitemap-${sitemapName(collection, page)}.xml`)}</loc>`);
        lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
        lines.push('  </sitemap>');
      }
    }
    lines.push('</sitemapindex>');
    if (cache?.enabled) for (const hint of hints) cache.set(hint);
    return xmlResponse(lines.join('\n'));
  } catch (error) {
    console.error('[sitemap] index failed:', error);
    if (cache?.enabled) cache.set(false);
    return xmlResponse('<!-- Failed to generate sitemap -->', 500);
  }
};
