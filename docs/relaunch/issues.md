# Stage 4: issue list (2026-11-21)

Approved by the owner on 2026-11-21 and created on GitHub as superbenefit/sb-website issues 23 to 54, in this order (A1 is 23, E3 is 54). Each item is one outcome.

- **Sizes:** S is under half a day, M about a day, L two to three days.
- **Every code issue** is one branch and one PR into `feature/relaunch`. It closes when `npm run check` and `npm run build` pass and the Workers Builds preview shows the stated result.
- **Design:** page and component issues are built to match `mockups/`. Read `mockups/README.md` first.

## Needs the owner
Four things only a person can do or provide. Agents do not change Cloudflare domain or Access settings.

| # | What is needed | Why | Blocks |
| --- | --- | --- | --- |
| A5 | Confirm that a test message sends from the contact form on a preview created after the preview secrets were set. | Access on previews is on (previews redirect to sign-in, checked 2026-11-21) and the secrets are set. A preview that existed before the secrets were set does not receive them, so an older preview fails to send: the visitor sees the generic error and the Worker log says "CONTACT_EMAIL is not set". | C9 testing |
| B3 | Done by the owner on 2026-11-22, in the Cloudflare dashboard: the Worker secret `CF_ACCESS_AUDIENCE` under **Previews Base** (the previews Access application's AUD tag); an Access application `sb-website CMS` for `superbenefit.org` path `_emdash/*` with an Allow policy for the SuperBenefit GitHub organization; the Worker secret `CF_ACCESS_AUDIENCE` under **Production** (that application's AUD tag); and an Access application `sb-website media (public)` for `superbenefit.org` path `_emdash/api/media/file/*` with a Bypass policy for Everyone. Steps 1 to 7 below. None of it changes the live site. | CMS sign-in goes through Access (B4, #31). Without the secret every admin request answers 401 "Authentication failed". Without the Bypass application visitors and social crawlers cannot load share images, file downloads, video or unoptimised images, which EmDash serves from its media route (`architecture.md`, Auth). The GitHub identity provider and the previews Access application (A5) already exist. Team domain: `superbenefit.cloudflareaccess.com`. | B4 |
| D1 | The new service offerings: for each, a title, who it is for, what they get (a short list), and terms. | The owner is redoing the offerings. The three in the mockups are real but will be replaced. | D3, D4 |
| D4 | Logos, cover images and alt text for the five projects. | The mockups use labelled placeholders. | D4 |

Also needed later, with no decision involved: a human edit of all copy (D3), and Web Analytics and Search Console setup at launch (D6).

### B3 step by step (Cloudflare dashboard)
Steps 1 to 7 were done by the owner on 2026-11-22. They are kept here as the record of the setup. Nothing is left for launch. None of it changes the live site: the code on `main` has no `/_emdash/*` routes and does not read `CF_ACCESS_AUDIENCE`. Values are never sent to anyone or written into the repo.

Cloudflare's references: [AUD tag](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/#get-your-aud-tag), [Previews configuration](https://developers.cloudflare.com/workers/previews/configuration/), [Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/#via-the-dashboard), [self-hosted application](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/), [application paths](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/), [policy selectors](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/#selectors).

**Previews** (the B4 preview needs these; a Previews Base secret reaches only Previews created after it is set):
1. **Zero Trust** > **Access controls** > **Applications**. Find the application that protects the previews (set up for A5, covering the `superbenefit.dev` preview hostnames; if previews were protected from the Worker's **Access** tab, the application that tab created) and select **Edit**. In **Additional settings**, copy the **Application Audience (AUD) Tag**.
2. In the same application, look at its Allow policy and note how it lets people in (you reuse it in step 4). Check that it lets in both test accounts for the B4 check: one SuperBenefit org member who is not in Web Admins, and one Web Admins member. Neither may have signed in to the staging admin before (EmDash sets the role only when it creates the account).
3. **Workers & Pages** > `sb-website` > **Settings**. In **Variables and secrets**, select the **Previews Base** toggle (not **Production**), then add: type **Secret**, name `CF_ACCESS_AUDIENCE`, value the tag from step 1. Confirm with the button the panel offers; Cloudflare's docs do not name it for Previews Base. This changes only what new Previews start from: existing Previews and production are not changed.

**Production** (done now, so launch needs no Access work):
4. **Zero Trust** > **Access controls** > **Applications** > **Create new application** > **Self-hosted and private**. Name: `sb-website CMS`. Select **Add public hostname**: **Domain** `superbenefit.org`, **Path** `_emdash/*`. Under **Access policies**, add the policy from step 2 if it is offered as an existing policy. Otherwise create one: action **Allow**, an **Include** rule with the selector **Identity provider group** (Cloudflare shows it because the GitHub identity provider is set up), value the SuperBenefit GitHub organization. Cloudflare's docs do not show what that value field lists for GitHub; choose the same entry the previews policy uses. Identity providers: **GitHub** only, with **Apply instant authentication** on. Leave the other settings as they are. Select **Create**.
5. Open `sb-website CMS` with **Edit**. In **Additional settings**, copy its **Application Audience (AUD) Tag**. It differs from the one in step 1.
6. **Workers & Pages** > `sb-website` > **Settings**. In **Variables and secrets**, select the **Production** toggle, then **Add**: type **Secret**, name `CF_ACCESS_AUDIENCE`, value the tag from step 5. Select **Deploy**. This creates a new version of the code now in production (from `main`) with the secret added and deploys it at once; that code does not read the secret, so the site behaves the same.
7. **Create new application** > **Self-hosted and private** again. Name: `sb-website media (public)`. **Add public hostname**: **Domain** `superbenefit.org`, **Path** `_emdash/api/media/file/*`. Under **Access policies**, create a policy: action **Bypass**, **Include** rule with the selector **Everyone**. Select **Create**. This path is more specific than step 4's, so it takes precedence and inherits nothing from it: visitors load images from that route without signing in.

Nothing is needed for comments, search, plugin routes or a health monitor: the site uses none of them. Production checks happen at launch (D7), when the CMS code reaches `main`; until then `superbenefit.org/_emdash/...` asks for the GitHub sign-in, and the current site has no page there.

If the B4 preview was created before step 3, its admin answers 401 "Authentication failed" and the Worker log says `Environment variable "CF_ACCESS_AUDIENCE" not found or empty`. Then either add the same secret to that one Preview (select it in the Worker's Preview selector, then **Settings** > **Variables and secrets**), or delete the Preview and push again.

**After the B4 preview is up** (records the `roleMapping` key in `architecture.md`, Auth):
8. Sign in to `https://b4-access-sign-in.superbenefit.dev/` as the Web Admins member, and again as a Knowledge Stewardship member, and open `https://b4-access-sign-in.superbenefit.dev/cdn-cgi/access/get-identity`. In `groups`, find the team's entry and copy its `name` exactly, character for character. EmDash compares that string with the keys `Web Admins` and `Knowledge Stewardship`, case-sensitively.
9. As each test account, open `/_emdash/admin`; it should load without a second sign-in. Then, as an Admin, open **Users** in the admin: the org member is **Contributor**, the Knowledge Stewardship member is **Editor**, the Web Admins member is **Admin**.
10. Post the names from step 8 and the three roles from step 9 on issue #31. If a name differs from its key, the key is changed to it on the branch.

If `groups` is empty or has no team entries: in GitHub, the SuperBenefit organization's **Settings** > **Third-party Access** > **OAuth app policy** may restrict OAuth apps, in which case the OAuth app used by the Access GitHub login needs approval there; then sign out of Access and sign in again (`https://superbenefit.cloudflareaccess.com/cdn-cgi/access/logout`). A member who was refused once by a GitHub organization rule stays refused until they revoke the app under their own GitHub **Settings** > **Applications** and sign in again ([Cloudflare](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/github/)).

## Staging resources for previews (created 2026-11-21)
Created at the owner's request. All previews share them. They are bound in the `previews` block of `wrangler.jsonc` since B2.

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
| A1 | Every branch is type-checked. `npm run build` runs `astro check` before `astro build`, so Workers Builds fails on a type error. No GitHub Actions workflow; Dependabot is decided at launch (owner decision, 2026-11-21). | A branch with a type error fails the Workers Builds check. | none | S |
| A2 | `compatibility_date` is current. | Preview build passes; contact form sends on the preview with test keys. | none | S |
| A3 | Contact action is hardened: CR/LF rejected in subject and name, visitors see a generic message on server faults, a `ratelimits` binding limits posts per IP. | A subject with a line break returns a field error. An unset secret shows the generic message and logs the detail. Repeated posts from one IP are refused. | none | M |
| A4 | Internal links use the trailing-slash form. `www.allinforsport.org` links point at the apex. A4 also set `trailingSlash: 'always'`; the owner replaced it with Astro's default `'ignore'` on 2026-11-22 (finding T1) because `'always'` made the EmDash admin URLs 404. | No internal link on the preview returns 307. | none | S |
| A5 | Owner: a test message sends from the contact form on a new preview. (Access on previews: done. Preview secrets: done.) | The message arrives. | none | Owner |

## B. CMS
| # | Outcome | Accept when | Depends on | Size |
| --- | --- | --- | --- | --- |
| B1 | Done 2026-11-21: the three staging resources exist. IDs are in the table above. | Done. | none | Done |
| B2 | EmDash is installed exactly as [Deploy to Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/) describes: production bindings by name at the top level, and the `previews` block binding `DB`, `MEDIA` and `SESSION` to the staging resources by ID. Conflicting settings are removed (list in `architecture.md`). | Branch preview at `<branch-name>.superbenefit.dev`: a public page renders, `/_emdash/admin` shows setup, an uploaded image displays. Setup completes on the staging database without `EMDASH_SITE_URL` on the preview, or the Preview command passes it (see `architecture.md`, Site URL for the CMS). | A5, B1 | L |
| B3 | Owner: the Access applications and `CF_ACCESS_AUDIENCE` secrets; see "B3 step by step". | Steps 1 to 7 done (owner, 2026-11-22). Signed out, `superbenefit.org/_emdash/admin` redirects to the GitHub sign-in. At launch (D7): a visitor loads `/_emdash/api/media/file/...` without signing in. | B2 | Owner |
| B4 | Admin sign-in goes through Access with `defaultRole: 20` and `roleMapping: { "Web Admins": 50, "Knowledge Stewardship": 40 }`. Configured on branch `b4-access-sign-in` (#31): `access()` in `astro.config.mjs`, behaviour and local checks in `architecture.md`, Auth. | An org member signs in as Contributor, a "Knowledge Stewardship" member as Editor, a "Web Admins" member as Admin. If a team name arrives in another form, the mapping key is corrected and the form recorded in `architecture.md`. Owner steps 8 to 10 under "B3 step by step". Result (2026-11-22): sign-in and the Contributor default work; the team mapping does not take effect with GitHub sign-in (finding R1), so an Admin sets Editor and Admin under Users. Owner decision: keep the mapping in the code and report it to EmDash. | B3 | M |
| B5 | The content model exists: five collections, the closing-band widget area and three menus, from `seed/seed.json`. | The admin shows all five content types with the fields in `architecture.md`. | B2 | M |
| B6 | Workers Cache is on, with one route rule per public route tagged by collection. | A second request to a page is a cache hit. Publishing an edit shows on the public page within a minute. A draft preview link shows unpublished content. | B5, C1 | M |
| B7 | Legacy content code is gone: both loaders, mock JSON, `content.config.ts`, `sanitize.ts`, draft-gating flags. (`@astrojs/sitemap` and `public/robots.txt` were removed by B2, #29.) | `/sitemap.xml` and `/robots.txt` come from EmDash. No mock titles in any page. | C3 to C9 | S |

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
