# Relaunch mockups

The owner's design for the relaunch, received 2026-11-21. **These are the design instructions.** Build pages to match them. Where a mockup and any other document disagree about how something looks or behaves, the mockup wins.

Placeholder text in the mockups marks fields and their lengths. It is not copy; copy is written separately to the content standard in `../brief.md`.

## What is here
| Path | What it is | Use it for |
| --- | --- | --- |
| `superbenefit.org-relaunch-mockups.html` | The owner's file, unchanged. Open it in a browser. | The source of truth. Shows every page at 1440 and 390 px with the real fonts and the working project selector. |
| `screenshots/{page}-{width}.jpg` | Full-page renders of each page at 1440 and 390 px. | Looking at a page without a browser. |
| `pages/{page}.html` | Each page's markup, extracted from the owner's file and indented. One file serves both widths; the layout is responsive. | Reading structure, class names, heading levels and ARIA attributes. Opens in a browser (system fonts stand in for the web fonts). |
| `mockups.css` | The one stylesheet all pages share, extracted and reformatted. 44 KB. | Exact values: tokens, spacing, breakpoints, component rules. |
| `project-selector.reference.js` | The home page project selector's logic as the design tool exported it. | The behaviour to reproduce. Not shippable: it depends on the design tool's runtime. |
| `assets/` | The two images the mockups use: the SuperBenefit icon and the "Built on Ethereum" badge. Both already exist in `src/assets/`. | Reference. |

The extracted files were generated from the owner's file by script. Two things were changed on purpose: links between pages point at the files in `pages/`, and one empty white box that the design tool left in the 1440 px home hero was removed. Nothing else was edited.

## Pages
| Page | Route | Markup | Issue |
| --- | --- | --- | --- |
| Home | `/` | `pages/home.html` | C3 |
| Accelerator | `/accelerator/` | `pages/accelerator.html` | C4 |
| Services | `/services/` | `pages/services.html` | C5 |
| Projects | `/projects/` | `pages/projects.html` | C6 |
| Project | `/projects/{slug}/` | `pages/project.html` | C6 |
| Updates | `/updates/` | `pages/updates.html` | C7 |
| Update | `/updates/{slug}/` | `pages/update.html` | C7 |
| About | `/about/` | `pages/about.html` | C8 |
| Contact | `/contact/` | `pages/contact.html` | C9 |
| Not found | 404 | `pages/not-found.html` | C10 |
| Server error | 500 | `pages/server-error.html` | C10 |
| Mobile menu, open | header, 390 px | `pages/mobile-menu-open.html` | C1 |

## Components
Class names are the mockup's own; find the rules in `mockups.css`.

| Component | Class | Where |
| --- | --- | --- |
| Header, nav, menu button | `hd` | every page |
| Four-colour stripe under the header | `stripe` | every page |
| Footer with "Site" and "Elsewhere" menus. Changed after the mockups (owner, 2026-11-22): the footer's coloured stripe runs edge to edge across the window, like the header stripe; the logo, menus and base line stay in the 1200 px column. | `ft` | every page |
| Closing call-to-action band | `close` | every page except the error pages |
| Buttons: `btn--accent`, `btn--ink`, `btn--line` | `btn` | every page |
| Page hero with kicker, title, intro, actions. Changed after the mockups (owner, 2026-11-23): the About hero shows the SuperBenefit wordmark logo, not the icon; variants `ph--black`, `--charcoal`, `--gold`, `--green`, `--orange`, `--red`, `--compact` | `ph` | every page except home |
| Home hero. Changed after the mockups (owner, 2026-11-23): the hero has no icon image (`hero__art`), and the Updates section always shows, with the `empty` box when there are no updates. | `hero` | home |
| Wave divider between sections | `dv` | most pages |
| Section, dark section, two-column split | `sec`, `sec--ink`, `split` | most pages |
| The two audience panels on home | `doors`, `door` | home |
| "What you get / What it costs" list | `ledger` | home, services, project |
| Project selector: names, panels, progress bar, previous, next, pause | `sel` | home |
| Project card | `cc`, `pgrid` | projects, update |
| Status badge: `status--active`, `status--pending`, `status--past` | `status` | home, projects, project, update |
| Logo and image placeholders | `logo-slot`, `slot` | where images go |
| Project detail layout | `pd` | project |
| Support and service items | `blocks`, `block` | accelerator, services |
| Update list and entry | `entries`, `entry` | home, project, updates |
| Pagination | `pager` | updates |
| Update article layout | `article` | update |
| Rich text: headings, lists, quote, figure, code, table | `prose`, `quote`, `scroll` | about, project, update |
| Click-to-load video | `video`, `frame` | update |
| Contact layout, form and fields | `contact`, `form`, `field` | contact |
| Turnstile placeholder, 300 × 65 px | `turnstile` | contact |
| Error page | `err`, `msg` | not found, server error |
| Uppercase label, display heading | `caps`, `display` | everywhere |
| Entrance fade | `fade`, `fade-1` to `fade-3` | everywhere |

## Tokens
The mockups use the tokens already in `src/styles/global.css` (colours, type scale, spacing) and add these. Values are in `:root` in `mockups.css`.

| Token | Value |
| --- | --- |
| `--radius-sm`, `--radius-md`, `--radius-pill` | 8px, 12px, 50px |
| `--space-xl-half` | 3rem |
| `--rule`, `--rule-dark` | 2px solid charcoal; 2px solid cream |
| `--stripe` | four equal bands: red, orange, gold, green |

Fonts are Playfair Display and Inter, as today. Breakpoints in the stylesheet: 480, 700, 760, 769, 900, 1000 and 1024 px.

## Project selector (home)
From `mockups.css` and `project-selector.reference.js`:
- Lists the featured projects by name. One panel is open at a time, showing cover, logo, status, summary and a link.
- At 900 px and wider, and only when the visitor has not asked for reduced motion, it advances to the next project every 7 seconds. A bar on the active name fills over those 7 seconds.
- Hovering pauses the fill. A Pause button stops and resumes auto-advance. Previous and next buttons, and choosing a name, change the project and pause it.
- A counter shows the position, for example "1 / 4".
- Under reduced motion there is no auto-advance and the Pause button is hidden.
- The panel keeps one height while projects change, so nothing below it moves.

## What the mockups do not show
The owner's file contains the pages only. These were asked for in the design prompt and are not in it:
- Form states: field error, submitting, success, server error.
- A component sheet. Focus styles exist only as the five `:focus-visible` rules in `mockups.css`.
- Empty states: an updates list with no entries, a project with no updates.
- Final images: project logos and covers are labelled placeholders.

The home page text differs between the two widths in three headings ("We're a network of small, autonomous teams…" at 1440 px; "A worker self-directed nonprofit, run as a network of small teams." at 390 px; and "Peer Supports" / "Service Offerings" against "Nonprofit DAO Accelerator" / "Services"). `pages/home.html` carries the 1440 px text. Which wording is used is a copy decision, not a design one.
