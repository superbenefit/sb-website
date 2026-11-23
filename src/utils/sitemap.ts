/**
 * The site's own sitemap (B6, #33, finding P2), served by
 * src/pages/sitemap.xml.ts and src/pages/sitemap-[collection].xml.ts. A route
 * file at either path replaces EmDash's route for that path
 * (https://docs.emdashcms.com/guides/seo/#robotstxt; emdash 1.5.0
 * src/astro/integration/routes.ts, hasUserDefinedPublicRoute).
 *
 * It lists what EmDash 1.5.0's built-in sitemap lists
 * (src/api/handlers/seo.ts, src/astro/routes/sitemap-[collection].xml.ts;
 * guide: "published, not deleted, have a slug, and are not hidden from
 * search engines", routable collections with SEO), with the site's canonical
 * URLs: a trailing slash, and the `pages` entry `home` at `/` instead of its
 * pattern URL `/home` (a 301 to `/`, src/pages/home.astro). One difference:
 * a `pages` entry is listed only when the site has a route for its slug
 * (PAGE_ROUTES); the built-in lists every one at `/{slug}`, which answers 404
 * for a slug with no page.
 *
 * Read through EmDash's public query API only:
 * - getEmDashCollection() gives the published entries (status defaults to
 *   published; deleted entries are never listed), in content ID order like
 *   the built-in's pages (`orderBy: { id: 'asc' }`; stored names,
 *   https://docs.emdashcms.com/guides/querying-content/).
 * - A list entry carries no SEO panel values in 1.5.0 (the loader joins
 *   `_emdash_seo` on the single-entry path only, src/loader.ts), so a child
 *   sitemap reads each entry of its page again with getEmDashEntry() and
 *   getSeoMeta() resolves its no-index choice (`robots`) and SEO image
 *   (`ogImage`), as the SEO guide documents. That is one D1 query per entry,
 *   and D1 allows 1,000 queries per Worker invocation on Workers Paid
 *   (https://developers.cloudflare.com/d1/platform/limits/). So a child
 *   sitemap holds SITEMAP_PAGE_SIZE (500) published entries, read with
 *   `limit` and `offset`, and the index reads no single entries: it pages the
 *   collection list alone (findings.md, P2).
 * - The collections and their URLs are the site's routes, below. EmDash's
 *   collection flags (routable, SEO) and URL patterns have no public reader
 *   in 1.5.0, so a collection added in the admin is not listed until it is
 *   added here (findings.md, P2).
 */
import { getEmDashCollection, getEmDashEntry, getSeoMeta, getSiteSettingsWithCacheHint } from 'emdash';
import type { CacheHint } from 'emdash';
import { env } from 'cloudflare:workers';

/**
 * The `pages` entries the site has a route for, and that route. Every other
 * `pages` slug has no page (src/pages has no catch-all), so it is not listed.
 */
const PAGE_ROUTES: Record<string, string> = {
  home: '/', // src/pages/index.astro; /home 301s to / (src/pages/home.astro)
  about: '/about/',
  accelerator: '/accelerator/',
  contact: '/contact/',
  projects: '/projects/', // the hero of src/pages/projects/index.astro
  services: '/services/', // src/pages/services/index.astro
  updates: '/updates/', // the hero of src/components/UpdatesIndex.astro
};

/**
 * The routable collections with SEO (seed/seed.json) and each entry's
 * canonical path, or null when the site has no route for the entry.
 */
export const SITEMAP_COLLECTIONS = {
  pages: (slug) => (Object.hasOwn(PAGE_ROUTES, slug) ? PAGE_ROUTES[slug] : null),
  projects: (slug) => `/projects/${encodeURIComponent(slug)}/`,
  updates: (slug) => `/updates/${encodeURIComponent(slug)}/`,
} satisfies Record<string, (slug: string) => string | null>;

export type SitemapCollection = keyof typeof SITEMAP_COLLECTIONS;

function isSitemapCollection(name: string): name is SitemapCollection {
  return Object.hasOwn(SITEMAP_COLLECTIONS, name);
}

/**
 * Published entries per child sitemap. EmDash 1.5.0 puts 2,000 listed entries
 * on a page (`SITEMAP_PAGE_SIZE`, api/handlers/seo.ts); this site reads every
 * entry on a page with its own query, so a page must stay under D1's 1,000
 * queries per invocation (above). 500 leaves room for the list and settings
 * queries.
 */
export const SITEMAP_PAGE_SIZE = 500;

/** `{collection}` for page 1, `{collection}-{n}` from 2 up (emdash 1.5.0 src/seo/sitemap-name.ts). */
const SITEMAP_NAME_RE = /^([a-z][a-z0-9_]*)(?:-([2-9]|[1-9]\d{1,5}))?$/;

export function parseSitemapName(name: string): { collection: SitemapCollection; page: number } | null {
  const match = SITEMAP_NAME_RE.exec(name);
  if (!match || !isSitemapCollection(match[1])) return null;
  return { collection: match[1], page: match[2] ? Number(match[2]) : 1 };
}

export function sitemapName(collection: string, page: number): string {
  return page === 1 ? collection : `${collection}-${page}`;
}

/**
 * The site URL, in the order the SEO guide gives for absolute URLs: the Site
 * URL in Settings > General, then `EMDASH_SITE_URL` (this site sets no
 * `siteUrl`, astro.config.mjs), then the request origin. Read from the
 * Worker's env (https://developers.cloudflare.com/workers/runtime-apis/bindings/#importing-env-as-a-global),
 * reduced to its origin as EmDash does (api/public-url.ts, getEnvSiteUrl).
 */
/** `EMDASH_SITE_URL` from the Worker's env, reduced to its origin; undefined when unset or not http(s). */
export function envSiteUrl(): string | undefined {
  try {
    const raw = (env as { EMDASH_SITE_URL?: string }).EMDASH_SITE_URL;
    const parsed = raw ? new URL(raw) : undefined;
    return parsed && (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? parsed.origin : undefined;
  } catch {
    return undefined;
  }
}

export async function sitemapSiteUrl(requestUrl: URL): Promise<{ siteUrl: string; cacheHint: CacheHint }> {
  const { data: settings, cacheHint } = await getSiteSettingsWithCacheHint();
  const siteUrl = (settings.url || envSiteUrl() || requestUrl.origin).replace(/\/$/, '');
  return { siteUrl, cacheHint };
}

export interface SitemapUrl {
  /** Canonical path, ending in `/`. */
  path: string;
  lastmod: string;
  /** Absolute SEO image URL, or null. */
  image: string | null;
}

export interface SitemapPage {
  /** 1-based page number. */
  page: number;
  /** Latest `updatedAt` of the page's entries that have a route. */
  lastmod: string;
}

function lastmodOf(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value ?? '');
}

/** The entry's canonical path, or null without a slug or a route. */
function pathOf(collection: SitemapCollection, entry: { data: { slug?: unknown } }): string | null {
  const slug = entry.data.slug;
  if (typeof slug !== 'string' || slug.trim() === '') return null;
  return SITEMAP_COLLECTIONS[collection](slug);
}

/**
 * The child sitemaps of one collection for the index, from the collection
 * list alone (one query, no single-entry reads): page n holds the published
 * entries n*500-499 to n*500 in content ID order, and is listed when one of
 * them has a route. The entries' SEO panel is not read here, so an entry
 * hidden from search engines still counts towards its page's `lastmod`, and
 * a page whose routed entries are all hidden is listed and answers 404
 * (findings.md, P2). Throws when the query fails.
 */
export async function getSitemapPages(
  collection: SitemapCollection,
): Promise<{ pages: SitemapPage[]; cacheHint: CacheHint }> {
  const { entries, cacheHint, error } = await getEmDashCollection(collection, { orderBy: { id: 'asc' } });
  if (error) throw error;
  const pages: SitemapPage[] = [];
  for (let start = 0, page = 1; start < entries.length; start += SITEMAP_PAGE_SIZE, page++) {
    const routed = entries
      .slice(start, start + SITEMAP_PAGE_SIZE)
      .filter((entry) => pathOf(collection, entry) !== null);
    if (routed.length === 0) continue;
    const lastmod = routed
      .map((entry) => lastmodOf(entry.data.updatedAt))
      .reduce((latest, value) => (value > latest ? value : latest), '');
    pages.push({ page, lastmod });
  }
  return { pages, cacheHint: cacheHint ?? {} };
}

/**
 * The listed entries on one page of a collection (at most SITEMAP_PAGE_SIZE
 * single-entry reads), in content ID order, with the cache hint of the list
 * query. Throws when a query fails, so the route answers 500 rather than a
 * sitemap with entries missing.
 */
export async function getSitemapUrls(
  collection: SitemapCollection,
  page: number,
  siteUrl: string,
): Promise<{ urls: SitemapUrl[]; cacheHint: CacheHint }> {
  const { entries, cacheHint, error } = await getEmDashCollection(collection, {
    orderBy: { id: 'asc' },
    limit: SITEMAP_PAGE_SIZE,
    offset: (page - 1) * SITEMAP_PAGE_SIZE,
  });
  if (error) throw error;

  const routed = entries.filter((entry) => pathOf(collection, entry) !== null);
  const checked = await Promise.all(
    routed.map(async (listed): Promise<SitemapUrl | null> => {
      const { entry, error: entryError } = await getEmDashEntry(collection, String(listed.data.id ?? listed.id));
      if (entryError) throw entryError;
      if (!entry) return null;
      const path = pathOf(collection, entry);
      if (!path) return null;
      const meta = getSeoMeta(entry, { siteUrl });
      if (meta.robots) return null;
      return { path, lastmod: lastmodOf(entry.data.updatedAt), image: meta.ogImage };
    }),
  );
  return { urls: checked.filter((url): url is SitemapUrl => url !== null), cacheHint: cacheHint ?? {} };
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** The built-in's headers (emdash 1.5.0 astro/routes/sitemap*.xml.ts). */
export function xmlResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers:
      status === 200
        ? { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
        : { 'Content-Type': 'application/xml' },
  });
}
