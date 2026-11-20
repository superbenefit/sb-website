# Stage 2 architecture (proposed 2026-11-20)

One page. Every choice follows the official docs linked; `validation.md` has the evidence. Owner decisions were made on 2026-11-20 and are recorded at the end.

## Stack
Astro 7.4 + `@astrojs/cloudflare` 14.4 on Workers Paid, EmDash on D1 (`DB`) + R2 (`MEDIA`) + KV (`SESSION`), set up exactly as [Deploy to Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/) describes: `output: "server"`, `cloudflare()` with no options, `src/worker.ts` with the scheduled handler, every-minute cron.

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
| `projects` | `/projects/{slug}` | title, summary (text), status (select: active, pending, past), partner, location, website (url), logo (image), cover (image), body (portableText), featured (boolean), order (integer) |
| `services` | none; listed on `/services/` | title, audience (text), deliverable (text), terms (string: price or SLA), body, order |
| `supports` | none; listed on the accelerator page | title, summary (text), body, order |
| `updates` | `/updates/{slug}` | title, excerpt (text), cover (image), body, project (reference to `projects`) |
| `pages` | fixed routes above | title, intro (text), body, cta_label, cta_url |

EmDash has no singleton type, so each fixed page is one `pages` entry looked up by slug. Site title, tagline, social handles and the AI-training opt-out live in [Site Settings](https://docs.emdashcms.com/guides/site-settings/); header and footer links in [Menus](https://docs.emdashcms.com/guides/menus/). Rich text is Portable Text rendered by EmDash's components, so `src/utils/sanitize.ts`, both loaders and the mock JSON are deleted.

## Auth
[Cloudflare Access](https://docs.emdashcms.com/guides/authentication/#cloudflare-access) with GitHub as the identity provider.
- In code: `access({ teamDomain, audienceEnvVar: "CF_ACCESS_AUDIENCE", defaultRole: 20 })`. No `roleMapping`.
- Who gets in is the Access policy, set by the owner in the dashboard.
- Roles are managed inside EmDash, which is the documented default (`syncRoles: false`): the first person to sign in becomes Admin, everyone after starts as Contributor (drafts only), and an Admin promotes them to Editor in the admin panel.

## Security headers
- EmDash's middleware already sets `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and `X-Frame-Options: SAMEORIGIN` on every public route, and a strict CSP on `/_emdash/*` (source: `packages/core/src/astro/middleware.ts`, `middleware/csp.ts`). The site adds nothing on top.
- HSTS is a zone setting, so it is an owner dashboard item.
- No custom CSP on public pages at launch. EmDash's inline toolbar and bootstrap scripts need hashes under a strict policy ([configuration](https://docs.emdashcms.com/reference/configuration/)), so a public CSP is its own later issue, not part of the relaunch. `<ClientRouter />` stays.
- JSON-LD comes from `<EmDashHead>`, which removes the unescaped `set:html` blocks (finding N1).
- Images render through `<Image>` from `emdash/ui`. EmDash's image endpoint reads R2 directly, so images work for visitors even though `/_emdash/*` is behind Access ([`images` option](https://docs.emdashcms.com/reference/configuration/#images)).

## Environments and CI
- `main` deploys to superbenefit.org through Workers Builds (already connected). Branches get Worker Previews with their own D1, R2 and KV in the `previews` block ([docs](https://docs.emdashcms.com/deployment/cloudflare/#preview-deployments)). `superbenefit.dev` is the preview domain.
- GitHub Actions on every PR: `npm ci`, `npm run check`, `npm run build`, `npm audit --omit=dev`. Dependabot weekly for npm.
- `compatibility_date` moves to the current date.

## Ownership
All Worker domain and Access settings are configured by a human in the Cloudflare dashboard. They are not written into config files and not changed by agents through the API. That covers custom domains and routes (including `.dev` as the preview domain and the www redirect), the Access application, its policies and identity provider, and Turnstile widget hostnames. `wrangler.jsonc` carries bindings, cron, vars and the `previews` block only, with no `routes`. Issues that need one of these settings are written as an owner checklist item with the exact value to enter, and the code work waits on it.

## Not decided by this page
Copy, the services that survive, what to say about Pacto, canonical social links and the AI-crawler policy are content decisions for Stage 4. Fleet fixes (governance canonical, unidentified Workers) are last in the order.

## First-deploy checks
The setup above is taken from the docs and source, not yet deployed. The first preview deploy runs the docs' own checklist: a public page, admin sign-in through Access, a media upload shown on a public page while signed out, and the cron in `wrangler tail`.

## Owner decisions (2026-11-20)
1. Editors sign in through Access with GitHub.
2. The accelerator page lives at `/accelerator/`; `/support` and `/supports` redirect to it.
3. Updates are written in EmDash.
4. `/about/` stays.
5. `.dev` is the preview domain, set up by the owner. Domain and Access settings are dashboard-only (see Ownership).

Owner dashboard items, each written into the issue that needs it: Access application on `/_emdash/*` with the GitHub identity provider and policy, the AUD tag as the `CF_ACCESS_AUDIENCE` secret, the Zero Trust team domain (a value for `astro.config.mjs`), HSTS, the www redirect, `.dev` preview domain, and Turnstile widget hostnames.
