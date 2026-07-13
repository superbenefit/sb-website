/**
 * Determines whether a nav link should be highlighted as the current page.
 *
 * Active if the current path matches the link's path. Anchor links (hrefs
 * containing a #fragment) are NEVER active — they point to sections on the
 * homepage and do not represent standalone pages.
 *
 * The trailing-slash check prevents `/services` from matching a hypothetical
 * `/services-faq` or `/serviceshare` route.
 *
 * Special case for the root: `/` is active only on `/`, never on a child
 * (since every path starts with `/`, which would otherwise match).
 *
 * Note: This function is duplicated in `BaseLayout.astro` for client-side
 * re-evaluation on every `astro:page-load`. Keep both copies in sync so they
 * cannot drift between them.
 */
export function isNavLinkActive(currentPath: string, href: string): boolean {
  // Anchor links (#fragment) are never "active" — they scroll to homepage sections
  if (href.includes('#')) {
    return false;
  }

  if (href === '/') {
    return currentPath === '/';
  }
  return currentPath === href || currentPath.startsWith(href + '/');
}
