# Stage 4: issue list (draft for owner approval, 2026-11-21)

Nothing here has been created on GitHub. Each item is one outcome. Sizes: S is under half a day, M about a day, L two to three days. "Owner" items need a person in the Cloudflare or GitHub dashboard. Every code issue is one branch and one PR into `feature/relaunch`, and closes when `npm run check` and `npm run build` pass and the Workers Builds preview shows the stated result.

## What the mockups changed
Source: `superbenefit.org relaunch mockups.html`, received 2026-11-21. Ten pages at 1440 and 390 px, plus the mobile menu.
- Tokens match `src/styles/global.css`. New ones: `--radius-sm`, `--radius-md`, `--radius-pill`, `--space-xl-half`, `--rule`, `--rule-dark`, `--stripe`. Fonts stay Playfair Display and Inter.
- Content model changes are recorded in `architecture.md`.
- The home page has a project selector that advances every 7 seconds on screens 900 px and wider, with previous, next and pause controls, and no auto-advance under reduced motion. The handoff prompt said no carousels; this one has a pause control, so it meets WCAG 2.2.2. It is built as designed (P3) with a small script and no library.
- Not in the mockups: the component sheet, the notes file, and these states: form field error, submitting, success and server error; keyboard focus; an empty updates list; a project with no updates. Those are built from the tokens and shown in the PR preview for owner review.
- Still placeholder: the hero illustration, project logos and covers, and all service audience lines.

## A. Hygiene and security
| # | Outcome | Accept when | Depends on | Size |
| --- | --- | --- | --- | --- |
| A1 | Every PR is checked. GitHub Actions runs `npm ci`, `npm run check`, `npm run build`, `npm audit --omit=dev`; Dependabot opens weekly npm updates. | A PR with a type error fails the check. A Dependabot PR appears. | none | S |
| A2 | `compatibility_date` is current. | Preview build passes; contact form sends on the preview with test keys. | none | S |
| A3 | Contact action is hardened: CR/LF rejected in subject and name, visitors see a generic message on server faults, a `ratelimits` binding limits posts per IP. | A subject with a line break returns a field error. An unset secret shows the generic message and logs the detail. Repeated posts from one IP are refused. | none | M |
| A4 | Internal links use the trailing-slash form and `trailingSlash: 'always'` is set. `www.allinforsport.org` links point at the apex. | No internal link on the preview returns 307. | none | S |
| A5 | Owner: www.superbenefit.org redirects to the apex; HSTS is on; `superbenefit.dev` is the preview domain; the Turnstile widget allows the preview hostname. | `curl -I` shows 301 on www and the HSTS header on the apex. Turnstile issues a token on the preview. | none | Owner |

## B. CMS
| # | Outcome | Accept when | Depends on | Size |
| --- | --- | --- | --- | --- |
| B1 | Owner: preview D1 database, R2 bucket and KV namespace exist, and their IDs are in the issue. | IDs posted. | none | Owner |
| B2 | EmDash is installed exactly as [Deploy to Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/) describes, with the `previews` block. Conflicting settings are removed (list in `architecture.md`). | Preview: a public page renders, `/_emdash/admin` shows setup, an uploaded image displays, the cron appears in `wrangler tail`. | B1 | L |
| B3 | Owner: Access application on `/_emdash/*` with the GitHub identity provider and a policy for org members; AUD tag saved as the `CF_ACCESS_AUDIENCE` secret; team domain posted in the issue. | Values posted; visiting `/_emdash/admin` signed out redirects to GitHub. | B2 | Owner |
| B4 | Admin sign-in goes through Access with `defaultRole: 20` and `roleMapping: { "Web Admins": 50 }`. | An org member signs in as Contributor. A "Web Admins" member signs in as Admin. If the team name arrives in another form, the mapping key is corrected and the form is recorded in `architecture.md`. | B3 | M |
| B5 | The content model exists: five collections, the closing-band widget area and three menus, from `seed/seed.json`. | A fresh preview database shows all five content types with the fields in `architecture.md`. | B2 | M |
| B6 | Workers Cache is on, with one route rule per public route tagged by collection. | A second request to a page is a cache hit. Publishing an edit shows on the public page within a minute. A draft preview link shows unpublished content. | B5, C1 | M |
| B7 | Legacy content code is gone: both loaders, mock JSON, `content.config.ts`, `sanitize.ts`, draft-gating flags, `@astrojs/sitemap`, `public/robots.txt`. | `/sitemap.xml` and `/robots.txt` come from EmDash. No mock titles in any page. | C3 to C9 | S |

## C. Pages (from the mockups)
| # | Outcome | Accept when | Depends on | Size |
| --- | --- | --- | --- | --- |
| C1 | Base layout and shared parts match the mockups: new tokens, header, mobile menu, footer with both menus, closing band, buttons, status badge, page hero. Head tags and JSON-LD come from `<EmDashHead>`. | Header, footer and band match the mockups at 390 and 1440 px. Menu edits in the admin show on the site. No `set:html` JSON-LD remains. | B5 | L |
| C2 | Rich text renders every element in the Update mockup: headings, lists, quote with attribution, image with caption, inline and block code, table, click-to-load video. | A test entry using every element matches the Update mockup at both widths. No request goes to the video host before play is pressed. | C1 | M |
| C3 | Home page matches the mockup, including the project selector with pause, previous and next, keyboard support, and no auto-advance under reduced motion. | Matches at both widths. One `<h1>`. With JavaScript off, the first project shows and all are reachable. | C1 | L |
| C4 | Accelerator page at `/accelerator/`; `/support` and `/supports` redirect to it. | Matches the mockup. Both old paths return 301. | C1 | S |
| C5 | Services page with deliverables lists and terms. | Matches the mockup with three services. | C1 | M |
| C6 | Projects index and project page, with status, optional logo, and related updates. | Match the mockups. A project with no logo and one with no updates both render cleanly. | C1, C2 | M |
| C7 | Updates index with pagination and update page with author, date and linked project. | Match the mockups. An empty list shows a message, not a blank page. | C1, C2 | M |
| C8 | About page. | Matches the mockup. | C1, C2 | S |
| C9 | Contact page in the new design, keeping explicit Turnstile rendering. | Matches the mockup. The five navigation scenarios from PR #18 pass. Error, submitting and success states are shown in the PR. | C1 | M |
| C10 | Not-found and server-error pages; correct `manifest.json` icons and favicon. | Unknown URL returns 404 with the mockup page. Manifest icons are square at their declared sizes. | C1 | S |
| C11 | Accessibility pass on all pages. | Automated axe scan has no violations at either width; keyboard walk-through reaches every control with visible focus. | C3 to C10 | M |

## D. Content and launch
| # | Outcome | Accept when | Depends on | Size |
| --- | --- | --- | --- | --- |
| D1 | Owner answers: which services and prices are real; what can be said about Pacto; the canonical Discord invite, X handle and onboarding-call link; AI-crawler policy. | Answers recorded in `brief.md`. | none | Owner |
| D2 | Site settings, menus and the closing band are filled in, including the AI-training setting. | Footer and band show the canonical links. `/robots.txt` reflects the policy. | B5, D1 | S |
| D3 | Copy for the six fixed pages is drafted to the content standard and edited by a person. | Each page is published by an Editor or Admin. | C3 to C9, D1 | M |
| D4 | The four projects, three services and four supports are entered with real logos, covers and alt text. | No placeholder text or image on any page. | C5, C6, D1 | M |
| D5 | At least three real updates are published, or the home page hides the section when there are none. | Home and `/updates/` show real entries. | C7 | S |
| D6 | Each page has a title and description; the home title carries "Nonprofit DAO Accelerator". Owner: Web Analytics on, sitemap submitted to Search Console. | Titles and descriptions are unique. | D3 | S |
| D7 | Launch: `feature/relaunch` merges to `main`; EmDash is switched from staging to live; the first-deploy checks in `architecture.md` pass on superbenefit.org with the production Turnstile key. | A real contact message arrives. An edit published in the admin shows on the live site. | all above | M |

## E. Fleet
| # | Outcome | Accept when | Depends on | Size |
| --- | --- | --- | --- | --- |
| E1 | governance.superbenefit.org's canonical points to itself (`governance-site` repo). | `<link rel="canonical">` on the live site is the `.org` URL. | none | S |
| E2 | Owner: say what `docs`, `regen-toolkit`, `slc-advisor` and `sb-auth` serve and which are in scope. | Recorded in `brief.md`. | none | Owner |
| E3 | Links across the fleet use the canonical channels from D1 and the `.org` knowledge domain. | No `.dev` knowledge links or second Discord invite on any property. | D1, E2 | M |

## Order
1. Now, in parallel: A1 to A4, and owner items A5, B1, D1, E2.
2. B2, then B5. B3 and B4 as soon as B2 is on a preview.
3. C1, then C2. Then C3 to C10 in parallel. B6 after C1.
4. C11, B7, D2 to D6.
5. D7.
6. E1 any time; E3 after D1 and E2.

## Questions before creating the issues
1. Where should the mockup file live so the coding sessions can open it? It is 10 MB, so it has not been committed here.
2. The home project selector auto-advances. Build it as designed, or show the four projects as a static list?
