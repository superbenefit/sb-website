# Stage 2 architecture (proposed 2026-11-20)

One page. Every choice follows the official docs linked; `validation.md` has the evidence. Items marked **(you)** are owner decisions, listed at the end.

## Stack
Astro 7.4 + `@astrojs/cloudflare` 14.4 on Workers Paid, EmDash on D1 (`DB`) + R2 (`MEDIA`) + KV (`SESSION`), set up exactly as [Deploy to Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/) describes: `output: "server"`, `cloudflare()` with no options, `src/worker.ts` with the scheduled handler, every-minute cron.

## Rendering per route
| Route | Mode | Content source |
| --- | --- | --- |
| `/` | on demand, cached | `pages` entry `home`, featured `projects`, latest `updates` |
| `/accelerator/` **(you: URL)** | on demand, cached | `pages` entry + `supports` |
| `/services/` | on demand, cached | `pages` entry + `services` |
| `/projects/`, `/projects/{slug}/` | on demand, cached | `projects` |
| `/updates/`, `/updates/{slug}/` **(you: source)** | on demand, cached | `updates` |
| `/about/` **(you: keep?)** | on demand, cached | `pages` entry |
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
| `updates` | `/updates/{slug}` | title, excerpt (text), cover (image), body, project (reference to `projects`), source_url (url, for cross-posts) |
| `pages` | fixed routes above | title, intro (text), body, cta_label, cta_url |

EmDash has no singleton type, so each fixed page is one `pages` entry looked up by slug. Site title, tagline, social handles and the AI-training opt-out live in [Site Settings](https://docs.emdashcms.com/guides/site-settings/); header and footer links in [Menus](https://docs.emdashcms.com/guides/menus/). Rich text is Portable Text rendered by EmDash's components, so `src/utils/sanitize.ts`, both loaders and the mock JSON are deleted.

## Auth
[Cloudflare Access](https://docs.emdashcms.com/guides/authentication/#cloudflare-access): one application on `superbenefit.org/_emdash/*`, `access({ teamDomain, audienceEnvVar: "CF_ACCESS_AUDIENCE", roleMapping })`, `defaultRole: 20` (Contributor) so nobody can publish without being mapped to Editor or Admin. **(you: sign-in method and who the editors are)**

## Security headers
`_headers` does not apply to Worker responses ([docs](https://developers.cloudflare.com/workers/static-assets/headers/)), and every page is now a Worker response. So:
- Astro middleware sets HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and `frame-ancestors` on public routes. `/_emdash/*` is left to EmDash.
- `public/_headers` sets `X-Content-Type-Options` for static assets.
- CSP through Astro's [`security.csp`](https://docs.astro.build/en/reference/configuration-reference/#securitycsp), allowing `challenges.cloudflare.com` for Turnstile. It does not support `<ClientRouter />`, so ClientRouter is removed and page transitions use the browser-native CSS `@view-transition`, which the [Astro docs](https://docs.astro.build/en/guides/view-transitions/) describe as the alternative. This also removes the class of bug behind the Turnstile fix.
- JSON-LD comes from `<EmDashHead>`, which removes the unescaped `set:html` blocks (finding N1).

## Environments and CI
- `main` deploys to superbenefit.org through Workers Builds (already connected). `feature/relaunch` and PR branches get [Worker Previews](https://docs.emdashcms.com/deployment/cloudflare/#preview-deployments) with their own D1, R2 and KV, protected by Access.
- GitHub Actions on every PR: `npm ci`, `npm run check`, `npm run build`, `npm audit --omit=dev`. Dependabot weekly for npm.
- `compatibility_date` moves to the current date. www gets a 301 redirect rule to the apex.
- **(you: `.dev` domains)**

## Not decided by this page
Copy, the services that survive, what to say about Pacto, canonical social links and the AI-crawler policy are content decisions for Stage 4. Fleet fixes (governance canonical, unidentified Workers) are last in the order.

## Could not verify before building
- Whether EmDash's admin sets its own CSP, and the exact hashes the toolbar needs.
- Access in front of public media under `/_emdash/api/media/file/*`. The docs say image transforms keep working behind Access; a first-deploy check confirms it.

## Decisions that are yours
1. How editors sign in through Access, and who they are.
2. `/accelerator/` or `/supports/`.
3. Updates: written in EmDash, or cross-posted from Paragraph.
4. Keep `/about/`.
5. `.dev` domains: retire, or redirect to `.org`.
