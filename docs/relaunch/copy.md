# Copy drafts: pages (D3, issue #48) and entries (D4, issue #49)

Agent-drafted copy for a human edit before anything is entered or published in EmDash.

Drafted 2026-11-23 for the `pages` entries the site reads (`home`, `accelerator`, `services`, `projects`, `updates`, `about`, `contact`), their SEO panel titles and descriptions, and the closing band. Field names are those in `seed/seed.json`. The D4 entries (the five `projects` and the four `supports`) follow the pages; the `services` entries wait on issue 46. Rules: the content standard in `brief.md`.

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
| `body 2` | A team can bring its own organization or use our DAO, and leave at any time. | 76 | 79 |
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
| `section_heading` | Training, experiment facilitation and similar work. | 51 | 53 |
| `body 1` | Services are for communities and organizations outside the SuperBenefit network that need help stewarding their data and infrastructure. Each service has set deliverables and terms. | 181 | 199 |
| `body 2` | To start, [ask about a service](/contact/) and tell us what your community or organization needs. | 84 | none |
| `cost_summary` | (empty) | 0 | none |
| `SEO title` | Services for communities and organizations | 42 | 60 |
| `SEO description` | SuperBenefit's local capacity building: training, experiment facilitation and similar work for communities and organizations, with set deliverables and terms. | 158 | 160 |

`intro`: Max is the home panel's placeholder (109); the services page's is 76. The `section_heading` gives no number of services because the offerings are being redone (`issues.md`, D1). No field here refers to a list of offerings: until issue 46's entries are published the page shows "No services are published yet." under this section (`src/pages/services/index.astro`), so the section must read correctly with no list after it. `cost_summary`: waiting on issue 46 (the new offerings and their terms); the old "From $5,000" prices belong to the offerings being replaced, so they are not used.

Standard check: who (`eyebrow`, `body 1`), what they get (`intro`, `section_heading`; each offering's deliverables wait on issue 46), what it costs (gap, issue 46: nothing on this page says a price until then), what happens next (`cta_label`, `body 2`).

## projects (`/projects/`)

Shown by `src/pages/projects/index.astro`: hero (`title`, `intro`, and `eyebrow` as the kicker when set). The cards are the `projects` collection (D4).

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `eyebrow` | (empty) | 0 | none |
| `title` | Projects | 8 | 8 |
| `intro` | Three active projects and two applicants. | 41 | 91 |
| `SEO title` | Projects and applicants | 23 | 60 |
| `SEO description` | All In For Sport, DAO Primitives and the Institute for Community Sustainability, with Pacto and Social Lean Canvas as applicants. | 129 | 160 |

`eyebrow`: the mockup shows no kicker on this page, so leave it empty. `intro` and the SEO title give only the five projects' status, which is all the sources give; no source says who runs each project (Gaps). The counts in `intro` and the names in the description must change when a project is added or changes status.

Standard check: who and what (`intro`, the cards), what happens next (each card's "View project"). Cost does not apply to a list of projects.

## updates (`/updates/`)

Shown by `src/components/UpdatesIndex.astro`: hero (`title`, `intro`). No other field is shown. The empty-list text ("No updates yet") is in code, not in this entry.

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `title` | Updates | 7 | 7 |
| `intro` | News from SuperBenefit's projects, newest first. | 48 | 53 |
| `SEO title` | Updates from the projects | 25 | 60 |
| `SEO description` | News from SuperBenefit's projects, newest first. Join the conversation on Discord. | 82 | 160 |

On `/updates/page/2/` and later the layout adds ", page n" to the title and "Page n." before the description (D6 notes), so later pages stay unique.

Standard check: who and what (`intro`: news from the five projects), what happens next (each entry's linked title and "Project:" link, `src/components/EntryList.astro`; the closing band's contact and Discord buttons; the SEO description names Discord). Cost does not apply to a list of news; the intro does not say what happens next, because its placeholder (53) leaves no room once it says what the page holds.

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
| `body 2` | h3: Two ways to work with us | 24 | none |
| `body 3` | Aligned teams can join as cells through the [Nonprofit DAO Accelerator](/accelerator/). Communities and organizations outside the network can work with us through our [services](/services/). | 159 | none |
| `body 4` | h3: Projects | 8 | none |
| `body 5` | The three active projects are [All In For Sport](https://allinforsport.org/), DAO Primitives and the Institute for Community Sustainability. All In For Sport is building a network of projects that support community-led initiatives advancing inclusion and empowerment through sport. The Institute for Community Sustainability is based in London, Ontario. | 323 | none |
| `body 6` | Two projects are applicants. [Pacto](https://covenant-gov.github.io/pacto-app/) is private messaging with on-chain proposals, voting and a shared treasury. [Social Lean Canvas](https://socialleancanvas.com/) is a free, open-source tool for designing a social enterprise's business and impact model. | 220 | none |
| `body 7` | h3: What we publish | 15 | none |
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
| `body 1` | We respond personally and try to be useful even when a formal engagement is not the right fit. | 94 | 127 |
| `body 2` | For proposals, partnerships, speaking or a hello, use the form. We reply within a few days. | 91 | 103 |
| `body 3` | [contact@superbenefit.org](mailto:contact@superbenefit.org) | 24 | 24 |
| `cta_label` | (empty) | 0 | none |
| `cta_url` | (empty) | 0 | none |
| `SEO title` | Contact | 7 | 60 |
| `SEO description` | Write to SuperBenefit about a project, a service or joining the Nonprofit DAO Accelerator. We reply within a few days. | 118 | 160 |

`body 1` drops the mockup's opening "SuperBenefit is a small network.", which gives no number (Gaps: how many cells or people). `body 2` keeps the form topics from the mockup and adds the reply time, which says what happens next, within the placeholder's 103. `body 3` is a paragraph holding only the link, so it renders as the aside's arrow link. `cta_label` + `cta_url` are the band's "Book an onboarding call" button, which has no link yet (`brief.md`, Answered 2026-11-20): leave both empty and the button is not shown.

Standard check: who (`intro`: anyone writing about a project, a service or joining as a cell), what they get (`body 1`: a personal reply), what happens next (`body 2`: the form and a reply within a few days; `body 3`: the email address). Cost does not apply to writing to us; what a service costs is on the services page and waits on issue 46, and the accelerator's "No prices" is on its page.

## Closing band (widget area `closing-band`)

One content widget on every page except the error pages: its title is the heading, its first paragraph the text, and the link in its last paragraph the "Join the Discord" button (seed `widgetAreas`). The first button is set per page in code.

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `heading (widget title)` | Tell us what you are working on. | 32 | 32 |
| `text (first paragraph)` | Write to us and we reply within a few days, or join the Discord. | 64 | 69 |
| `button (last paragraph)` | [Join the Discord](https://discord.gg/DMezXT7UAt) | 16 | 16 |

The heading and button are the seed's, unchanged. The text replaces the seed's "We read every message. Write to us, or join the community on Discord." with the reply time, so a visitor knows what happens next. Editors change it in the widget area; the seed is not changed here.

## projects entries (D4, issue #49)

Drafted 2026-11-23. Five `projects` entries, one per project in `brief.md`, Active projects. Fields are the seed's (`seed/seed.json`, collection `projects`). Where they show: the card on `/projects/` and the home selector (`title`, `summary`, `project_status`, `location`, `logo`, `cover`), the project page `/projects/{slug}/` (hero: `logo`, `project_status`, `location`, `title`, `summary`; then `cover`, `body`, and the facts column with `partner` and `website`). `featured` puts a project in the home selector; `order` sorts cards and selector. Slugs are suggestions.

How to read these tables, beyond the notes at the top:
- `summary`: the seed requires it, 60 to 240 characters. The project page's placeholder says about 160; the card and selector placeholders run from 60 to 240.
- `title`: no seed limit; Max is the longest placeholder name ("Institute for Community Sustainability", 38). `location`: "London, Ontario" (15) in the mockups. `partner`: "Partner name, about 40 characters".
- `body` rows follow the project mockup's placeholders: `h2` and `h3` about 40, a paragraph about 340 (the third paragraph about 260), a paragraph with a link about 230, a list item (`li:`) up to 110.
- `project_status`, `website`, `order` and `featured` have no length. `order` puts the three active projects first, then the two applicants, in the brief's order; `featured` is `true` for all five because the brief gives each a feature card. Both are editorial choices, not facts, and an editor may change them.
- Images: `logo` and `cover` are the owner's (`issues.md`, Needs the owner, D4). The seed requires `cover`. Each project lists the images it needs; nothing here describes them.

### All In For Sport (slug `all-in-for-sport`)

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `title` | All In For Sport | 16 | 38 |
| `summary` | A DAO that supports projects advancing inclusion and empowerment through sport. It grew out of Krause House, a DAO formed so fans could own an NBA team together. | 161 | 60 to 240 (seed); about 160 (project page) |
| `project_status` | active | n/a | select |
| `location` | (empty) | 0 | 15 |
| `partner` | Sarreya, Love Futból, Bonito Foundation | 39 | 40 |
| `website` | https://allinforsport.org/ | n/a | none |
| `body 1` | h2: What All In For Sport does | 26 | 40 |
| `body 2` | All In For Sport (AIFS) is a decentralized autonomous organization (DAO) whose mission is to support projects that advance inclusion and empowerment through sport. Its first pilot projects refurbished basketball courts alongside community organizations. The Institute for Community Sustainability in London, Ontario, is its fiscal sponsor. | 339 | 340 |
| `body 3` | h3: With SuperBenefit, 2024 to 2025 | 31 | 40 |
| `body 4` | From August 2024 to March 2025 AIFS took part in SuperBenefit's Reimagining Power Project. From November 2024 to February 2025 its Gatherings series brought 111 participants together, and its governance proposal AIFSIP-04 set it up as a network of autonomous cells. The [case study](https://knowledge.superbenefit.org/docs/rpp/aifs-experiment-case-study) is in the Knowledge Garden. | 308 | 340 |
| `body 5` | h3: Moving grant money to Somaliland | 32 | 40 |
| `body 6` | Through the International Olympic Committee's Tech365 Explore program, AIFS works with Sarreya, a women-led group that connects about 300 women and girls in Hargeisa, Somaliland, through football. A routine grant payment to Sarreya took six months to arrive. | 258 | 340 |
| `body 7` | As of its [update of January 6, 2026](https://allinforsport.org/updates/articles/the-six-month-wire-transfer-and-what/), AIFS was preparing to test stablecoin transfers, meant to move funds in minutes rather than months, and was building treasury management on multi-signature wallets. A stakeholder group that meets monthly and an operational team govern the work, drawing on SuperBenefit's DAO Primitives framework. | 333 | 340 |
| `body 8` | To take part, join the [All In For Sport Discord](https://discord.gg/E3FhRAqsmM) or write through the form at [allinforsport.org](https://allinforsport.org/#contactUs). | 95 | 230 |
| `order` | 1 | n/a | none |
| `featured` | true | n/a | none |

`location`: left empty. The sources name no single place for AIFS; Hargeisa, in its Somaliland work, is Sarreya's city (Gaps). `partner`: the three organizations AIFS names as partners in its update of January 6, 2026; the fourth it names, the Institute for Community Sustainability, has its own entry and is named in `body 2` as fiscal sponsor.

Standard check: who (`summary`, `body 2`: projects in sport for inclusion; `body 6`: Sarreya), what they get (`body 4`, `body 7`), what it costs (no source says; Gaps), what happens next (`body 8`: the AIFS Discord and contact form).

Images needed: logo, cover.

### DAO Primitives (slug `dao-primitives`)

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `title` | DAO Primitives | 14 | 38 |
| `summary` | SuperBenefit's framework for decentralized organization: a pattern language built on small, purpose-led teams with clear mandates, working inside larger coordination structures. | 177 | 60 to 240 (seed); about 160 (project page) |
| `project_status` | active | n/a | select |
| `location` | (empty) | 0 | 15 |
| `partner` | (empty) | 0 | 40 |
| `website` | (empty) | n/a | none |
| `body 1` | h2: What DAO Primitives is | 22 | 40 |
| `body 2` | DAO Primitives is a pattern language for decentralized organization. It starts a group with the smallest structure that works and lets governance grow from what the group actually needs. Its teams are small and purpose-led, each with a clear mandate, and they work inside larger coordination structures. | 303 | 340 |
| `body 3` | h3: Where it has been used | 22 | 40 |
| `body 4` | li: All In For Sport's work with Sarreya in Somaliland ([update of January 6, 2026](https://allinforsport.org/updates/articles/the-six-month-wire-transfer-and-what/)). | 79 | 110 |
| `body 5` | li: Reimagining Power Project case studies on [All In For Sport](https://knowledge.superbenefit.org/docs/rpp/aifs-experiment-case-study) and the [Institute for Community Sustainability](https://knowledge.superbenefit.org/docs/rpp/ics-experiment-case-study). | 106 | 110 |
| `body 6` | To use it with your team, [get in touch](/contact/). | 39 | 230 |
| `order` | 2 | n/a | none |
| `featured` | true | n/a | none |

`location`, `partner` and `website`: left empty. No source gives a place or a partner, and the Knowledge Garden's DAO Primitives pages answered 404 on 2026-11-23 (Gaps). The description comes from All In For Sport's update of January 6, 2026, which names it "SuperBenefit's DAO Primitives framework"; the mockups' card text ("group phase, scale and state") is placeholder and mock data and is not used. `body 6` is a contact link with no further claim.

Standard check: who (teams that use it: `body 4`, `body 5`), what they get (`body 2`), what it costs (no source says; Gaps), what happens next (`body 6`).

Images needed: logo, cover.

### Institute for Community Sustainability (slug `institute-for-community-sustainability`)

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `title` | Institute for Community Sustainability | 38 | 38 |
| `summary` | A London, Ontario nonprofit that runs the London Repair Café, where volunteers help people fix broken things for free, and the Thing Library, which lends tools and other things. | 177 | 60 to 240 (seed); about 160 (project page) |
| `project_status` | active | n/a | select |
| `location` | London, Ontario | 15 | 15 |
| `partner` | London Public Library | 21 | 40 |
| `website` | https://communitysustainability.ca/ | n/a | none |
| `body 1` | h2: What the Institute does | 23 | 40 |
| `body 2` | The Institute for Community Sustainability (ICS) is a federal not-for-profit headquartered in London, Ontario. Its Repair Café runs with London Public Library at branches across the city: bring something broken and fix it with a volunteer, for free. | 249 | 340 |
| `body 3` | The Thing Library at 206 Piccadilly St lends tools, kitchen gear, garden tools and more, on Fridays from 10 a.m. to 6 p.m. and Saturdays from 10 a.m. to 4 p.m. | 159 | 340 |
| `body 4` | ICS is a founding organization of Earthfest London and the fiscal sponsor of All In For Sport. It helped build Open Council, a civic transparency platform, and GreenPill London, Canada's first GreenPill Network chapter. | 219 | 340 |
| `body 5` | h3: With SuperBenefit, January to July 2025 | 39 | 40 |
| `body 6` | As part of SuperBenefit's Reimagining Power Project, ICS set up a multisignature wallet with 4 signers, the ENS name theics.eth, roles in Hats Protocol, and Snapshot and CharmVerse spaces. Four core team members use them. Its Gitcoin Grants Round 23 campaign ranked in the top 10%. The [case study](https://knowledge.superbenefit.org/docs/rpp/ics-experiment-case-study) is in the Knowledge Garden. | 324 | 340 |
| `body 7` | To fix something, register at [londonrepaircafe.ca](https://londonrepaircafe.ca). To volunteer, host a Repair Café or fund the work, write to [info@communitysustainability.ca](mailto:info@communitysustainability.ca). | 143 | 230 |
| `order` | 3 | n/a | none |
| `featured` | true | n/a | none |

`partner`: London Public Library, which the ICS site names as the Repair Café's partner ("It runs with London Public Library, at branches across the city"). `website`: the ICS site, the domain of the contact address in the Knowledge Garden case study (info@communitysustainability.ca). The site's event dates are left out: they change.

Standard check: who (`summary`: people in London, Ontario), what they get (`body 2`, `body 3`), what it costs (`body 2`: the Repair Café is free; the Thing Library's terms are not given, Gaps), what happens next (`body 7`).

Images needed: logo, cover.

### Pacto (slug `pacto`)

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `title` | Pacto | 5 | 38 |
| `summary` | Private messaging with on-chain proposals, voting and a shared treasury, so a community runs its own group. Available for macOS, Linux and Windows, with the source on GitHub. | 174 | 60 to 240 (seed); about 160 (project page) |
| `project_status` | applicant | n/a | select |
| `location` | (empty) | 0 | 15 |
| `partner` | (empty) | 0 | 40 |
| `website` | https://covenant-gov.github.io/pacto-app/ | n/a | none |
| `body 1` | h2: What Pacto is | 13 | 40 |
| `body 2` | Pacto is a communication tool for communities: encrypted chat, with proposals, votes and a shared treasury recorded on chain. Messages travel over Nostr, a decentralized social network. Roles, decisions and shared funds settle on Ethereum. In the Pacto app one recovery phrase gives each member both keys, and each key signs for the other. | 339 | 340 |
| `body 3` | h3: How its governance works | 24 | 40 |
| `body 4` | Governance uses Hats Protocol and starts with a captain, who picks the crew. Both can make proposals. The crew votes by quorum on proposals and the treasury; the captain can approve or veto. The crew can also replace the captain by mutiny. | 239 | 260 |
| `body 5` | Pacto is an applicant to SuperBenefit. [Download Pacto](https://covenant-gov.github.io/pacto-app/#download) or read the source at [github.com/covenant-gov/pacto-app](https://github.com/covenant-gov/pacto-app). | 110 | 230 |
| `order` | 4 | n/a | none |
| `featured` | true | n/a | none |

`location` and `partner`: left empty; the site names no place, no partner and no people (Gaps). The mockups show Pacto as "Pending" with an initial for its logo; the seed's status is `applicant` (`brief.md`, Answered 2026-11-20).

Standard check: who (`summary`: communities), what they get (`body 2`, `body 4`), what it costs (the site gives no price; Gaps), what happens next (`body 5`: download or source).

Images needed: logo, cover.

### Social Lean Canvas (slug `social-lean-canvas`)

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `title` | Social Lean Canvas | 18 | 38 |
| `summary` | A free, open-source canvas for turning a purpose-driven venture idea into a testable business and impact model on one page. Created in 2013 by Rowan Yeoman, Dave Moskovitz and the Ākina Foundation. | 197 | 60 to 240 (seed); about 160 (project page) |
| `project_status` | applicant | n/a | select |
| `location` | (empty) | 0 | 15 |
| `partner` | (empty) | 0 | 40 |
| `website` | https://socialleancanvas.com/ | n/a | none |
| `body 1` | h2: What the Social Lean Canvas is | 30 | 40 |
| `body 2` | The Social Lean Canvas splits a purpose-driven venture into parts that can be worked on separately and fitted together into one business model. It builds on Alexander Osterwalder's Business Model Canvas and Ash Maurya's Lean Canvas. | 232 | 340 |
| `body 3` | Its site says thousands of social entrepreneurs, universities, investors, accelerators and incubators have used it since 2013. | 126 | 340 |
| `body 4` | h3: What it costs | 13 | 40 |
| `body 5` | The canvas is shared under the Creative Commons Attribution-ShareAlike 3.0 Unported licence, and the online SLC Mini Accelerator is free. Rowan Yeoman, its co-creator and founder, also works with ventures and with organizations that run support programs. | 254 | 260 |
| `body 6` | The Social Lean Canvas is an applicant to SuperBenefit. Start with the [SLC Mini Accelerator](https://programs.socialleancanvas.com/) or write to [hello@socialleancanvas.com](mailto:hello@socialleancanvas.com). | 131 | 230 |
| `order` | 5 | n/a | none |
| `featured` | true | n/a | none |

`location` and `partner`: left empty. The site names its creators (in `summary`) but no place and no partner (Gaps).

Standard check: who (`summary`, `body 3`: purpose-driven ventures and those who support them), what they get (`body 2`), what it costs (`body 5`: the canvas and Mini Accelerator are free; Rowan Yeoman's paid support has no price on the site, Gaps), what happens next (`body 6`).

Images needed: logo, cover.

## supports entries (D4, issue #49)

Drafted 2026-11-23. Four `supports` entries, shown as the blocks under "Supports" on `/accelerator/` (`title` as the heading, `summary` as the lead line, `body` below it) and, by `title` only, in the home page's accelerator panel. Fields are the seed's (collection `supports`: `title`, `summary`, `body`, `order`); the seed sets no lengths. Max is the longest text in the same place across the four blocks of `mockups/pages/accelerator.html` (heading 21, lead 64, body 171). The four names are the same in the accelerator mockup, `origin/main:src/components/InternalServices.astro`, `origin/main:src/pages/support/index.astro` and on https://superbenefit.org/ (read 2026-11-23); every claim below is from those four, and "the SuperBenefit network" is from the `support/index.astro` subtitle. `brief.md` lists the supports differently (Gaps).

The section note beside the heading ("Peer support between cells. No prices.") is the `accelerator` entry's `cost_summary` (D3) and answers what each support costs; the band's "Talk to us about joining" button says what happens next.

### People to work with

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `title` | People to work with | 19 | 21 |
| `summary` | Find the people your project needs to keep moving. | 50 | 64 |
| `body` | Facilitators and stewards from across the SuperBenefit network can step in to help with coordination and decisions, and contributors with ongoing work. | 151 | 171 |
| `order` | 1 | n/a | none |

### Shared infrastructure

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `title` | Shared infrastructure | 21 | 21 |
| `summary` | Use the infrastructure other projects already depend on. | 56 | 64 |
| `body` | SuperBenefit's DAO, shared tooling, documentation templates and patterns you can adapt. A cell keeps what it makes and contributes back what it builds. | 151 | 171 |
| `order` | 2 | n/a | none |

### Funding support

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `title` | Funding support | 15 | 21 |
| `summary` | Apply for grants with input from people who have done it before. | 64 | 64 |
| `body` | Work on grant applications with other SuperBenefit cells and connect with the network's fiscal hosts, who can move funds where needed. Cells share reporting approaches. | 168 | 171 |
| `order` | 3 | n/a | none |

### Admin and paperwork

| Field | Draft | Chars | Max |
| --- | --- | --- | --- |
| `title` | Admin and paperwork | 19 | 21 |
| `summary` | Use our DAO and existing entity arrangements when you need them. | 64 | 64 |
| `body` | SuperBenefit helps with the admin and filings that keep a project running, so a cell does not have to set up its own back office. | 129 | 171 |
| `order` | 4 | n/a | none |

Standard check (all four): who (cells; `accelerator` `eyebrow`), what they get (`summary` and `body`), what it costs (the section note: no prices), what happens next (the band's button). The mockup's "Take what you need, contribute what you build, and keep what you make." is cut to two clauses in Shared infrastructure, and People to work with lists two roles per clause, to keep rhythm triplets out; the Social Lean Canvas `body 2` drops its "its customers, its impact and its economics" for the same reason.

## services entries (D4)

Not drafted: the `services` entries wait on issue 46 (the owner's new offerings and their terms, `issues.md`, D1).

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
| A team can bring its own organization or use SuperBenefit's DAO, and can leave at any time ("Bring your own organization, anchor in our DAO, or pass through. Leave anytime."; "Use our DAO and existing entity arrangements when you need them.") | `origin/main:src/components/InternalServices.astro`; `docs/relaunch/mockups/pages/accelerator.html` | 2026-11-23 |
| Cells are small, self-directed teams working on shared problems, each in charge of its own funds and decisions | `docs/relaunch/mockups/pages/home.html`, `about.html`; `origin/main:src/pages/support/index.astro` | 2026-11-23 |
| SuperBenefit is a worker self-directed nonprofit ("a Worker Self-Directed Non-Profit Digital LLC") | https://superbenefit.org/ (footer); `docs/relaunch/mockups/pages/about.html` | 2026-11-23 |
| "Let's make better faster, together." | `origin/main:src/components/Hero.astro`; https://superbenefit.org/ | 2026-11-23 |
| Five projects: All In For Sport, DAO Primitives and the Institute for Community Sustainability active; Pacto and Social Lean Canvas applicants | `docs/relaunch/brief.md`, Active projects; `docs/relaunch/issues.md`, Answered by the owner (2026-11-21) | 2026-11-23 |
| The Institute for Community Sustainability is in London, Ontario | `docs/relaunch/brief.md`, Active projects | 2026-11-23 |
| All In For Sport is building a network of projects that support community-led initiatives advancing inclusion and empowerment through sport | https://allinforsport.org/ | 2026-11-23 |
| Pacto is private messaging with on-chain proposals, voting and a shared treasury | https://covenant-gov.github.io/pacto-app/ | 2026-11-23 |
| Social Lean Canvas is free and open source, for designing a social enterprise's business and impact model | https://socialleancanvas.com/ | 2026-11-23 |
| The Knowledge Garden holds Reimagining Power Project pages on All In For Sport, the Equality Fund and the Institute for Community Sustainability | https://knowledge.superbenefit.org/docs | 2026-11-23 |
| "We respond personally and try to be useful even when a formal engagement is not the right fit"; the form for proposals, partnerships, speaking or hello | `origin/main:src/pages/contact.astro`; `docs/relaunch/mockups/pages/contact.html` | 2026-11-23 |
| We reply within a few days | `origin/main:src/pages/contact.astro` (success message: "We'll be in touch within a few days.") | 2026-11-23 |
| contact@superbenefit.org | `origin/main:src/pages/contact.astro`; `docs/relaunch/mockups/pages/contact.html` | 2026-11-23 |
| Discord invite https://discord.gg/DMezXT7UAt | `docs/relaunch/brief.md`, Answered (2026-11-20); `seed/seed.json` | 2026-11-23 |
| "Book an onboarding call" has no link; the button is hidden until an editor adds one | `docs/relaunch/brief.md`, Answered (2026-11-20) | 2026-11-23 |
| D4, All In For Sport: a DAO whose mission is to support projects that advance inclusion and empowerment through sport | https://allinforsport.org/about/; https://allinforsport.org/ | 2026-11-23 |
| D4, All In For Sport: grew out of Krause House, a DAO formed so fans could collectively own an NBA team | https://allinforsport.org/about/; https://allinforsport.org/updates/articles/the-six-month-wire-transfer-and-what/ | 2026-11-23 |
| D4, All In For Sport: first pilot projects refurbished basketball courts alongside community organizations | https://allinforsport.org/about/ | 2026-11-23 |
| D4, All In For Sport: the Institute for Community Sustainability is its fiscal sponsor | https://communitysustainability.ca/ | 2026-11-23 |
| D4, All In For Sport: partners Sarreya, Love Futból, Bonito Foundation (and the Institute for Community Sustainability) | https://allinforsport.org/updates/articles/the-six-month-wire-transfer-and-what/ | 2026-11-23 |
| D4, All In For Sport: in the Reimagining Power Project August 2024 to March 2025; Gatherings, November 2024 to February 2025, with 111 participants; AIFSIP-04 set up autonomous cells | https://knowledge.superbenefit.org/docs/rpp/aifs-experiment-case-study | 2026-11-23 |
| D4, All In For Sport: Tech365 Explore program of the International Olympic Committee; Sarreya, women-led, about 300 women and girls in Hargeisa, Somaliland, football; a grant payment took six months | https://allinforsport.org/updates/articles/the-six-month-wire-transfer-and-what/ | 2026-11-23 |
| D4, All In For Sport: preparing to test stablecoin transfers, meant to move funds in minutes rather than months; building treasury management on multi-signature wallets; a stakeholder group meeting monthly and an operational team, drawing on SuperBenefit's DAO Primitives framework | https://allinforsport.org/updates/articles/the-six-month-wire-transfer-and-what/ | 2026-11-23 |
| D4, All In For Sport: Discord https://discord.gg/E3FhRAqsmM and the contact form at /#contactUs | https://allinforsport.org/ | 2026-11-23 |
| D4, DAO Primitives: SuperBenefit's framework; a pattern language for decentralized organization; small, purpose-led teams with clear mandates inside larger coordination structures; starts with the minimum viable structure and lets governance emerge from needs | https://allinforsport.org/updates/articles/the-six-month-wire-transfer-and-what/ | 2026-11-23 |
| D4, DAO Primitives: listed as the framework informing or applied in the AIFS and ICS case studies | https://knowledge.superbenefit.org/docs/rpp/aifs-experiment-case-study; https://knowledge.superbenefit.org/docs/rpp/ics-experiment-case-study | 2026-11-23 |
| D4, ICS: a London, Ontario nonprofit running the London Repair Café and the Thing Library; Repair Café free, with London Public Library at branches across the city | https://communitysustainability.ca/ | 2026-11-23 |
| D4, ICS: federal not-for-profit headquartered in London, Ontario | https://knowledge.superbenefit.org/docs/rpp/ics-experiment-case-study | 2026-11-23 |
| D4, ICS: Thing Library at 206 Piccadilly St, lends tools, kitchen gear, garden tools and more; Fridays 10 a.m. to 6 p.m., Saturdays 10 a.m. to 4 p.m. | https://communitysustainability.ca/ | 2026-11-23 |
| D4, ICS: founding organization of Earthfest London; helped build Open Council (civic transparency platform) and GreenPill London (Canada's first GreenPill Network chapter) | https://communitysustainability.ca/ | 2026-11-23 |
| D4, ICS: January to July 2025 in the Reimagining Power Project; multisig with 4 signers; theics.eth; Hats Protocol roles; Snapshot and CharmVerse; four core team members use them; Gitcoin Grants Round 23 top 10% | https://knowledge.superbenefit.org/docs/rpp/ics-experiment-case-study | 2026-11-23 |
| D4, ICS: register at londonrepaircafe.ca; volunteer, host a Repair Café or fund the work; info@communitysustainability.ca | https://communitysustainability.ca/; https://knowledge.superbenefit.org/docs/rpp/ics-experiment-case-study | 2026-11-23 |
| D4, Pacto: private messaging with on-chain proposals, voting and a shared treasury; you run the group; available for macOS, Linux and Windows; source on GitHub | https://covenant-gov.github.io/pacto-app/ | 2026-11-23 |
| D4, Pacto: messages over Nostr; roles, decisions and shared assets on Ethereum; one recovery phrase for both keys; each key signs the other | https://covenant-gov.github.io/pacto-app/how-it-works/ | 2026-11-23 |
| D4, Pacto: Hats Protocol; captain picks the crew; both propose; crew votes by quorum on proposals and treasury; captain approves or vetoes; crew can mutiny the captain | https://covenant-gov.github.io/pacto-app/how-it-works/ | 2026-11-23 |
| D4, Pacto and Social Lean Canvas are applicants | `docs/relaunch/brief.md`, Active projects and Answered (2026-11-20) | 2026-11-23 |
| D4, Social Lean Canvas: free and open source; idea to testable business model on one page; pieces worked on independently and fitted into one model; builds on the Business Model Canvas and the Lean Canvas; created 2013 by Rowan Yeoman, Dave Moskovitz and the Ākina Foundation; CC BY-SA 3.0 Unported; SLC Mini Accelerator online and free; Rowan Yeoman works with ventures and support programs; hello@socialleancanvas.com | https://socialleancanvas.com/ | 2026-11-23 |
| D4, Social Lean Canvas: used since 2013 by thousands of social entrepreneurs, universities, investors, accelerators and incubators | https://socialleancanvas.com/about/ | 2026-11-23 |
| D4, supports: the four names, their lead lines and bodies (people, shared infrastructure, funding support, admin and paperwork) | `docs/relaunch/mockups/pages/accelerator.html`; `origin/main:src/components/InternalServices.astro`; `origin/main:src/pages/support/index.astro`; https://superbenefit.org/ | 2026-11-23 |
| D4, the project and support field names, required fields and the summary's 60 to 240 characters | `seed/seed.json` | 2026-11-23 |

D4 also read, with no claim taken from them: https://knowledge.superbenefit.org/docs (lists a DAO Primitives folder whose pages answer 404). Could not read (404 on 2026-11-23): https://knowledge.superbenefit.org/docs/dao-primitives/, `/dao-primitives`, `/docs/dao-primitives/primitives-framework`, `/implementation`, `/articles`, `/docs/reimagining-power-project/`, `/artifacts/`, and `docs/dao-primitives/index.md` in the `superbenefit/knowledge-garden` repository on GitHub (raw file, 404).

Also read, with no claim taken from them: https://superbenefit.org/about/ (a "Coming soon" page), https://knowledge.superbenefit.org/, https://knowledge.superbenefit.org/article/reimagining-power-how-web3-can-transform-impact, and on `origin/main` `src/pages/index.astro`, `about.astro`, `projects.astro`, `src/components/MissionStatement.astro`, `ExternalServices.astro`, `CallToAction.astro`, `KnowledgeSpotlight.astro`. Their wording mostly uses phrases the content standard rules out. Every site above answered 200 when fetched.

## Gaps

Facts the copy needs that no source gives. Each is left out of the drafts.

- The new service offerings and their terms (issue 46): the `services` entries, the home panel's "What you get" list and the `services` entry's `cost_summary`. Until then the services page and panel say nothing about price.
- A link for "Book an onboarding call": the `accelerator` hero button and the contact band's outline button stay empty.
- What the Institute for Community Sustainability does: answered for D4 (its site, https://communitysustainability.ca/, and the Knowledge Garden case study, read 2026-11-23; see the ICS entry). The D3 about body still says only where it is; the human edit may add a clause from the ICS entry.
- What DAO Primitives is, and a public page for it (D4: what it is now comes from All In For Sport's update of January 6, 2026; a public page is still missing): the only descriptions are the mockups' placeholder summary and `origin/main:src/data/mock-projects.json` (mock data), so the about body gives only its name. The Knowledge Garden's `/docs` index lists a "dao primitives" folder (`/docs/dao-primitives/articles`, `/implementation`, `/primitives-framework`), but each of those links answered 404 on 2026-11-23.
- Who runs each of the five projects, and how each relates to SuperBenefit or its cells beyond its status (active or applicant): the projects `intro` gives only the status.
- What Pacto and Social Lean Canvas are applying for or to (the sources say only "applicant"), and when they applied.
- How many cells or people SuperBenefit has, when it was founded, where its LLC is registered and who runs it: the about page would be more specific with them.
- A quote with a named source for the about page's quote section (not built, C8 notes).
- The project pages' slugs: the about body links projects to their own sites, not to `/projects/{slug}/`, since no entry exists yet.

D4 gaps (projects and supports):
- `location` for All In For Sport, DAO Primitives, Pacto and Social Lean Canvas: no source gives one place for each.
- `partner` for DAO Primitives, Pacto and Social Lean Canvas: no source names one. Also undefined: whether `partner` names one organization or several, and whose partner (the project's, or SuperBenefit's in the project). The drafts use the project's own partners (All In For Sport, Institute for Community Sustainability).
- `website` for DAO Primitives: no page answers. The Knowledge Garden's DAO Primitives links answered 404 on 2026-11-23.
- Who runs Pacto: its site names no person or organization (the source is on GitHub under `covenant-gov`).
- What taking part in each project costs: no source gives a cost for joining All In For Sport, using DAO Primitives or using Pacto; the Thing Library's membership terms; the price of Rowan Yeoman's support for Social Lean Canvas users.
- Logos, covers and their alt text for all five projects: the owner's (`issues.md`, Needs the owner, D4). Every project needs a logo and a cover.
- The `services` entries: wait on issue 46.
- The supports' number and names: `brief.md` (Accelerator/supports vs services) lists three, "peer support: organizing, admin support, shared infrastructure": "organizing" where the mockup and `origin/main` say "People to work with", and no Funding support. The mockup, `origin/main` (`InternalServices.astro`, `support/index.astro`) and superbenefit.org name four. The drafts keep the four, each sourced; the owner should say whether Funding support stays and which name the first one takes.
- Specifics for the supports' bodies: the only name in People to work with, Funding support and Admin and paperwork is SuperBenefit. No source gives how many facilitators or stewards there are, which fiscal hosts, which filings or which entity arrangements, so these three bodies still fall short of the content standard's name, number, date, place or link. The human edit should add them, or leave `body` empty (the seed does not require it).
- How many gatherings All In For Sport held: its case study says six in its Executive Summary and Implementation sections and "Five completed gatherings" in its outcomes. `body 4` gives the dates and the 111 participants only.
- Whether All In For Sport has moved funds by stablecoin: its update of January 6, 2026 says it was "preparing to test actual fund transfers in the coming weeks"; no later source read gives a result.
