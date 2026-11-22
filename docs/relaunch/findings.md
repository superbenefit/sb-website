# Findings register

Recon at commit b643382 (2026-11-20), then validated the same day against current official docs, package source, local builds and the live site. Status is as of `feature/relaunch` after PR #18. "CMS build" means the item disappears when the page or file is rebuilt on EmDash, as `architecture.md` describes.

## Open

### Security
| ID | Finding | Resolved by |
| --- | --- | --- |
| S1 | No security headers are live; `public/_headers` was deleted in 185e9a0. `_headers` only covers static assets, not Worker responses ([docs](https://developers.cloudflare.com/workers/static-assets/headers/)). | CMS build: EmDash's middleware sets them on every public route. HSTS is an owner dashboard item. |
| S3 | `src/utils/sanitize.ts` is bypassed by `<img/onerror=…>`, unquoted `href=javascript:`, `<form action>` and nested `<scr<script></script>ipt>` (all reproduced). | CMS build: file deleted; EmDash renders Portable Text. |
| S4 | Mock update titles and the fake author "Alex Chen" are in the `<head>` of public pages such as `/updates/governance-primitives-web3/`. | CMS build: loaders and mock data deleted. |
| S5 | Branch previews on `superbenefit.dev` are public and indexable; knowledge.superbenefit.dev is an unprotected public copy. The workers.dev URL is now off. | Owner: protect this Worker's previews with Access (A5). The knowledge copy belongs to the knowledge-garden repo. |

Not checked: SPF/DKIM/DMARC, zone settings, Worker secrets, GitHub org protections.

### Code
| ID | Finding | Resolved by |
| --- | --- | --- |
| C1, C2 | Draft gating is duplicated across six pages. | CMS build: EmDash draft status. |
| C3, C4 | Two near-identical loaders; a production build with no content source silently ships mock data. | CMS build. |
| C6 | `KnowledgeSpotlight`, `UpdatesSection` and `ProjectsGrid` are imported nowhere. | Hygiene issue. |
| C10 | "Schedule an onboarding call" links to `#`. | Content. |
| C11 | No tests, lint or Dependabot. Workers Builds builds, type-checks and previews every branch (A1). | Dependabot: decided at launch. |
| N8 | `manifest.json` declares a 192×192 icon that is 400×272. The hidden microdata block in `Footer.astro` has no `itemscope` and does nothing. | Design and hygiene. |
| R1 | EmDash does not assign roles from GitHub teams. It resolves the role from the Access identity's `groups` only (`@emdash-cms/cloudflare` 1.5.0 and `main`); with GitHub sign-in, Access returns `orgs` and `teams` and no `groups` (owner's `get-identity` on the B4 preview, 2026-11-22). Neither EmDash's nor Cloudflare's docs give a setting for it. | Owner decision: an Admin sets roles under Users; the `roleMapping` stays in the code; an upstream issue is drafted for the owner to file. Recheck when EmDash is upgraded. |
| M1 | The content model in `architecture.md` names two fields EmDash 1.5.0 reserves: `status` (projects) and `terms` (services). `RESERVED_FIELD_SLUGS` in `emdash/src/schema/types.ts` lists both (an entry's publish status and its taxonomy terms), and `emdash seed --validate` rejects the seed with `field slug "status" is reserved` and `field slug "terms" is reserved`. | B5 (#32): the fields are `project_status` and `service_terms`, labels unchanged; recorded in `architecture.md`, Content model. Pages read those slugs. |
| P2 | EmDash's sitemap URLs differ from the site's canonical URLs (EmDash 1.5.0, local `npm run dev` on a fresh database, 2026-11-22). (1) Sitemap URLs have no trailing slash (`/about`, `/projects/demo-project`): under `trailingSlash: 'ignore'` EmDash writes the pattern URL as it is (`resolveLocalizedContentRoutePath` in `i18n/resolve.ts`), while `BaseLayout` writes the canonical with the slash (`/about/`); both forms answer 200. (2) The home entry is listed as `/home`, which answers 301 to `/`. (3) `/` is not listed: the sitemap lists only published entries with a slug, at their pattern URL (`api/handlers/seo.ts`). | Recorded (B6, #33); not changed. `architecture.md`, Content model, URLs and previews. |
| K1 | Route caching cannot be shown end to end locally. Under `astro preview` workerd runs no Workers Cache (no `Cf-Cache-Status`), `cache.purge` from `cloudflare:workers` is not a function, and admin writes need an Access JWT; under `astro dev` nothing is cached and EmDash skips the purge (B6, 2026-11-22). Cloudflare: local tests do not exercise Workers Caching ([limitations](https://developers.cloudflare.com/workers/cache/limitations/#local-tests)). | Checked on the B6 preview by the owner (`issues.md`, B6 notes). Headers, tags and the preview and error-page opt-outs are verified locally. |
| K2 | A public route with no route rule is still cached. The layout, `Header`, `Footer` and `ClosingBand` pass tag-only cache hints; Astro 7.4.13 treats any tag as cache intent (`runtime/cache.js`), the Cloudflare provider then sends `Cloudflare-CDN-Cache-Control: public` with no `max-age` (`provider-utils.js`), and `@astrojs/cloudflare` 14.4.9 adds `no-store` only when that header is missing (`utils/response.js`). Cloudflare applies heuristic TTLs to responses without explicit freshness ([configuration](https://developers.cloudflare.com/workers/cache/configuration/#cache-control-semantics)), and the page carries no collection tag, so a publish does not purge it. Reproduced with a temporary `/norule/` page under `astro preview` (B6 review, 2026-11-22). Every route that exists has a rule. | Documented (B6, #33): each new public route adds its rule in the same change (`AGENTS.md`, `architecture.md` Caching, `astro.config.mjs`). Owner option: pass the layout's hints only once a rule has set `maxAge`, which no doc shows. |
| L1 | With Access sign-in, the admin's Log out button only ends EmDash's session; the Access session remains, so the page reloads signed in (EmDash 1.5.0, `routes/api/auth/logout.ts`; reported by the owner on the B4 preview, 2026-11-22). | No setting in 1.5.0. Sign out at `/cdn-cgi/access/logout`. Recheck when EmDash is upgraded. |
| G1 | The legacy base rules in `src/styles/global.css` differ from `mockups.css`'s base, so mockup parts render wrong unless each overrides them. `a` is orange and turns red on hover (mockups: `a { color: inherit }`), `p` has `max-width: 70ch` and `h1` to `h4` set `color: var(--color-charcoal)` (mockups: neither). Seen on the C6 pages: card titles, entry titles and the `more` links came out orange (C6, 2026-11-22). | C6 overrides the link colour in its own parts (`ProjectCard`, `EntryList`, the project page). Not changed in `global.css` (other pages are built in parallel); fixing the base rules once would let the overrides go. |

### SEO
- No `<h1>` on the homepage; title is "Make Better Faster".
- `/sitemap.xml` comes from EmDash since B2 and lists nothing until pages read EmDash content.
- Homepage has hidden links to noindexed drafts.
- governance.superbenefit.org's canonical points to governance.superbenefit.dev (fleet).
- `/robots.txt` comes from EmDash since B2. Until the "Disallow AI training" setting is on (D2) it no longer lists the AI training crawlers the old `public/robots.txt` blocked.
- No analytics.
- Not checked: the claim that the brand query "SuperBenefit DAO" surfaces Notion, Flowershow and Goverland ahead of superbenefit.org.

### Content
- Old messaging throughout; nothing on the accelerator, local capacity building, Pacto or ICS.
- Owner to confirm or cut: "Governance Innovation Lab", the "NFT Energy Labeling Experiment" description, the service SLAs and $5,000 tiers.
- Links are consistent inside this repo (one Discord invite, Paragraph only). Across the fleet they are not: two Discord invites, Mirror and Paragraph, knowledge `.org` and `.dev`.

## Fixed
| ID | Finding | Fixed in |
| --- | --- | --- |
| S2 | 16 `npm audit` advisories, one critical (Sharp/AVIF, [GHSA-26w7-cxv4-gfx2](https://github.com/advisories/GHSA-26w7-cxv4-gfx2)). | PR #18: all dependencies upgraded, 0 advisories. |
| S6 (part) | `errorBanner.innerHTML = error.message`. | PR #18. |
| S6 | Server misconfiguration messages, including a `wrangler secret put` hint, were shown to visitors. | A3 (#25): visitors get a generic message; the detail goes to the Worker log with `console.error`. |
| S7 | Contact `subject` and `name` kept CR/LF; no rate limit beyond Turnstile. No classic header injection, because the email API takes structured fields. | A3 (#25): CR/LF in either field is a field error; a [`ratelimits` binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) allows 5 posts per client IP per 60 seconds. |
| S8 | `.mcp.json` named an npm package that does not exist. | Now the [documented](https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/) HTTP server. |
| C11 (part) | `compatibility_date` was 2025-12-01. | A2 (#24): 2026-11-17, the newest date the installed local runtime (`workerd` 1.20261117.1, used by `astro preview`) supports. |
| C7 | Stale comments: `.opencode` reference, `nav.ts` duplication note, "Astro v6". | Comments corrected. |
| N2 | Images were shipped unresized (adapter bug, fixed in 14.2.0). | PR #18. |
| N5 | The `assets` block in `wrangler.jsonc` was ignored; the adapter generates its own. | B2 (#29): block removed. |
| N1 | JSON-LD used `set:html={JSON.stringify(…)}` (`SEO.astro`, `BaseLayout.astro`, both `updates` pages); a title containing `</script>` broke out ([docs](https://docs.astro.build/en/reference/directives-reference/#sethtml)). | C1 (#35): `<EmDashHead>` writes the JSON-LD (`WebSite` on pages, `BlogPosting` on articles) with EmDash's escaping; every `set:html` JSON-LD block is removed. The `Organization` and `BreadcrumbList` blocks are not replaced. |
| C9 | `WebSite` schema had a `SearchAction` for a search that does not exist. | C1 (#35): EmDash's `WebSite` JSON-LD has none. |
| SEO (part) | `404.html` and `500.html` set their canonical to `/404/` and `/500/`, which 307 to `/404` and `/500`. | C1 (#35): the error pages render on demand at the requested URL and write no canonical. |
| P1 | Draft preview links for `pages`, `services` and `supports` went nowhere, and the sitemap would have listed `/pages/<slug>`, `/services/<slug>` and `/supports/<slug>`. The admin's preview link uses the collection's `urlPattern`, else `/{collection}/{id}`; the sitemap lists every routable collection with `seo` support, at its pattern or `/{collection}/{slug}` (`emdash` 1.5.0 `routes/api/content/_collection_/_id_/preview-url.ts`, `api/handlers/seo.ts`). The seed gave patterns to `projects` and `updates` only (B6, 2026-11-22). | B6 (#33): `pages` has `urlPattern: "/{slug}"`; `services` and `supports` are `routable: false` with `urlPattern` `/services` and `/accelerator`, so they are out of the sitemap and preview on the page that lists them; `src/pages/home.astro` 301s `/home` to `/` with the query string, so the home entry's preview link reaches `/` with its token. Verified locally on a fresh database (`architecture.md`, Content model, URLs and previews). Previews on staging need the staging database set up again with the new seed. |
| T1 | With `trailingSlash: 'always'` (A4), the EmDash admin did not work: `/_emdash/admin/` redirected to `/_emdash/admin/setup`, which returned 404, and `/_emdash/api/setup/status` returned 404 while `/_emdash/api/setup/status/` returned 200 (local `astro preview`, EmDash 1.5.0, 2026-11-21). Astro skips its trailing-slash redirect for paths starting with `/_` (`isInternalPath` in `@astrojs/internal-helpers`) but still matches routes against the setting. With Astro's default `trailingSlash: 'ignore'` the wizard, sign-in and a media upload all worked. | B2 (#29), owner decision 2026-11-22: `trailingSlash: 'ignore'`, Astro's [default](https://docs.astro.build/en/reference/configuration-reference/#trailingslash), which EmDash's official templates also use. Verified locally on 2026-11-22: `/_emdash/admin` and `/_emdash/admin/` redirect to `/_emdash/admin/setup` (200), and `/_emdash/api/setup/status` returns 200 with and without the slash. Prerendered pages are still redirected to the slash form by Workers assets [`html_handling`](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/); once pages render on demand, both `/about` and `/about/` answer 200 (see `architecture.md`, Stack). |
| N7 | `public/robots.txt` comments claimed a Content-Signal the file did not contain. | B2 (#29): file removed; EmDash serves `/robots.txt`. |
| N3 | Turnstile failed on any return visit to `/contact/` and after a rejected submission; `.env.example` had an invalid test site key. | PR #18: explicit rendering. |
| N4 | Comments said prerendered pages cannot read `wrangler.jsonc` vars. They can: the adapter loads them at build (tested). | Comments and docs corrected. |
| N8 (part) | `AGENTS.md` called the fonts API experimental. | Corrected. |
| SEO (part) | Internal links used the extensionless form, which 307s to the trailing-slash form (Workers assets [`html_handling`](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)). | A4 (#26): every internal link ends in `/`. A4 also set `trailingSlash: 'always'`; since 2026-11-22 it is `'ignore'` (T1). |
| N6 | Links to `www.allinforsport.org`, which does not resolve, in `about.astro` and `projects.astro`. | A4 (#26): links point at the apex. |
| C5 | `projects.astro` hardcoded its projects and ignored the collection. | C6 (#40): `/projects/` lists the EmDash `projects` collection and `/projects/{slug}/` reads the entry; no hard-coded projects and no draft gating remain on those pages. |

## Withdrawn
- Footer entity wording ("Worker Self-Directed Non-Profit Digital LLC") is correct as written. Do not re-raise.
- Checking Turnstile's `action` and `hostname` on the server. Cloudflare's docs show it as optional; it is not a defect.
