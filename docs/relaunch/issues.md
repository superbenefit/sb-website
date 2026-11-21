# Stage 4: issue list (2026-11-21)

Approved by the owner on 2026-11-21 and created on GitHub as superbenefit/sb-website issues 23 to 54, in this order (A1 is 23, E3 is 54). Each item is one outcome.

- **Sizes:** S is under half a day, M about a day, L two to three days.
- **Every code issue** is one branch and one PR into `feature/relaunch`. It closes when `npm run check` and `npm run build` pass and the Workers Builds preview shows the stated result.
- **Design:** page and component issues are built to match `mockups/`. Read `mockups/README.md` first.

## Needs the owner
Four things only a person can do or provide. Agents do not change Cloudflare domain or Access settings.

| # | What is needed | Why | Blocks |
| --- | --- | --- | --- |
| A5 | Protect this Worker's previews with Cloudflare Access (Previews only). The preview secrets are already set. | Previews on `superbenefit.dev` are public and indexable (checked 2026-11-21). The owner's first attempt in the dashboard failed with `access.api.error.conflict: a cloudflare connection already exists`. | must be done before B2 |
| B3 | An Access application for `superbenefit.org/_emdash/*` with a policy for GitHub org members. The AUD tag of that application as the production secret `CF_ACCESS_AUDIENCE`, and the AUD tag of the previews application (A5) as the preview base secret of the same name. The Zero Trust team domain. | CMS sign-in goes through Access. The GitHub identity provider already exists. | B4 |
| D1 | The new service offerings: for each, a title, who it is for, what they get (a short list), and terms. | The owner is redoing the offerings. The three in the mockups are real but will be replaced. | D3, D4 |
| D4 | Logos, cover images and alt text for the five projects. | The mockups use labelled placeholders. | D4 |

Also needed later, with no decision involved: a human edit of all copy (D3), and Web Analytics and Search Console setup at launch (D6).

## Staging resources for previews (created 2026-11-21)
Created at the owner's request. All previews share them. They go in the `previews` block of `wrangler.jsonc` when EmDash is installed (B2).

| Binding | Kind | Name | ID |
| --- | --- | --- | --- |
| `DB` | D1 database | `sb-website-staging` | `5237a837-fbba-4c56-9abd-cee85a5d7ee2` |
| `MEDIA` | R2 bucket | `sb-website-media-staging` | bound by name |
| `SESSION` | KV namespace | `sb-website-staging-session` | `b6146e12bb6f472ab6960d3735cf109a` |

## Answered by the owner (2026-11-21)
- **Services:** the three in the mockups are real; the owner is redoing the offerings (D1).
- **Projects:** five. All In For Sport, DAO Primitives and the Institute for Community Sustainability are active. [Pacto](https://covenant-gov.github.io/pacto-app/) and [Social Lean Canvas](https://socialleancanvas.com/) are applicants. Status values are active, applicant and past.
- **Discord:** `https://discord.gg/DMezXT7UAt` everywhere. Already changed in the current code.
- **AI crawlers:** block training, allow all other bots. In EmDash this is the "Disallow AI training" setting, on.
- **Other Workers:** `docs` and `sb-auth` are for later and out of scope. `regen-toolkit` and `slc-advisor` have moved elsewhere.
- **Previews:** the Worker is on Worker Previews, served at `<branch-name>.superbenefit.dev`. Previews use one shared staging database, bucket and session namespace, as Cloudflare's and EmDash's docs require. An earlier answer of "no preview resources" was given when the plan still assumed the legacy preview model; it does not apply to Worker Previews.
- **GitHub sign-in:** the GitHub OAuth app and the Zero Trust identity provider already exist.
- **Done by the owner in the dashboard (checked 2026-11-21):** HSTS is on (`max-age=15552000`); `superbenefit.dev` is the preview domain, so a branch preview is served at `<branch-name>.superbenefit.dev`; the preview hostname is allowed on the Turnstile widget. R2 is enabled on the account.

## Decided, no input needed
- The home page project selector is built as designed: it advances every 7 seconds with pause, previous and next. See `mockups/README.md`.
- www.superbenefit.org returns 301 to the apex and keeps the path (checked 2026-11-21; it returned 522 on 2026-11-20). Nothing left to do.
- The X handle stays `SuperBenefitDAO`, as on the current site.
- "Book an onboarding call" has no URL. Its link is a CMS field, and the button is not rendered while the field is empty.
- Pacto and Social Lean Canvas summaries are drafted from each project's own site and edited by a person with the rest of the copy (D3, D4).
- States the mockups do not show (form error, submitting, success, server error; empty lists) are built from the mockup tokens and components, and shown on the branch preview for review.
- The home page headings differ between the 1440 and 390 px mockups. Copy is settled in D3; the layout is the same.

## A. Hygiene and security
| # | Outcome | Accept when | Depends on | Size |
| --- | --- | --- | --- | --- |
| A1 | Every PR is checked. GitHub Actions runs `npm ci`, `npm run check`, `npm run build`, `npm audit --omit=dev`; Dependabot opens weekly npm updates. | A PR with a type error fails the check. A Dependabot PR appears. | none | S |
| A2 | `compatibility_date` is current. | Preview build passes; contact form sends on the preview with test keys. | none | S |
| A3 | Contact action is hardened: CR/LF rejected in subject and name, visitors see a generic message on server faults, a `ratelimits` binding limits posts per IP. | A subject with a line break returns a field error. An unset secret shows the generic message and logs the detail. Repeated posts from one IP are refused. | none | M |
| A4 | Internal links use the trailing-slash form and `trailingSlash: 'always'` is set. `www.allinforsport.org` links point at the apex. | No internal link on the preview returns 307. | none | S |
| A5 | Owner: previews are behind Access. (Preview secrets: done.) | A signed-out visit to a preview URL asks for sign-in. A test message sends from the contact form on a preview. | none | Owner |

## B. CMS
| # | Outcome | Accept when | Depends on | Size |
| --- | --- | --- | --- | --- |
| B1 | Done 2026-11-21: the three staging resources exist. IDs are in the table above. | Done. | none | Done |
| B2 | EmDash is installed exactly as [Deploy to Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/) describes: production bindings by name at the top level, and the `previews` block binding `DB`, `MEDIA` and `SESSION` to the staging resources by ID. Conflicting settings are removed (list in `architecture.md`). | Branch preview at `<branch-name>.superbenefit.dev`: a public page renders, `/_emdash/admin` shows setup, an uploaded image displays. Setup completes on the staging database without `EMDASH_SITE_URL` on the preview, or the Preview command passes it (see `architecture.md`, Site URL for the CMS). | A5, B1 | L |
| B3 | Owner: see "Needs the owner". | Values posted; visiting `/_emdash/admin` signed out redirects to GitHub. | B2 | Owner |
| B4 | Admin sign-in goes through Access with `defaultRole: 20` and `roleMapping: { "Web Admins": 50 }`. | An org member signs in as Contributor. A "Web Admins" member signs in as Admin. If the team name arrives in another form, the mapping key is corrected and the form recorded in `architecture.md`. | B3 | M |
| B5 | The content model exists: five collections, the closing-band widget area and three menus, from `seed/seed.json`. | The admin shows all five content types with the fields in `architecture.md`. | B2 | M |
| B6 | Workers Cache is on, with one route rule per public route tagged by collection. | A second request to a page is a cache hit. Publishing an edit shows on the public page within a minute. A draft preview link shows unpublished content. | B5, C1 | M |
| B7 | Legacy content code is gone: both loaders, mock JSON, `content.config.ts`, `sanitize.ts`, draft-gating flags, `@astrojs/sitemap`, `public/robots.txt`. | `/sitemap.xml` and `/robots.txt` come from EmDash. No mock titles in any page. | C3 to C9 | S |

## C. Pages (built to `mockups/`)
| # | Outcome | Mockup | Accept when | Depends on | Size |
| --- | --- | --- | --- | --- | --- |
| C1 | Base layout and shared parts: new tokens, header, mobile menu, stripe, footer with both menus, closing band, buttons, status badge, page hero, wave divider. Head tags and JSON-LD come from `<EmDashHead>`. | every page; `mobile-menu-open` | Header, footer and band match at 390 and 1440 px. Menu edits in the admin show on the site. No `set:html` JSON-LD remains. | B5 | L |
| C2 | Rich text renders every element: headings, lists, quote with attribution, image with caption, inline and block code, table, click-to-load video. | `update` | A test entry using every element matches at both widths. No request goes to the video host before play is pressed. | C1 | M |
| C3 | Home page, including the project selector exactly as specified in `mockups/README.md`, with five projects. | `home` | Matches at both widths. One `<h1>`. Selector behaviour matches each point in the README. With JavaScript off, the first project shows and all are reachable. | C1 | L |
| C4 | Accelerator page at `/accelerator/`; `/support` and `/supports` redirect to it. | `accelerator` | Matches. Both old paths return 301. | C1 | S |
| C5 | Services page with deliverables lists and terms. | `services` | Matches with three services. | C1 | M |
| C6 | Projects index and project page, with status, optional logo and related updates. | `projects`, `project` | Match. A project with no logo and one with no updates render cleanly. | C1, C2 | M |
| C7 | Updates index with pagination; update page with author, date and linked project. | `updates`, `update` | Match. An empty list shows a message. | C1, C2 | M |
| C8 | About page. | `about` | Matches. | C1, C2 | S |
| C9 | Contact page in the new design, keeping explicit Turnstile rendering. | `contact` | Matches. The five navigation scenarios from PR #18 pass. Error, submitting and success states are shown in the PR. | C1 | M |
| C10 | Not-found and server-error pages; correct `manifest.json` icons and favicon. | `not-found`, `server-error` | Unknown URL returns 404 with the mockup page. Manifest icons are square at their declared sizes. | C1 | S |
| C11 | Accessibility pass on all pages. | all | Automated axe scan has no violations at either width; a keyboard walk-through reaches every control with visible focus. | C3 to C10 | M |

"Matches" means: side by side with `mockups/screenshots/{page}-1440.jpg` and `-390.jpg`, layout, spacing, type and colour agree, using the values in `mockups/mockups.css`.

## D. Content and launch
| # | Outcome | Accept when | Depends on | Size |
| --- | --- | --- | --- | --- |
| D1 | Owner: the new service offerings (see "Needs the owner"). | Recorded in `brief.md`. | none | Owner |
| D2 | Site settings, menus and the closing band are filled in, including the AI-training setting. | Footer and band show the canonical links. `/robots.txt` reflects the policy. | B5, D1 | S |
| D3 | Copy for the six fixed pages is drafted to the content standard and edited by a person. | Each page is published by an Editor or Admin. | C3 to C9, D1 | M |
| D4 | The five projects (three active, two applicants), the services and the four supports are entered with real logos, covers and alt text. | No placeholder text or image on any page. | C5, C6, D1 | M |
| D5 | At least three real updates are published, or the home page hides the section when there are none. | Home and `/updates/` show real entries. | C7 | S |
| D6 | Each page has a title and description; the home title carries "Nonprofit DAO Accelerator". Owner: Web Analytics on, sitemap submitted to Search Console. | Titles and descriptions are unique. | D3 | S |
| D7 | Launch: `feature/relaunch` merges to `main`; EmDash is switched from staging to live; the first-deploy checks in `architecture.md` pass on superbenefit.org with the production Turnstile key. | A real contact message arrives. An edit published in the admin shows on the live site. | all above | M |

## E. Fleet
| # | Outcome | Accept when | Depends on | Size |
| --- | --- | --- | --- | --- |
| E1 | governance.superbenefit.org's canonical points to itself (`governance-site` repo). | `<link rel="canonical">` on the live site is the `.org` URL. | none | S |
| E3 | Links across the fleet use `https://discord.gg/DMezXT7UAt` and the `.org` knowledge domain. | No `.dev` knowledge links or other Discord invite on any property. | none | M |

## Order
1. Now, in parallel: A1 to A4, E1, E3, and the owner items A5 and D1.
2. B1, B2, then B5. B3 and B4 as soon as B2 is on a branch preview.
3. C1, then C2. Then C3 to C10 in parallel. B6 after C1.
4. C11, B7, D2 to D6.
5. D7.
6. E1 and E3 any time.
