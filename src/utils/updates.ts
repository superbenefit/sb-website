/**
 * Reading `updates` entries for the updates index, the update page and lists
 * of updates elsewhere, with EmDash's query helpers (emdash 1.5.0,
 * src/query.ts; https://docs.emdashcms.com/guides/querying-content/).
 *
 * Every function returns the cache hints of what it read, for the caller to
 * pass to Astro.cache.set() (https://docs.emdashcms.com/deployment/route-caching/).
 */
import { getEmDashCollection, getEmDashReferences } from 'emdash';
import type { CacheHint, ContentBylineCredit, ContentEntry, InferCollectionData } from 'emdash';
import type { EntryItem } from '../components/EntryList.astro';

/** Updates per index page: the six entries, two rows of three, the mockup shows. */
export const UPDATES_PER_PAGE = 6;

type UpdateData = ContentEntry<InferCollectionData<'updates'>>;
type ProjectData = InferCollectionData<'projects'>;

/** "November 22, 2026": the mockups' date form ("Month 00, 2026"). */
export function formatUpdateDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/** The credited bylines' names, "Ada", "Ada and Ben", "Ada, Ben, and Cy"; null when there are none. */
export function bylineNames(credits: ContentBylineCredit[] | undefined): string | null {
  const names = (credits ?? []).map((credit) => credit.byline.displayName).filter(Boolean);
  if (names.length === 0) return null;
  return new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(names);
}

/**
 * The project an update links to, or null. The reference value is not part
 * of `data`; for a single entry it comes from getEmDashEntry's `references`,
 * for an entry in a list from getEmDashReferences (one query per entry: 1.5.0
 * offers `references` on getEmDashEntry only).
 */
export async function getUpdateProject(
  updateId: string,
): Promise<{ project: ContentEntry<ProjectData> | null; cacheHint: CacheHint }> {
  const { entries, cacheHint, error } = await getEmDashReferences<ProjectData>('updates', updateId, 'project', {
    limit: 1,
  });
  if (error) console.error(`[updates] project reference of ${updateId}:`, error);
  return { project: entries[0] ?? null, cacheHint: cacheHint ?? {} };
}

export function projectHref(project: ContentEntry<ProjectData>): string {
  return `/projects/${project.data.slug ?? project.id}/`;
}

export function updateHref(update: UpdateData): string {
  return `/updates/${update.data.slug ?? update.id}/`;
}

/**
 * One page of the updates index, newest first.
 *
 * EmDash 1.5.0 offers cursor and offset pagination with `hasMore`, and no
 * total count ("Cursor pagination does not calculate a total page count",
 * querying-content guide). The mockup's pager reads "Page 1 of 3", so the
 * index reads every published update in one query, ordered by
 * `published_at`, and slices the page from it. Only the page's entries get
 * their project looked up.
 */
export async function getUpdatesPage(page: number): Promise<{
  items: EntryItem[];
  page: number;
  totalPages: number;
  cacheHints: CacheHint[];
  error?: Error;
}> {
  const { entries, cacheHint, error } = await getEmDashCollection('updates', {
    orderBy: { published_at: 'desc' },
  });
  if (error) console.error('[updates] index query failed:', error);

  const totalPages = Math.max(1, Math.ceil(entries.length / UPDATES_PER_PAGE));
  const pageEntries = entries.slice((page - 1) * UPDATES_PER_PAGE, page * UPDATES_PER_PAGE);
  const projects = await Promise.all(pageEntries.map((entry) => getUpdateProject(entry.id)));

  const items = pageEntries.map((entry, i): EntryItem => {
    const project = projects[i].project;
    return {
      href: updateHref(entry),
      title: entry.data.title,
      date: entry.data.publishedAt,
      excerpt: entry.data.excerpt,
      cover: entry.data.cover,
      project: project ? { title: project.data.title, href: projectHref(project) } : null,
    };
  });

  return {
    items,
    page,
    totalPages,
    cacheHints: [cacheHint, ...projects.map((p) => p.cacheHint)],
    error,
  };
}
