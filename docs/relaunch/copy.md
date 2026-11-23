# Page copy, D3 drafts (issue #48)

Agent-drafted copy for a human edit before anything is entered or published in EmDash.

Drafted 2026-11-23 for the `pages` entries the site reads (`home`, `accelerator`, `services`, `projects`, `updates`, `about`, `contact`), their SEO panel titles and descriptions, and the closing band. Field names are those in `seed/seed.json`. Rules: the content standard in `brief.md`.

How to read the tables:
- **Chars** is the length of the draft as a visitor sees it (link text only, no URL). **Max** is the length of the mockup's placeholder in the same place (`mockups/README.md`: placeholder text marks fields and their lengths), measured from `mockups/pages/*.html`; where a field appears in two places the longer one is used and both are named. The seed sets no `minLength` or `maxLength` on any `pages` field. SEO titles use a working limit of 60 and descriptions 160 (no source in the repository sets one; they are the usual search-result widths, so treat them as a guide).
- `body` is rich text. Each paragraph is a row (`body 1`, `body 2`); a row starting `h3:` is a heading inside the body. Links are written `[text](url)`; enter them with the editor's link button.
- `(empty)` means leave the field empty; the reason is given under the table.
- Rendered head titles: the layout adds the site name after the SEO title with the separator from Settings > SEO; on the home page the site name comes first (`BaseLayout.astro`, D6 notes).

## home (`/`)

Shown by `src/pages/index.astro`: hero (`eyebrow`, `title`, `intro`, `cta_label` + `cta_url`), the about section (`section_label`, `section_heading`, `body`). The two audience panels below it are the `accelerator` and `services` entries (their `eyebrow`, `title`, `intro`, `cost_summary`), drafted in those sections.

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `eyebrow` | Let's make better faster, together. | 35 | 35 |
| `title` | Technology that communities own and run. | 40 | 40 |
| `intro` | We back aligned teams through the Nonprofit DAO Accelerator, and help communities and organizations run their own data and local infrastructure. | 144 | 159 |
| `cta_label` | Get in touch | 12 | 12 |
| `cta_url` | /contact/ | 9 | none |
| `section_label` | About SuperBenefit | 18 | 18 |
| `section_heading` | A worker self-directed nonprofit, run as a network of small teams. | 66 | 66 |
| `body 1` | SuperBenefit is made up of small, self-directed teams, called cells, working on shared problems. Each cell stays in charge of its own funds and decisions, and draws on people, shared infrastructure, funding support and admin help from the rest. | 244 | 249 |
| `body 2` | Current work includes All In For Sport, DAO Primitives and the Institute for Community Sustainability. | 102 | 102 |
| `SEO title` | Nonprofit DAO Accelerator and Local Capacity Building | 53 | 60 |
| `SEO description` | SuperBenefit runs the Nonprofit DAO Accelerator for teams joining as cells, and helps communities and organizations steward their own data and infrastructure. | 158 | 160 |

Wording chosen where the 1440 and 390 px mockups differ (`mockups/README.md`, last paragraph):
- `section_heading`: the 390 px wording, "A worker self-directed nonprofit, run as a network of small teams." The 1440 px wording uses a phrase the content standard rules out.
- The accelerator panel heading is the `accelerator` entry's `title`: the 390 px wording, "Nonprofit DAO Accelerator" (the chosen search term), over the 1440 px "Peer Supports".
- The services panel heading is the `services` entry's `title`: the 390 px wording, "Services", over the 1440 px "Service Offerings", so the panel and the page it links to carry the same name.

SEO title: it contains "Nonprofit DAO Accelerator", so the layout uses it as written and the head title reads SuperBenefit, the separator, then this title. It differs from the `accelerator` SEO title. Left empty, the head title would be SuperBenefit and "Nonprofit DAO Accelerator" (D6 notes).

Standard check: who (aligned teams; communities and organizations, `intro`), what they get (`body 1`; the two panels), what it costs (the panels' `cost_summary`), what happens next (`cta_label`, "See the accelerator", "See services and terms"). The services cost is a gap (issue 46).

## accelerator (`/accelerator/`, and the home page's first panel)

Shown by `src/pages/accelerator.astro`: hero (`eyebrow`, `title`, `intro`, button from `cta_label` + `cta_url`), the "How it works" split (`section_label`, `section_heading`, `body`), the note beside "Supports" (`cost_summary`). The home page shows `eyebrow`, `title`, `intro` and `cost_summary` in its first panel.

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `eyebrow` | For aligned teams joining as cells | 34 | 34 |
| `title` | Nonprofit DAO Accelerator | 25 | 25 |
| `intro` | Four peer supports for teams in the SuperBenefit network, from finding people to handling filings. | 98 | 98 |
| `cta_label` | (empty) | 0 | none |
| `cta_url` | (empty) | 0 | none |
| `section_label` | How it works | 12 | 12 |
| `section_heading` | Join as a cell, keep your decisions. | 36 | 38 |
| `body 1` | The accelerator is for aligned teams that want to join SuperBenefit as cells. Each cell stays in charge of its own funds and decisions and uses the four supports below. | 168 | 187 |
| `body 2` | Bring your own organization, anchor in our DAO, or pass through. Leave anytime. | 79 | 79 |
| `body 3` | To join, use [Talk to us about joining](/contact/) and tell us about your team. | 66 | none |
| `cost_summary` | Peer support between cells. No prices. | 38 | 38 |
| `SEO title` | Nonprofit DAO Accelerator | 25 | 60 |
| `SEO description` | Join SuperBenefit as a cell and share four peer supports: people, shared infrastructure, funding support and admin. No prices. Talk to us about joining. | 152 | 160 |

`intro`: Max is the home panel's placeholder (98); the accelerator page's is 84. `cta_label` and `cta_url` are the "Book an onboarding call" button, which has no link yet (`brief.md`, Answered 2026-11-20): leave both empty and the button is not shown. The band's "Talk to us about joining" button (to `/contact/`) is fixed in code. `body 3` has no mockup counterpart; it says what happens next. The supports themselves are the `supports` collection (D4), not drafted here.

Standard check: who (`eyebrow`, `body 1`), what they get (`intro`, the four supports), what it costs (`cost_summary`), what happens next (`body 3`, the band's button).

## services (`/services/`, and the home page's second panel)

Shown by `src/pages/services/index.astro`: hero (`eyebrow`, `title`, `intro`, button from `cta_label` + `cta_url`, which is also the band's first button), the "How it works" split (`section_label`, `section_heading`, `body`). `cost_summary` is shown only on the home page's second panel. The individual offerings and the "What you get" list on the home panel are the `services` collection and wait on issue 46: not drafted.

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `eyebrow` | For communities and organizations | 33 | 33 |
| `title` | Services | 8 | 8 |
| `intro` | Local capacity building: help stewarding your data and infrastructure, with set deliverables and terms. | 103 | 109 |
| `cta_label` | Ask about a service | 19 | 19 |
| `cta_url` | /contact/ | 9 | none |
| `section_label` | How it works | 12 | 12 |
| `section_heading` | Each service has set deliverables and terms. | 44 | 53 |
| `body 1` | Services are for communities and organizations outside the SuperBenefit network that need help stewarding their data and infrastructure. The work includes training and experiment facilitation. | 192 | 199 |
| `body 2` | Each service below lists who it is for, what you get and its terms. [Ask about a service](/contact/) to start. | 97 | none |
| `cost_summary` | (empty) | 0 | none |
| `SEO title` | Services for communities and organizations | 42 | 60 |
| `SEO description` | SuperBenefit's local capacity building: training, experiment facilitation and similar work for communities and organizations, with set deliverables and terms. | 158 | 160 |

`intro`: Max is the home panel's placeholder (109); the services page's is 76. The `section_heading` gives no number of services because the offerings are being redone. `cost_summary`: waiting on issue 46 (the new offerings and their terms); the old "From $5,000" prices belong to the offerings being replaced, so they are not used.

Standard check: who (`eyebrow`, `body 1`), what they get (`intro`, `body 1`, the offerings from issue 46), what it costs (gap, issue 46), what happens next (`cta_label`, `body 2`).

## projects (`/projects/`)

Shown by `src/pages/projects/index.astro`: hero (`title`, `intro`, and `eyebrow` as the kicker when set). The cards are the `projects` collection (D4).

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `eyebrow` | (empty) | 0 | none |
| `title` | Projects | 8 | 8 |
| `intro` | Work run by SuperBenefit's cells: three active projects and two applicants. | 75 | 91 |
| `SEO title` | Projects in the SuperBenefit network | 36 | 60 |
| `SEO description` | All In For Sport, DAO Primitives and the Institute for Community Sustainability, with Pacto and Social Lean Canvas as applicants. | 129 | 160 |

`eyebrow`: the mockup shows no kicker on this page, so leave it empty. The counts in `intro` and the names in the description must change when a project is added or changes status.

Standard check: who and what (`intro`, the cards), what happens next (each card's "View project"). Cost does not apply to a list of projects.

## updates (`/updates/`)

Shown by `src/components/UpdatesIndex.astro`: hero (`title`, `intro`). No other field is shown. The empty-list text ("No updates yet") is in code, not in this entry.

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `title` | Updates | 7 | 7 |
| `intro` | News from SuperBenefit's projects, newest first. | 48 | 53 |
| `SEO title` | Updates from the projects | 25 | 60 |
| `SEO description` | News from SuperBenefit's projects and cells, newest first. Join the conversation on Discord. | 92 | 160 |

On `/updates/page/2/` and later the layout adds ", page n" to the title and "Page n." before the description (D6 notes), so later pages stay unique.

## about (`/about/`)

Shown by `src/pages/about.astro`: hero (`title`, `intro`, and `eyebrow` as the kicker when set), the split (`section_label`, `section_heading`, `body`), and the closing band's first button from `cta_label` + `cta_url` (both needed).

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `eyebrow` | (empty) | 0 | none |
| `title` | About SuperBenefit | 18 | 18 |
| `intro` | A worker self-directed nonprofit run by small teams called cells. | 65 | 66 |
| `section_label` | What we are | 11 | 11 |
| `section_heading` | Small teams, each in charge of its own funds and decisions. | 59 | 59 |
| `body 1` | SuperBenefit is made up of small, self-directed teams, called cells, working on shared problems. They share people, infrastructure, funding support and admin help, so no one has to build everything from scratch. | 211 | none |
| `body 2` | h3: Two ways to work with us | 28 | none |
| `body 3` | Aligned teams can join as cells through the [Nonprofit DAO Accelerator](/accelerator/). Communities and organizations outside the network can work with us through our [services](/services/). | 159 | none |
| `body 4` | h3: Projects | 12 | none |
| `body 5` | [All In For Sport](https://allinforsport.org/) is building a network of projects that support community-led initiatives advancing inclusion and empowerment through sport. DAO Primitives is a framework for designing purpose-aligned networks of autonomous teams, covering group phase, scale and state. The Institute for Community Sustainability is based in London, Ontario. | 341 | none |
| `body 6` | Two projects are applicants. [Pacto](https://covenant-gov.github.io/pacto-app/) is private messaging with on-chain proposals, voting and a shared treasury. [Social Lean Canvas](https://socialleancanvas.com/) is a free, open-source tool for designing a social enterprise's business and impact model. | 220 | none |
| `body 7` | h3: What we publish | 19 | none |
| `body 8` | The [Knowledge Garden](https://knowledge.superbenefit.org/) holds our shared documentation, including the Reimagining Power Project's pages on All In For Sport, the Equality Fund and the Institute for Community Sustainability. | 187 | none |
| `body 9` | To talk about any of this, [get in touch](/contact/). | 40 | none |
| `cta_label` | Get in touch | 12 | 20 |
| `cta_url` | /contact/ | 9 | none |
| `SEO title` | About | 5 | 60 |
| `SEO description` | SuperBenefit is a worker self-directed nonprofit digital LLC made up of small teams called cells: how it is organized, its projects and how to work with it. | 156 | 160 |

`eyebrow`: the mockup shows no kicker, so leave it empty. `body` has no Max: the mockup's placeholder says the body is free rich text. The mockup's gold quote section is not built (C8 notes), and no attributed quote exists in any source, so the body has none. `cta_label` + `cta_url` give the same button as the layout's default; they are drafted so an editor sees the field in use. SEO title "About" renders as About, the separator, SuperBenefit; "About SuperBenefit" would repeat the name.

Standard check: who and what (`intro`, `body 1`, `body 3`), cost (on the accelerator and services pages, linked from `body 3`), what happens next (`body 9`, the band's button).

## contact (`/contact/`)

Shown by `src/pages/contact.astro`: hero (`eyebrow`, `title`, `intro`), the aside (`section_heading`, `body`; a last paragraph that is only a link renders as the aside's arrow link), and the closing band's outline button from `cta_label` + `cta_url` (both needed).

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `eyebrow` | Contact | 7 | 7 |
| `title` | Get in touch | 12 | 12 |
| `intro` | Write about a project, a service or joining as a cell. | 54 | 55 |
| `section_heading` | How we work | 11 | 11 |
| `body 1` | SuperBenefit is a small network. We respond personally and try to be useful even when a formal engagement is not the right fit. | 127 | 127 |
| `body 2` | For project proposals, partnership ideas, speaking, or just to say hello, the form is the fastest path. We reply within a few days. | 131 | 131 |
| `body 3` | [contact@superbenefit.org](mailto:contact@superbenefit.org) | 24 | 24 |
| `cta_label` | (empty) | 0 | none |
| `cta_url` | (empty) | 0 | none |
| `SEO title` | Contact | 7 | 60 |
| `SEO description` | Write to SuperBenefit about a project, a service or joining the Nonprofit DAO Accelerator. We read every message and reply within a few days. | 141 | 160 |

`body 2`: Max is the mockup's 103 plus the reply-time sentence with its space (28), which says what happens next. `body 3` is a paragraph holding only the link, so it renders as the aside's arrow link. `cta_label` + `cta_url` are the band's "Book an onboarding call" button, which has no link yet (`brief.md`, Answered 2026-11-20): leave both empty and the button is not shown.

## Closing band (widget area `closing-band`)

One content widget on every page except the error pages: its title is the heading, its first paragraph the text, and the link in its last paragraph the "Join the Discord" button (seed `widgetAreas`). The first button is set per page in code.

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `heading (widget title)` | Tell us what you are working on. | 32 | 32 |
| `text (first paragraph)` | Write to us and we reply within a few days, or join the Discord. | 64 | 69 |
| `button (last paragraph)` | [Join the Discord](https://discord.gg/DMezXT7UAt) | 16 | 16 |

The heading and button are the seed's, unchanged. The text replaces the seed's "We read every message. Write to us, or join the community on Discord." with the reply time, so a visitor knows what happens next. Editors change it in the widget area; the seed is not changed here.

## Sources

Read 2026-11-23. Repository paths are on branch `feature/relaunch` unless marked `origin/main`.

| Claim | Source | Read |
| --- | --- | --- |
| "Nonprofit DAO Accelerator" is the chosen search term; it is for aligned teams who want to join as cells | `docs/relaunch/brief.md`, Messaging | 2026-11-23 |
| Local Capacity Building is for external communities and organizations who need help stewarding their data and infrastructure, for local resilience and social change | `docs/relaunch/brief.md`, Messaging | 2026-11-23 |
| The accelerator's supports are peer support, internal, with no prices or SLAs | `docs/relaunch/brief.md`, Accelerator/supports vs services | 2026-11-23 |
| Services are for external organizations, deliverable- and SLA-focused: training, experiment facilitation and similar | `docs/relaunch/brief.md`, Accelerator/supports vs services | 2026-11-23 |
| Four supports: people to work with, shared infrastructure, funding support, admin and paperwork (finding people, filings) | `docs/relaunch/mockups/pages/accelerator.html`; `origin/main:src/components/InternalServices.astro`; `docs/relaunch/issues.md`, D4 ("the four supports") | 2026-11-23 |
| "Peer support between cells. No prices." | `docs/relaunch/mockups/pages/accelerator.html` and `home.html`; `docs/relaunch/brief.md` | 2026-11-23 |
| "Bring your own organization, anchor in our DAO, or pass through. Leave anytime." | `docs/relaunch/mockups/pages/accelerator.html`; `origin/main:src/components/InternalServices.astro` | 2026-11-23 |
| Cells are small, self-directed teams working on shared problems, each in charge of its own funds and decisions | `docs/relaunch/mockups/pages/home.html`, `about.html`; `origin/main:src/pages/support/index.astro` | 2026-11-23 |
| SuperBenefit is a worker self-directed nonprofit ("a Worker Self-Directed Non-Profit Digital LLC") | https://superbenefit.org/ (footer); `docs/relaunch/mockups/pages/about.html` | 2026-11-23 |
| "Let's make better faster, together." | `origin/main:src/components/Hero.astro`; https://superbenefit.org/ | 2026-11-23 |
| Five projects: All In For Sport, DAO Primitives and the Institute for Community Sustainability active; Pacto and Social Lean Canvas applicants | `docs/relaunch/brief.md`, Active projects; `docs/relaunch/issues.md`, Answered by the owner (2026-11-21) | 2026-11-23 |
| The Institute for Community Sustainability is in London, Ontario | `docs/relaunch/brief.md`, Active projects | 2026-11-23 |
| All In For Sport is building a network of projects that support community-led initiatives advancing inclusion and empowerment through sport | https://allinforsport.org/ | 2026-11-23 |
| DAO Primitives is a framework for designing purpose-aligned networks of autonomous teams, covering group phase, scale and state | `docs/relaunch/mockups/pages/home.html`; `origin/main:src/data/mock-projects.json` | 2026-11-23 |
| Pacto is private messaging with on-chain proposals, voting and a shared treasury | https://covenant-gov.github.io/pacto-app/ | 2026-11-23 |
| Social Lean Canvas is free and open source, for designing a social enterprise's business and impact model | https://socialleancanvas.com/ | 2026-11-23 |
| The Knowledge Garden holds Reimagining Power Project pages on All In For Sport, the Equality Fund and the Institute for Community Sustainability | https://knowledge.superbenefit.org/docs | 2026-11-23 |
| "We respond personally and try to be useful even when a formal engagement is not the right fit"; the form for proposals, partnerships, speaking or hello | `origin/main:src/pages/contact.astro`; `docs/relaunch/mockups/pages/contact.html` | 2026-11-23 |
| We reply within a few days | `origin/main:src/pages/contact.astro` (success message: "We'll be in touch within a few days.") | 2026-11-23 |
| contact@superbenefit.org | `origin/main:src/pages/contact.astro`; `docs/relaunch/mockups/pages/contact.html` | 2026-11-23 |
| Discord invite https://discord.gg/DMezXT7UAt | `docs/relaunch/brief.md`, Answered (2026-11-20); `seed/seed.json` | 2026-11-23 |
| "Book an onboarding call" has no link; the button is hidden until an editor adds one | `docs/relaunch/brief.md`, Answered (2026-11-20) | 2026-11-23 |

Also read, with no claim taken from them: https://superbenefit.org/about/ (a "Coming soon" page), https://knowledge.superbenefit.org/, https://knowledge.superbenefit.org/article/reimagining-power-how-web3-can-transform-impact, and on `origin/main` `src/pages/index.astro`, `about.astro`, `projects.astro`, `src/components/MissionStatement.astro`, `ExternalServices.astro`, `CallToAction.astro`, `KnowledgeSpotlight.astro`. Their wording mostly uses phrases the content standard rules out. Every site above answered 200 when fetched.

## Gaps

Facts the copy needs that no source gives. Each is left out of the drafts.

- The new service offerings and their terms (issue 46): the `services` entries, the home panel's "What you get" list and the `services` entry's `cost_summary`. Until then the services page and panel say nothing about price.
- A link for "Book an onboarding call": the `accelerator` hero button and the contact band's outline button stay empty.
- What the Institute for Community Sustainability does: the brief gives only its name and London, Ontario, and no public site for it is named. The about body says only where it is.
- A public site or page for DAO Primitives: the about body describes it from the mockup and the old mock data, with no link.
- What Pacto and Social Lean Canvas are applying for or to (the sources say only "applicant"), and when they applied.
- How many cells or people SuperBenefit has, when it was founded, where its LLC is registered and who runs it: the about page would be more specific with them.
- A quote with a named source for the about page's quote section (not built, C8 notes).
- The project pages' slugs: the about body links projects to their own sites, not to `/projects/{slug}/`, since no entry exists yet.
