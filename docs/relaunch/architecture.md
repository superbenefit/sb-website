# Architecture (decided 2026-11-20)

The design the relaunch builds. Every choice follows the official docs linked. Owner decisions are recorded at the end. Nothing here is deployed yet; see First-deploy checks.

## Stack
Astro 7.4 + `@astrojs/cloudflare` 14.4 on Workers Paid, with EmDash on D1 (`DB`), R2 (`MEDIA`) and KV (`SESSION`). Set up exactly as [Deploy to Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/) describes:
- `astro.config.mjs`: `output: "server"`, `adapter: cloudflare()` with no options, `react()`, `emdash({ database: d1({ binding: "DB" }), storage: r2({ binding: "MEDIA" }) })`.
- `wrangler.jsonc`: `main: ./src/worker.ts`, the `DB` and `MEDIA` bindings by name (Wrangler creates both on first deploy), `triggers.crons: ["* * * * *"]`.
- `src/worker.ts`: the documented entry from `@emdash-cms/cloudflare/worker` with `createScheduledHandler()`.
- `src/live.config.ts` with `emdashLoader()`. `EMDASH_SITE_URL` is set before first setup.

Current settings that conflict with this and are removed: `prerenderEnvironment: 'node'`, the custom `imageService` object, the `sessionDrivers.lruCache()` override (EmDash sign-in uses the adapter's KV sessions), the `assets` block in `wrangler.jsonc`, `@astrojs/sitemap` and `public/robots.txt`.

docs.emdashcms.com tracks unreleased `main`, ahead of the npm release (1.5.0 on 2026-11-20). Check doc-derived behaviour against the installed version.

## Rendering per route
| Route | Mode | Content source |
| --- | --- | --- |
| `/` | on demand, cached | `pages` entry `home`, featured `projects`, latest `updates` |
| `/accelerator/` | on demand, cached | `pages` entry + `supports` |
| `/services/` | on demand, cached | `pages` entry + `services` |
| `/projects/`, `/projects/{slug}/` | on demand, cached | `projects` |
| `/updates/`, `/updates/{slug}/` | on demand, cached | `updates` |
| `/about/` | on demand, cached | `pages` entry |
| `/contact/` | on demand, cached | `pages` entry; form posts to the existing Astro action |
| `/404`, `/500` | on demand, not cached | code |
| `/_emdash/*` | on demand, never cached | EmDash admin and API |
| `/sitemap.xml`, `/robots.txt` | EmDash | replaces `@astrojs/sitemap` and `public/robots.txt` ([SEO](https://docs.emdashcms.com/guides/seo/)) |

On-demand rendering is what makes publish-in-seconds and [draft preview](https://docs.emdashcms.com/guides/preview/) work. `/support` and `/supports` 301 to the accelerator page through [EmDash redirects](https://docs.emdashcms.com/guides/seo/#redirects-and-the-404-log).

## Caching
[Workers Cache](https://docs.emdashcms.com/deployment/route-caching/) with `cacheCloudflare()`. One `routeRules` entry per public route, tagged with the collection names it renders, `maxAge` 1 day and `swr` 7 days as in the docs' example. Pages pass `cacheHint` to `Astro.cache.set()`. EmDash purges on publish. `revisions` on every collection; `toolbar: "client"`.

## Content model
Defined once in `seed/seed.json` ([seed files](https://docs.emdashcms.com/themes/seed-files/)); later changes through admin or `emdash schema`. All collections: `supports: ["drafts", "revisions", "preview", "seo"]`.

| Collection | URL | Fields |
| --- | --- | --- |
| `projects` | `/projects/{slug}` | title, summary (text, 60 to 240 characters), status (select: active, applicant, past; "applicant" uses the mockup's `status--pending` badge with the label "Applicant"), partner, location, website (url), logo (image, optional), cover (image), body (portableText), featured (boolean), order (integer) |
| `services` | none; listed on `/services/` | title, audience (text), deliverables (repeater of short strings), terms (string), body, order |
| `supports` | none; listed on the accelerator page | title, summary (text), body, order |
| `updates` | `/updates/{slug}` | title, excerpt (text), cover (image, optional), body, project (reference to `projects`, optional). Author comes from EmDash bylines; date from the entry. |
| `pages` | fixed routes above | eyebrow (string), title, intro (text), cta_label, cta_url, section_label, section_heading, body, cost_summary (string, accelerator and services only) |

Changed after the mockups (2026-11-21): service deliverables are a list; `pages` gains eyebrow, a section label and heading, and `cost_summary`, which the home page shows under "What it costs"; update cover and project are optional. The home page's "What you get" lists are the titles of the `supports` and `services` entries, not separate fields.

Shared across pages, managed once: the closing call-to-action band (heading, text, second button) is an EmDash [widget area](https://docs.emdashcms.com/guides/widgets/); the header menu and the two footer menus ("Site", "Elsewhere") are [Menus](https://docs.emdashcms.com/guides/menus/).

EmDash has no singleton type, so each fixed page is one `pages` entry looked up by slug. Site title, tagline, social handles and the AI-training opt-out live in [Site Settings](https://docs.emdashcms.com/guides/site-settings/); header and footer links in [Menus](https://docs.emdashcms.com/guides/menus/). Rich text is Portable Text rendered by EmDash's components, so `src/utils/sanitize.ts`, both loaders and the mock JSON are deleted.

## Auth
[Cloudflare Access](https://docs.emdashcms.com/guides/authentication/#cloudflare-access) with GitHub as the identity provider.

| Who | Gets in because | EmDash role |
| --- | --- | --- |
| Members of the SuperBenefit GitHub org (not outside collaborators) | Access policy | Contributor (20): writes drafts, cannot publish |
| Members of the "Web Admins" GitHub team | Access policy | Admin (50) |

- In code: `access({ teamDomain, audienceEnvVar: "CF_ACCESS_AUDIENCE", defaultRole: 20, roleMapping: { "Web Admins": 50 } })`.
- The Access application, its GitHub identity provider and the policy are owner dashboard items. Access policies can match GitHub organizations and teams through the Identity provider group selector ([policies](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/)).
- Admins promote Contributors to Editor inside EmDash; with the default `syncRoles: false` those changes stick.
- To verify on first deploy: that Access passes the GitHub team to EmDash under the name `Web Admins`. EmDash matches `roleMapping` keys against the group names Access returns, and Cloudflare's docs do not show that format for GitHub. If the name differs, the key in `roleMapping` changes to match. Either way the first person to sign in becomes Admin.

## Security headers
- EmDash's middleware already sets `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and `X-Frame-Options: SAMEORIGIN` on every public route, and a strict CSP on `/_emdash/*` (source: `packages/core/src/astro/middleware.ts`, `middleware/csp.ts`). The site adds nothing on top.
- HSTS is a zone setting, so it is an owner dashboard item.
- No custom CSP on public pages at launch. EmDash's inline toolbar and bootstrap scripts need hashes under a strict policy ([configuration](https://docs.emdashcms.com/reference/configuration/)), so a public CSP is its own later issue, not part of the relaunch. `<ClientRouter />` stays.
- JSON-LD comes from `<EmDashHead>`, which removes the unescaped `set:html` blocks (finding N1).
- Images render through `<Image>` from `emdash/ui`. EmDash's image endpoint reads R2 directly, so images work for visitors even though `/_emdash/*` is behind Access ([`images` option](https://docs.emdashcms.com/reference/configuration/#images)).

## Environments and CI
- `main` deploys to superbenefit.org through Workers Builds (already connected).
- **One set of resources, none for previews** (owner decision, 2026-11-21). The site has one D1 database, one R2 bucket and one KV namespace. Branch builds stay on the Worker's current preview model: `wrangler versions upload`, which gives each branch a Version URL that "runs one uploaded version against your production resources" ([Version URLs](https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/)). The one-time switch to Worker Previews is not made, because Previews "do not use production settings" and need their own bindings ([preview builds](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/#configure-preview-builds)). `superbenefit.dev` is the preview domain.
- What this costs, as documented:
  - Branch previews read and write the live database and bucket. EmDash's guide advises against exactly this ("Never point a preview binding at a production database or bucket", [preview deployments](https://docs.emdashcms.com/deployment/cloudflare/#preview-deployments)). Before launch there is no live content, so the risk is nil and content entered on a preview is already in place at launch. After launch, a branch that upgrades EmDash would run its database migrations against live data on its first request, so EmDash upgrades after launch are tested locally with `astro dev` (local database) before they are pushed.
  - Version URLs are not generated for Workers that use Durable Objects ([build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)), so EmDash co-editing, which needs one, stays off. EmDash then uses single-editor mode with edit locks.
  - Scheduled publishing is confirmed after launch. Not verified: whether a Cron Trigger reaches a version that is uploaded but not deployed; no doc statement was found either way.
- To verify on the first CMS branch: that Wrangler's [automatic provisioning](https://developers.cloudflare.com/workers/wrangler/configuration/#automatic-provisioning) creates the database, bucket and namespace on `versions upload`. The docs describe it for "when you deploy". If it does not, the owner creates the three production resources once by hand.
- GitHub Actions on every PR: `npm ci`, `npm run check`, `npm run build`, `npm audit --omit=dev`. Dependabot weekly for npm.
- `compatibility_date` moves to the current date.

## Ownership
All Worker domain and Access settings are configured by a human in the Cloudflare dashboard. They are not written into config files and not changed by agents through the API. That covers custom domains and routes (including `.dev` as the preview domain and the www redirect), the Access application, its policies and identity provider, and Turnstile widget hostnames. `wrangler.jsonc` carries bindings, cron, vars and the `previews` block only, with no `routes`. Issues that need one of these settings are written as an owner checklist item with the exact value to enter, and the code work waits on it.

## Not decided by this page
Copy and the new service offerings are content work; see `issues.md`. Fleet fixes (governance canonical, unidentified Workers) are last in the order.

## First-deploy checks
The setup above is taken from the docs and source, not yet deployed. The first branch build with EmDash runs the docs' own checklist: a public page, admin sign-in through Access, a media upload shown on a public page while signed out, and the cron in `wrangler tail`.

## Owner decisions (2026-11-20)
1. Editors sign in through Access with GitHub. Org members are Contributors; the "Web Admins" team are Admins.
2. The accelerator page lives at `/accelerator/`; `/support` and `/supports` redirect to it.
3. Updates are written in EmDash.
4. `/about/` stays.
5. `.dev` is the preview domain, set up by the owner. Domain and Access settings are dashboard-only (see Ownership).
6. No preview-specific Cloudflare resources (2026-11-21). See Environments and CI.
7. AI crawlers: block training, allow everything else. Projects awaiting acceptance are marked "Applicant".

Owner items still open are listed at the top of `issues.md`: enabling R2, HSTS, the Turnstile preview hostname, the `.dev` preview domain, and the Access application with its AUD secret and team domain. The GitHub identity provider already exists, and www already redirects to the apex.
