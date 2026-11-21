# Stage 4: issue list (2026-11-21)

Nothing here has been created on GitHub yet. Each item is one outcome.

- **Sizes:** S is under half a day, M about a day, L two to three days.
- **Every code issue** is one branch and one PR into `feature/relaunch`. It closes when `npm run check` and `npm run build` pass and the Workers Builds preview shows the stated result.
- **Design:** page and component issues are built to match `mockups/`. Read `mockups/README.md` first.

## Needs the owner
Eight things only a person can do or decide. Each blocks the issues listed. Agents do not change Cloudflare domain or Access settings.

| # | What is needed | Why | Blocks |
| --- | --- | --- | --- |
| A5 | In the Cloudflare dashboard: redirect www.superbenefit.org to the apex (301); turn on HSTS; attach `superbenefit.dev` as the preview domain; add the preview hostname to the Turnstile widget's allowed hostnames. | www returns 522 today. No security header is live. Turnstile refuses preview hostnames (error 110200), so the contact form cannot be tested before it reaches production. | C9 testing, D7 |
| B1 | Create three preview resources and post their IDs in the issue: `npx wrangler d1 create sb-website-preview`, `npx wrangler r2 bucket create sb-website-media-preview`, `npx wrangler kv namespace create sb-website-preview-session`. | EmDash previews must not use production data. Wrangler needs the IDs in `wrangler.jsonc`. | B2 and everything after it |
| B3 | In Zero Trust: add GitHub as an identity provider; create an Access application for `superbenefit.org/_emdash/*` (and the preview hostname) with a policy allowing members of the GitHub org; save its AUD tag with `npx wrangler secret put CF_ACCESS_AUDIENCE`; post the team domain (`<name>.cloudflareaccess.com`) in the issue. | Sign-in to the CMS goes through Access. The team domain is a value in `astro.config.mjs`. | B4 |
| D1a | Confirm or correct the three services and their terms. The mockups show: Sensemaking and network weaving (annual retainer, from $5,000 a year); Project co-stewardship (quarterly, from $5,000 a quarter); Digital commons development (per engagement, from $5,000). | These prices and terms came from the old site and may not be real. They will be published. | D3, D4 |
| D1b | Say what may be published about Pacto while its application is pending. The mockups list it with status "pending" and no summary. | It appears on the home and projects pages. | D4 |
| D1c | Give the canonical links: Discord invite (the site uses `discord.gg/q95fFXGu67`; another property uses `d2EeszTvVm`), X handle (the site uses `SuperBenefitDAO`), and the URL for "Book an onboarding call" on the contact page, which links nowhere today. | They go in the footer and the closing band on every page. | D2, E3 |
| D1d | AI crawlers: allow, or ask them not to train on the site. EmDash has one setting for this; when on, it adds `Content-Signal: search=yes, ai-train=no` and blocks known training crawlers in `robots.txt`. Search engines are unaffected either way. | It is a site setting to fill in before launch. | D2 |
| E2 | Say what the Workers `docs`, `regen-toolkit`, `slc-advisor` and `sb-auth` serve, and which are in scope. | They are in the Cloudflare account and nobody has identified them. | E3 |

Also needed from the owner later, with no decision involved: real project logos and cover images with alt text (D4), a human edit of all copy (D3), and Web Analytics and Search Console setup at launch (D6).

## Decided, no input needed
- The home page project selector is built as designed: it advances every 7 seconds with pause, previous and next. See `mockups/README.md`.
- States the mockups do not show (form error, submitting, success, server error; empty lists) are built from the mockup tokens and components, and shown on the PR preview for review.
- The home page headings differ between the 1440 and 390 px mockups. Copy is settled in D3; the layout is the same.

## A. Hygiene and security
| # | Outcome | Accept when | Depends on | Size |
| --- | --- | --- | --- | --- |
| A1 | Every PR is checked. GitHub Actions runs `npm ci`, `npm run check`, `npm run build`, `npm audit --omit=dev`; Dependabot opens weekly npm updates. | A PR with a type error fails the check. A Dependabot PR appears. | none | S |
| A2 | `compatibility_date` is current. | Preview build passes; contact form sends on the preview with test keys. | none | S |
| A3 | Contact action is hardened: CR/LF rejected in subject and name, visitors see a generic message on server faults, a `ratelimits` binding limits posts per IP. | A subject with a line break returns a field error. An unset secret shows the generic message and logs the detail. Repeated posts from one IP are refused. | none | M |
| A4 | Internal links use the trailing-slash form and `trailingSlash: 'always'` is set. `www.allinforsport.org` links point at the apex. | No internal link on the preview returns 307. | none | S |
| A5 | Owner: see "Needs the owner". | `curl -I` shows 301 on www and the HSTS header on the apex. Turnstile issues a token on the preview. | none | Owner |

## B. CMS
| # | Outcome | Accept when | Depends on | Size |
| --- | --- | --- | --- | --- |
| B1 | Owner: see "Needs the owner". | IDs posted. | none | Owner |
| B2 | EmDash is installed exactly as [Deploy to Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/) describes, with the `previews` block. Conflicting settings are removed (list in `architecture.md`). | Preview: a public page renders, `/_emdash/admin` shows setup, an uploaded image displays, the cron appears in `wrangler tail`. | B1 | L |
| B3 | Owner: see "Needs the owner". | Values posted; visiting `/_emdash/admin` signed out redirects to GitHub. | B2 | Owner |
| B4 | Admin sign-in goes through Access with `defaultRole: 20` and `roleMapping: { "Web Admins": 50 }`. | An org member signs in as Contributor. A "Web Admins" member signs in as Admin. If the team name arrives in another form, the mapping key is corrected and the form recorded in `architecture.md`. | B3 | M |
| B5 | The content model exists: five collections, the closing-band widget area and three menus, from `seed/seed.json`. | A fresh preview database shows all five content types with the fields in `architecture.md`. | B2 | M |
| B6 | Workers Cache is on, with one route rule per public route tagged by collection. | A second request to a page is a cache hit. Publishing an edit shows on the public page within a minute. A draft preview link shows unpublished content. | B5, C1 | M |
| B7 | Legacy content code is gone: both loaders, mock JSON, `content.config.ts`, `sanitize.ts`, draft-gating flags, `@astrojs/sitemap`, `public/robots.txt`. | `/sitemap.xml` and `/robots.txt` come from EmDash. No mock titles in any page. | C3 to C9 | S |

## C. Pages (built to `mockups/`)
| # | Outcome | Mockup | Accept when | Depends on | Size |
| --- | --- | --- | --- | --- | --- |
| C1 | Base layout and shared parts: new tokens, header, mobile menu, stripe, footer with both menus, closing band, buttons, status badge, page hero, wave divider. Head tags and JSON-LD come from `<EmDashHead>`. | every page; `mobile-menu-open` | Header, footer and band match at 390 and 1440 px. Menu edits in the admin show on the site. No `set:html` JSON-LD remains. | B5 | L |
| C2 | Rich text renders every element: headings, lists, quote with attribution, image with caption, inline and block code, table, click-to-load video. | `update` | A test entry using every element matches at both widths. No request goes to the video host before play is pressed. | C1 | M |
| C3 | Home page, including the project selector exactly as specified in `mockups/README.md`. | `home` | Matches at both widths. One `<h1>`. Selector behaviour matches each point in the README. With JavaScript off, the first project shows and all are reachable. | C1 | L |
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
| D1 | Owner: D1a to D1d in "Needs the owner". | Answers recorded in `brief.md`. | none | Owner |
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
| E2 | Owner: see "Needs the owner". | Recorded in `brief.md`. | none | Owner |
| E3 | Links across the fleet use the canonical channels from D1c and the `.org` knowledge domain. | No `.dev` knowledge links or second Discord invite on any property. | D1, E2 | M |

## Order
1. Now, in parallel: A1 to A4, and the owner items A5, B1, D1, E2.
2. B2, then B5. B3 and B4 as soon as B2 is on a preview.
3. C1, then C2. Then C3 to C10 in parallel. B6 after C1.
4. C11, B7, D2 to D6.
5. D7.
6. E1 any time; E3 after D1 and E2.
