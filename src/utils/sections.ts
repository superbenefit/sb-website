/**
 * Page sections: the `layout` blocks field of a `pages` entry
 * (https://docs.emdashcms.com/guides/blocks/). An editor adds, fills and
 * reorders the sections in the admin; this module reads a page and works out
 * what each section component needs to know about its place on the page:
 * the colour above it (for the wave divider) and the page's hero colour.
 *
 * Colours stay in the templates. A section's own colour comes from its type
 * (and, for a text section, its Background setting); a hero takes the colour
 * its route gives it.
 */
import { getEmDashEntry } from 'emdash';
import type { CacheHint, ContentEntry } from 'emdash';
import type { Page, PageLayoutBlock, PageLayoutHeroBlock, PageLayoutOfferPanelBlock } from '../../emdash-env';

export type HeroVariant = 'home' | 'black' | 'charcoal' | 'gold' | 'green' | 'orange' | 'red';
export type Tone = 'black' | 'charcoal' | 'cream' | 'gold' | 'green' | 'orange' | 'red' | 'doors';

export interface Place {
  /** Colour of the section above, or null for the first section. */
  before: Tone | null;
  /** True when the section above is a dark hero, which ends in the colour bands. */
  bands: boolean;
  tone: Tone;
  /** Colour of the section below, or null for the last section. */
  after: Tone | null;
  hero: HeroVariant;
  /** Show the wordmark beside the hero text (About). */
  heroArt: boolean;
  /** Offer panels that follow this one directly; they render side by side. */
  group?: PageLayoutOfferPanelBlock[];
}

export type Placed<T extends PageLayoutBlock = PageLayoutBlock> = T & { __place: Place };

export interface PageSections {
  entry: ContentEntry<Page> | null;
  cacheHint: CacheHint | undefined;
  sections: Placed[];
  hero: PageLayoutHeroBlock | undefined;
  /** Head title: the hero heading, else the page name, else the fallback. */
  title: string;
  description: string;
  /** Colour of the last section, for what follows it. */
  lastTone: Exclude<Tone, 'doors'>;
  /** True when the last section is a dark hero. */
  lastBands: boolean;
}

function toneOf(block: PageLayoutBlock, hero: HeroVariant): Tone {
  switch (block._type) {
    case 'hero':
      return hero === 'home' ? 'black' : hero;
    case 'text_section':
      return block.background === 'Charcoal' ? 'charcoal' : 'cream';
    case 'offer_panel':
      return 'doors';
    case 'project_showcase':
      return 'charcoal';
    default:
      return 'cream';
  }
}

export function placeSections(
  layout: readonly PageLayoutBlock[] | null | undefined,
  options: { hero: HeroVariant; heroArt?: boolean },
): Pick<PageSections, 'sections' | 'lastTone' | 'lastBands'> {
  const sections: Placed[] = [];
  let before: Tone | null = null;
  let bands = false;
  for (const block of Array.isArray(layout) ? layout : []) {
    const last = sections.at(-1);
    if (block._type === 'offer_panel' && last?._type === 'offer_panel') {
      last.__place.group!.push(block);
      continue;
    }
    const tone = toneOf(block, options.hero);
    if (last) last.__place.after = tone;
    const place: Place = { before, bands, tone, after: null, hero: options.hero, heroArt: options.heroArt ?? false };
    if (block._type === 'offer_panel') place.group = [];
    sections.push({ ...block, __place: place });
    before = tone;
    bands = block._type === 'hero' && (tone === 'black' || tone === 'charcoal');
  }
  // After the panels the page continues from their lower edge, which no
  // closing band meets in the design; treat it as cream.
  return { sections, lastTone: before === null || before === 'doors' ? 'cream' : before, lastBands: bands };
}

/** Reads a `pages` entry and places its sections. `fallback` is the title of a page with no entry. */
export async function getPageSections(
  slug: string,
  options: { hero: HeroVariant; heroArt?: boolean; fallback: string },
): Promise<PageSections> {
  const { entry, cacheHint } = await getEmDashEntry('pages', slug);
  const layout = entry?.data.layout;
  const hero = (Array.isArray(layout) ? layout : []).find((block): block is PageLayoutHeroBlock => block._type === 'hero');
  const placed = placeSections(layout, options);
  if (placed.sections.length === 0) {
    // No entry, or an entry with no sections yet: the page still has its one <h1>.
    const stand: PageLayoutHeroBlock = { _type: 'hero', _version: 1, _key: 'fallback', heading: entry?.data.title || options.fallback };
    Object.assign(placed, placeSections([stand], options));
  }
  return {
    entry: entry ?? null,
    cacheHint,
    ...placed,
    hero,
    title: hero?.heading || entry?.data.title || options.fallback,
    description: hero?.intro || '',
  };
}
