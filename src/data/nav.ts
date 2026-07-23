export interface NavLink {
  href: string;
  label: string;
}

export const mainNavLinks: NavLink[] = [
  { href: '/#about', label: 'About' },
  { href: '/#support', label: 'Support' },
  { href: '/#services', label: 'Services' },
];

export const contactNavLink: NavLink = { href: '/contact', label: 'Contact' };
