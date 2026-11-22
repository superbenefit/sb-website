/**
 * Whether a menu link points at the current page or one of its children, so
 * the header can set `aria-current="page"` (EmDash's menus guide marks the
 * active item this way: https://docs.emdashcms.com/guides/menus/).
 *
 * Pages render on demand with `trailingSlash: 'ignore'`, so `/about` and
 * `/about/` are the same page; both sides are compared without the trailing
 * slash. A child path counts as active (`/projects/acme/` marks
 * `/projects/`), as the mockups show for the project page. `/` is active only
 * on `/`. Links with a #fragment and links to other sites are never active.
 */
export function isNavLinkActive(currentPath: string, href: string): boolean {
  if (href.includes('#') || !href.startsWith('/') || href.startsWith('//')) {
    return false;
  }

  const strip = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);
  const current = strip(currentPath);
  const target = strip(href.split('?')[0]);

  if (target === '/') {
    return current === '/';
  }
  return current === target || current.startsWith(target + '/');
}
