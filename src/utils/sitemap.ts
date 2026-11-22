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
 * pattern URL `/home` (a 301 to `/`, src/pages/home.astro).
 *
 * Read through EmDash's public query API only:
 * - getEmDashCollection() gives the published entries (status defaults to
 *   published; deleted entries are never listed), in content ID order like
 *   the built-in's pages (`orderBy: { id: 'asc' }`; stored names,
 *   https://docs.emdashcms.com/guides/querying-content/).
 * - A list entry carries no SEO panel values in 1.5.0 (the loader joins
 *   `_emdash_seo` on the single-entry path only, src/loader.ts), so each
 *   entry is read again with getEmDashEntry() and getSeoMeta() resolves its
 *   no-index choice (`robots`) and SEO image (`ogImage`), as the SEO guide
 *   documents. One query per entry: the cost of not reaching into EmDash's
 *   tables (findings.md, P2).
 * - The collections and their URLs are the site's routes, below. EmDash's
 *   collection flags (routable, SEO) and URL patterns have no public reader
 *   in 1.5.0, so a collection added in the admin is not listed until it is
 *   added here (findings.md, P2).
 */
import { getEmDashCollection, getEmDashEntry, getSeoMeta, getSiteSettingsWithCacheHint } from 'emdash';
import type { CacheHint } from 'emdash';
import { env } from 'cloudflare:workers';

/** The routable collections with SEO (seed/seed.json) and each entry's canonical path. */
export const SITEMAP_COLLECTIONS = {
  pages: (slug) => (slug === 'home' ? '/' : `/${encodeURIComponent(slug)}/`),
  projects: (slug) => `/projects/${encodeURIComponent(slug)}/`,
  updates: (slug) => `/updates/${encodeURIComponent(slug)}/`,
} satisfies Record<string, (slug: string) => string>;

export type SitemapCollection = keyof typeof SITEMAP_COLLECTIONS;

function isSitemapCollection(name: string): name is SitemapCollection {
  return Object.hasOwn(SITEMAP_COLLECTIONS, name);
}

/** Entries per child sitemap, as EmDash 1.5.0 (`SITEMAP_PAGE_SIZE`, api/handlers/seo.ts). */
export const SITEMAP_PAGE_SIZE = 2000;

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
export async function sitemapSiteUrl(requestUrl: URL): Promise<{ siteUrl: string; cacheHint: CacheHint }> {
  const { data: settings, cacheHint } = await getSiteSettingsWithCacheHint();
  let envUrl: string | undefined;
  try {
    const raw = (env as { EMDASH_SITE_URL?: string }).EMDASH_SITE_URL;
    const parsed = raw ? new URL(raw) : undefined;
    if (parsed && (parsed.protocol === 'http:' || parsed.protocol === 'https:')) envUrl = parsed.origin;
  } catch {
    envUrl = undefined;
  }
  const siteUrl = (settings.url || envUrl || requestUrl.origin).replace(/\/$/, '');
  return { siteUrl, cacheHint };
}

export interface SitemapUrl {
  /** Canonical path, ending in `/`. */
  path: string;
  lastmod: string;
  /** Absolute SEO image URL, or null. */
  image: string | null;
}

/**
 * Every listed entry of one collection, in content ID order, with the cache
 * hint of the collection query. Throws when a query fails, so the route
 * answers 500 rather than a sitemap with entries missing.
 */
export async function getSitemapUrls(
  collection: SitemapCollection,
  siteUrl: string,
): Promise<{ urls: SitemapUrl[]; cacheHint: CacheHint }> {
  const toPath = SITEMAP_COLLECTIONS[collection];
  const { entries, cacheHint, error } = await getEmDashCollection(collection, {
    orderBy: { id: 'asc' },
  });
  if (error) throw error;

  const withSlug = entries.filter((entry) => typeof entry.data.slug === 'string' && entry.data.slug.trim() !== '');
  const checked = await Promise.all(
    withSlug.map(async (listed): Promise<SitemapUrl | null> => {
      const { entry, error: entryError } = await getEmDashEntry(collection, String(listed.data.id ?? listed.id));
      if (entryError) throw entryError;
      if (!entry) return null;
      const meta = getSeoMeta(entry, { siteUrl });
      if (meta.robots) return null;
      const updatedAt = entry.data.updatedAt;
      return {
        path: toPath(String(entry.data.slug)),
        lastmod: updatedAt instanceof Date ? updatedAt.toISOString() : String(updatedAt ?? ''),
        image: meta.ogImage,
      };
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
