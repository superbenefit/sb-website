# Design session prompt (used; mockups received 2026-11-21)

Kept as a record of what the design session was asked. The result is in `mockups/`, and the mockups, not this prompt, are the design instructions.

Correction: this prompt told the design session "no carousels". That was not an owner requirement and should not have been in it. The owner's design includes an auto-advancing project selector on the home page, and it is built as designed.

---

You are designing the relaunch of superbenefit.org. This session produces mockups and a short spec, not production code.

## Read first
1. `superbenefit/design-system`: the source of truth for tokens, type, colour and components. If it conflicts with anything below, the design system wins; list each conflict in your notes.
2. In `superbenefit/sb-website`, branch `feature/relaunch`: `docs/relaunch/brief.md` (goal, messaging, content standard) and `docs/relaunch/architecture.md` (pages and content model).
3. The current site at https://superbenefit.org, and `src/styles/global.css` and `src/styles/animations.css` in `sb-website`, for what exists today. The current styling predates the design system and is being replaced.

## What the site is for
Two audiences, each with one page that says who it is for, what they get, what it costs and what happens next:
- **Aligned teams** who want to join as cells: the Nonprofit DAO Accelerator, at `/accelerator/`. Peer support, no prices.
- **Communities and organizations** who need help with their data, infrastructure and local technology: Services, at `/services/`. Deliverables and terms.

## Pages to mock up
Every page at 390 px and 1440 px wide. Content comes from a CMS (EmDash), so each element below is a field an editor fills in. Design for the real range of each field, not for one ideal length.

| Page | Shows |
| --- | --- |
| Home `/` | Page title (the one `<h1>`), intro, call to action. Entry points to Accelerator and Services. Feature cards for up to 4 projects. The 3 latest updates. |
| Accelerator `/accelerator/` | Page title, intro, body, call to action. A list of supports: each has title, summary, body. |
| Services `/services/` | Page title, intro, body, call to action. A list of services: each has title, audience (who it is for), deliverable, terms (price or SLA), body. |
| Projects `/projects/` | Page title, intro. A card for every project. |
| Project `/projects/{slug}/` | Title, summary, status (active, pending or past), partner, location, website link, logo, cover image, body. Related updates. |
| Updates `/updates/` | Page title, intro. A paginated list of update cards. |
| Update `/updates/{slug}/` | Title, date, author, excerpt, cover image, body, linked project. |
| About `/about/` | Page title, intro, body, call to action. |
| Contact `/contact/` | Page title, intro. Form with name, email, subject, message, a Cloudflare Turnstile widget, submit. |
| Not found and server error | Short message and a way back. |

## Components to design, with states
- **Header and navigation**: links come from a CMS menu, so allow 4 to 7 items. Desktop, mobile menu open and closed, current-page state, keyboard focus.
- **Footer**: menu links, social links, legal line "SuperBenefit, a Worker Self-Directed Non-Profit Digital LLC" (keep this wording), "Built on Ethereum" badge.
- **Page hero**: title and intro, with and without a call to action.
- **Project card**: logo, title, summary, status. With and without a logo. Summary from 60 to 240 characters.
- **Service item** and **support item**: the fields listed above. These are list items on a page, not cards that link to a detail page.
- **Update card**: cover image, title, date, excerpt, linked project. With and without a cover image.
- **Call to action**: label and link. Primary and secondary.
- **Rich text body** (used on every page): headings level 2 to 4, paragraphs, links, ordered and unordered lists, block quote with attribution, image with caption, code, table, embedded video. Editors control this content, so every element needs a style.
- **Contact form**: default, focus, field error, submitting, success message, server error message. The Turnstile widget is a fixed third-party box at least 300 × 65 px; leave room for it and do not restyle it.
- **Status and empty states**: a project marked "pending", an updates list with no entries, a project with no related updates.

## Constraints
- **Tokens**: use the design system's tokens only. If a design needs a value that has no token, propose the token by name and value in your notes instead of using a one-off value.
- **Accessibility**: WCAG 2.2 AA. Text contrast at least 4.5:1 (3:1 for large text). Visible keyboard focus on every interactive element. Pointer targets at least 24 × 24 px. One `<h1>` per page and no skipped heading levels. Nothing conveyed by colour alone, including project status. Every image has an alt text field.
- **Motion**: CSS only. No JavaScript animation libraries. Scroll-driven effects use CSS `animation-timeline`, must degrade to a static page where it is unsupported, and must be off under `prefers-reduced-motion`.
- **Performance**: at most two font families. No autoplaying video, no background video. Every image has a fixed aspect ratio so the page does not shift while loading. Above-the-fold content must be readable without JavaScript.
- **Breakpoints**: 480, 768 and 1024 px, unless the design system defines its own.
- **Caching**: pages are cached and shared between visitors. Do not design anything that differs per visitor, such as greetings, "recently viewed" or personalised recommendations.
- **Content standard** (from `brief.md`): no values grids, no unattributed pull quotes, no decorative statistics. Do not design sections that only work with marketing filler.

## Placeholder content
Use the four real projects for cards: All In For Sport, DAO Primitives, Pacto (status: pending), Institute for Community Sustainability (London, Ontario). For everything else, label placeholders with the field name and a realistic length, for example "Service title, about 40 characters". Do not write final copy; copy is written and edited separately.

## What to return
1. Mockups for every page above at both widths, plus the mobile menu open.
2. A component sheet showing each component in each state listed.
3. A notes file with: the tokens each component uses; any tokens you propose adding; any conflict between the design system and this prompt; any field in the content model that the design does not use, or any element in the design that has no field.
4. Open questions for the owner, as a short list.

Stop when these are delivered. Do not start building pages.
