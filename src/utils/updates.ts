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

/**
 * Which project each update links to, read from the projects' side: every
 * project's `updates` reference field lists the updates that link to it
 * (https://docs.emdashcms.com/guides/relations/#see-what-links-to-an-entry).
 * One query for the projects, then one per project, however many updates
 * there are.
 */
export async function getUpdateProjects(): Promise<{
  byUpdate: Map<string, ContentEntry<ProjectData>>;
  cacheHints: CacheHint[];
}> {
  const { entries: projects, cacheHint } = await getEmDashCollection('projects');
  const cacheHints: CacheHint[] = [cacheHint];
  const byUpdate = new Map<string, ContentEntry<ProjectData>>();
  await Promise.all(
    projects.map(async (project) => {
      let cursor: string | undefined;
      do {
        const page = await getEmDashReferences('projects', project.data.id, 'updates', { limit: 100, cursor });
        if (page.error) console.error(`[updates] updates of project ${project.id}:`, page.error);
        if (page.cacheHint) cacheHints.push(page.cacheHint);
        for (const update of page.entries) byUpdate.set(update.id, project as ContentEntry<ProjectData>);
        cursor = page.nextCursor;
      } while (cursor);
    }),
  );
  return { byUpdate, cacheHints };
}

export function projectHref(project: ContentEntry<ProjectData>): string {
  return `/projects/${project.data.slug ?? project.id}/`;
}

export function updateHref(update: UpdateData): string {
  return `/updates/${update.data.slug ?? update.id}/`;
}

/** What the updates index can be narrowed and ordered by (the query string of /updates/). */
export interface UpdatesQuery {
  /** Words to find in a title or excerpt. */
  q: string;
  /** Slug of the project to show updates for; empty for all. */
  project: string;
  /** Slug of the category to show updates in; empty for all. */
  category: string;
  /** Slug of the tag to show updates with; empty for all. Set by the tag links on an update. */
  tag: string;
  sort: 'newest' | 'oldest';
}

/** Reads `q`, `project`, `category`, `tag` and `sort` from a URL's query string; anything else is ignored. */
export function readUpdatesQuery(url: URL): UpdatesQuery {
  return {
    q: (url.searchParams.get('q') ?? '').trim().slice(0, 100),
    project: (url.searchParams.get('project') ?? '').trim().slice(0, 100),
    category: (url.searchParams.get('category') ?? '').trim().slice(0, 100),
    tag: (url.searchParams.get('tag') ?? '').trim().slice(0, 100),
    sort: url.searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest',
  };
}

/** The query string for a set of choices, without the defaults: "" or "?q=…&project=…&sort=oldest". */
export function updatesQueryString(query: UpdatesQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.project) params.set('project', query.project);
  if (query.category) params.set('category', query.category);
  if (query.tag) params.set('tag', query.tag);
  if (query.sort === 'oldest') params.set('sort', 'oldest');
  const text = params.toString();
  return text ? `?${text}` : '';
}

/**
 * One page of the updates index.
 *
 * EmDash 1.5.0 offers cursor and offset pagination with `hasMore`, and no
 * total count ("Cursor pagination does not calculate a total page count",
 * querying-content guide). The mockup's pager reads "Page 1 of 3", so the
 * index reads every published update in one query, ordered by
 * `published_at` (`orderBy`, querying-content guide), and slices the page
 * from it.
 *
 * Search and the project filter work on that same list: `q` keeps the
 * updates whose title or excerpt holds every word (the body is not
 * searched: EmDash's full-text search needs the collection's `search`
 * support, which the content model does not turn on); `project` keeps the
 * updates that link to that project, and the filter offers only projects
 * that have updates (getUpdateProjects, one query per project). `category`
 * and `tag` keep the updates that carry that term.
 */
export async function getUpdatesPage(
  page: number,
  query: UpdatesQuery = { q: '', project: '', category: '', tag: '', sort: 'newest' },
): Promise<{
  items: EntryItem[];
  page: number;
  totalPages: number;
  /** Updates that match the search and filter. */
  total: number;
  /** Projects to offer in the filter: those that at least one update links to. */
  projects: { slug: string; title: string }[];
  /** Categories to offer in the filter: those that at least one update is in. */
  categories: { slug: string; label: string }[];
  /** The tag the list is narrowed to, when `query.tag` names one in use. */
  tag: { slug: string; label: string } | null;
  cacheHints: CacheHint[];
  error?: Error;
}> {
  const { entries: all, cacheHint, error } = await getEmDashCollection('updates', {
    orderBy: { published_at: query.sort === 'oldest' ? 'asc' : 'desc' },
  });
  if (error) console.error('[updates] index query failed:', error);
  const hints: CacheHint[] = [cacheHint];

  const words = query.q.toLowerCase().split(/\s+/).filter(Boolean);
  let entries = words.length
    ? all.filter((entry) => {
        const text = `${entry.data.title ?? ''} ${entry.data.excerpt ?? ''}`.toLowerCase();
        return words.every((word) => text.includes(word));
      })
    : all;

  // Each project lists the updates that link to it (its `updates` reference
  // field, the other end of the update's `project` field), so the links are
  // read once per project instead of once per update.
  const linked = await getUpdateProjects();
  hints.push(...linked.cacheHints);
  const withUpdates = new Map<string, string>();
  for (const entry of all) {
    const project = linked.byUpdate.get(entry.id);
    if (project?.data.slug) withUpdates.set(project.data.slug, project.data.title);
  }

  // Categories and tags come with each entry (`data.terms`,
  // https://docs.emdashcms.com/guides/taxonomies/#display-an-entrys-terms).
  const inUse = new Map<string, string>();
  let tag: { slug: string; label: string } | null = null;
  for (const entry of all) {
    for (const term of entry.data.terms?.category ?? []) inUse.set(term.slug, term.label);
    if (query.tag && !tag) tag = (entry.data.terms?.tag ?? []).find((term) => term.slug === query.tag) ?? null;
  }

  if (query.project) {
    entries = entries.filter((entry) => linked.byUpdate.get(entry.id)?.data.slug === query.project);
  }
  if (query.category) {
    entries = entries.filter((entry) => (entry.data.terms?.category ?? []).some((term) => term.slug === query.category));
  }
  if (query.tag) {
    entries = entries.filter((entry) => (entry.data.terms?.tag ?? []).some((term) => term.slug === query.tag));
  }

  const totalPages = Math.max(1, Math.ceil(entries.length / UPDATES_PER_PAGE));
  const pageEntries = entries.slice((page - 1) * UPDATES_PER_PAGE, page * UPDATES_PER_PAGE);

  const items = pageEntries.map((entry): EntryItem => {
    const project = linked.byUpdate.get(entry.id) ?? null;
    const [category] = entry.data.terms?.category ?? [];
    return {
      href: updateHref(entry),
      title: entry.data.title,
      date: entry.data.publishedAt,
      excerpt: entry.data.excerpt,
      cover: entry.data.cover,
      project: project ? { title: project.data.title, href: projectHref(project) } : null,
      category: category ? { label: category.label, href: `/updates/?category=${encodeURIComponent(category.slug)}` } : null,
    };
  });

  return {
    items,
    page,
    totalPages,
    total: entries.length,
    projects: [...withUpdates]
      .map(([slug, title]) => ({ slug, title }))
      .sort((a, b) => a.title.localeCompare(b.title)),
    categories: [...inUse].map(([slug, label]) => ({ slug, label })).sort((a, b) => a.label.localeCompare(b.label)),
    tag,
    cacheHints: hints,
    error,
  };
}
