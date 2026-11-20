# Stage 1 validation (2026-11-20)

Checked against current docs, package source and local test builds. Each topic was validated by one agent and re-checked by a second. Verdicts: ✅ confirmed, ❌ wrong, 🔁 changed, ❓ unverified. Nothing touched the Cloudflare account; no application code changed.

Versions tested: astro 7.4.13, @astrojs/cloudflare 14.4.9, wrangler 4.166.0, emdash 1.5.0 (npm latest, tag 549c6b5; source also read at main 438b2f9).

## What changes the plan

1. **Dependencies are upgraded** (PR `chore/dependency-upgrade`): astro 7.4.13, @astrojs/cloudflare 14.4.9, wrangler 4.166.0, sharp 0.35.5, TypeScript 6.0.3, Node 24. `npm audit` reports 0 advisories. Version ranges are caret ranges with a committed lockfile, as in Astro's and EmDash's own templates.
2. **Use the EmDash Cloudflare setup exactly as documented.** [Deploy to Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/):
   - `astro.config.mjs`: `output: "server"`, `adapter: cloudflare()` with no options, `react()`, `emdash({ database: d1({ binding: "DB" }), storage: r2({ binding: "MEDIA" }) })`.
   - `wrangler.jsonc`: `main: ./src/worker.ts`, `d1_databases` `DB` and `r2_buckets` `MEDIA` by name (Wrangler creates both on first deploy), `triggers.crons: ["* * * * *"]`.
   - `src/worker.ts`: the documented entry from `@emdash-cms/cloudflare/worker` with `createScheduledHandler()`.
   - Pages call `getEmDashCollection` / `getEmDashEntry` and render on the Worker at request time. Migrations apply on first request.
3. **Repo settings that conflict with that and go:** `prerenderEnvironment: 'node'`, the custom `imageService` object, the `sessionDrivers.lruCache()` override (EmDash sign-in uses the adapter's `SESSION` KV binding), the `assets` block in `wrangler.jsonc` (the adapter generates it), and `public/robots.txt` (it shadows EmDash's managed `/robots.txt`).
4. **Caching: Workers Cache, as documented.** `cache: { provider: cacheCloudflare() }` plus one `routeRules` entry per public route, tagged with the collection names it renders. Pages pass `cacheHint` to `Astro.cache.set()`. EmDash purges those tags on publish, so edits show within seconds and cache hits do not run the Worker. Enable `revisions` on collections and set `toolbar: "client"`. [Route caching](https://docs.emdashcms.com/deployment/route-caching/)
5. **Auth: Cloudflare Access, as documented.** One Access application and policy on `superbenefit.org/_emdash/*`; AUD tag stored with `wrangler secret put CF_ACCESS_AUDIENCE`; `auth: access({ teamDomain, audienceEnvVar: "CF_ACCESS_AUDIENCE", roleMapping })`. Access is then the only sign-in method in production; `astro dev` falls back to passkeys. Users are created on first login; `defaultRole` is 30 (Author, can publish own content). No SIWE. [Authentication](https://docs.emdashcms.com/guides/authentication/#cloudflare-access)
6. **Preview and staging: Worker Previews**, with their own D1, R2 and KV in a `previews` block, never production bindings. [Preview deployments](https://docs.emdashcms.com/deployment/cloudflare/#preview-deployments)
7. **Content model: EmDash has no singleton type.** "Page singletons" become entries in a `pages` collection, or Site Settings and Menus. The seed file applies once; later schema changes go through admin or `emdash schema`. [field types](https://docs.emdashcms.com/reference/field-types/) · [schema evolution](https://docs.emdashcms.com/deployment/schema-evolution/)
8. **Workers Paid (confirmed by owner 2026-11-20)** removes the Free-plan CPU and request limits as a concern and allows Email Sending to arbitrary recipients and sandboxed plugins.
9. **docs.emdashcms.com tracks unreleased main**, 80 commits ahead of npm 1.5.0. Check doc-derived behaviour against the installed version.

## Findings register

| ID | Verdict | Note |
| --- | --- | --- |
| S1 | ✅ | `_headers` works for prerendered pages and would work if restored. It does not apply to Worker responses (actions, EmDash routes); those need middleware or a zone rule. Draft pages also lost their `X-Robots-Tag`. [docs](https://developers.cloudflare.com/workers/static-assets/headers/) |
| S2 | 🔁 fixed | 16 advisories confirmed; 0 after the upgrade. The critical one is a Sharp/AVIF RCE fixed in astro 7.2.8 ([GHSA-26w7-cxv4-gfx2](https://github.com/advisories/GHSA-26w7-cxv4-gfx2)), not the `<=7.4.6` range. Not exploitable today (local images only); it becomes real with CMS media. |
| S3 | ✅ | All four bypasses reproduce. EmDash's Portable Text renderer sanitizes its own HTML blocks, so the regex sanitizer can be deleted with the loaders. |
| S4 | 🔁 | No lorem body is public, but mock titles and the fake author "Alex Chen" are in live page heads. Production build should fail without a content source. |
| S5 | ✅ | superbenefit.dev and the workers.dev URL serve unprotected copies. |
| S6 | ✅ | Not exploitable now (fixed strings). Also leaks a `wrangler secret put` hint to visitors on misconfiguration. |
| S7 | 🔁 | No classic header injection (structured API, no MIME built). Still strip CR/LF; add a `ratelimits` binding. [docs](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) |
| S8 | ✅ | Package 404s. Use `https://docs.mcp.cloudflare.com/mcp`. [docs](https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/) |
| C1–C6, C9–C11 | ✅ | As recorded. |
| C7 | 🔁 | Two of three comments are stale; the `cloudflare:workers` note is correct. |
| SEO items | ✅ | All confirmed live except the brand-query claim (❓ not checked). |
| Content links | 🔁 | This repo is internally consistent (one Discord invite, Paragraph only). The inconsistency is across the fleet. |

## New findings

- **N1 High with CMS:** JSON-LD is rendered with `set:html={JSON.stringify(...)}` (`SEO.astro:111`, `updates/[...slug].astro:48`). A title containing `</script>` breaks out. Escape `<` before any CMS feeds these. [set:html](https://docs.astro.build/en/reference/directives-reference/#sethtml)
- **N2 (fixed by the upgrade):** Images on live pages were not resized (adapter bug with `node` + `compile`, fixed in 14.2.0). [PR](https://github.com/withastro/astro/pull/17347)
- **N3:** Turnstile: server ignores `action` and `hostname`; widget is not reset after a failed submit, so retries fail; `.env.example` test site key is not a valid test key. [docs](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- **N4:** The comment that prerendered pages cannot read wrangler `vars` is wrong; the adapter loads them at build (tested). The wrangler var is the live source of the site key.
- **N5:** `wrangler.jsonc` `assets.directory: ./dist` is ignored; the adapter generates `dist/server/wrangler.json` pointing at `dist/client`.
- **N6:** Links to `www.allinforsport.org` (NXDOMAIN) in `about.astro:66`, `projects.astro:26`.
- **N7:** `robots.txt` comments claim a Content-Signal that is not present. `public/robots.txt` will also shadow EmDash's managed `/robots.txt`.
- **N8:** `AGENTS.md` calls fonts experimental (stable since Astro 6); manifest icon is 400×272 declared as 192×192; footer microdata block is inert.

## Best practice where the repo differs

- Trailing slashes: the 307 comes from Workers assets `html_handling`. Link to `/path/` and set `trailingSlash: 'always'`. [docs](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)
- CSP: Astro `security.csp` emits a `<meta>` tag, does not support `<ClientRouter />` (used in BaseLayout), and cannot set `frame-ancestors`. Choose: drop ClientRouter, or a header CSP with `'unsafe-inline'` styles. [docs](https://docs.astro.build/en/reference/configuration-reference/#securitycsp)
- `not_found_handling: '404-page'` is unsafe once any route is on-demand: browser navigations skip the Worker. [docs](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
- www: redirect rule plus proxied originless DNS record. [docs](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- Email: the contact action uses the current API. EmDash's own mail uses the documented `cloudflareEmail` plugin on the same `EMAIL` binding. [docs](https://docs.emdashcms.com/deployment/cloudflare/#email)
- CI: Workers Builds for deploy plus a PR job (`npm ci`, `check`, `build`, `audit`) and Dependabot. `compatibility_date` is a year old. [docs](https://developers.cloudflare.com/workers/ci-cd/builds/)

## Could not verify

- Anything in the Cloudflare account other than the plan: zone rules, DNS for www, Email Service onboarding, the Zero Trust team domain, what `sb-auth` is.
- The documented setup was read, not deployed. First deploy should follow the docs' own checklist: public page, `/_emdash/admin` sign-in through Access, media upload and retrieval, cron in `wrangler tail`.
- GitHub security advisories for emdash (API blocked; npm shows none).
- Related repos (`design-system`, `knowledge-garden`, `governance-site`) were not read: this session's GitHub scope is `sb-website` only.
