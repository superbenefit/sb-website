/**
 * Determines whether a nav link should be highlighted as the current page.
 *
 * Active if either:
 *   - the current path exactly equals the link's href, OR
 *   - the current path begins with the link's href followed by a slash
 *     (i.e. a child route of the link).
 *
 * The trailing-slash check is important: it prevents `/services` from
 * matching a hypothetical `/services-faq` or `/serviceshare` route.
 *
 * Special case for the root: `/` is active only on `/`, never on a child
 * (since every path starts with `/`, which would otherwise match).
 *
 * Single source of truth for nav active state. Imported by both
 * `Nav.astro` (server) and `BaseLayout.astro` (client) so the logic
 * cannot drift between them.
 */
export function isNavLinkActive(currentPath: string, href: string): boolean {
  if (href === '/') {
    return currentPath === '/';
  }
  return currentPath === href || currentPath.startsWith(href + '/');
}
