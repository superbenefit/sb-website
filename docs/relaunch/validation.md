# Stage 1 validation (2026-11-20)

Checked against current docs, package source and local test builds. Each topic was validated by one agent and re-checked by a second. Verdicts: ✅ confirmed, ❌ wrong, 🔁 changed, ❓ unverified. Nothing touched the Cloudflare account; no application code changed.

Versions tested: astro 7.4.13, @astrojs/cloudflare 14.4.9, wrangler 4.166.0, emdash 1.5.0 (npm latest, tag 549c6b5; source also read at main 438b2f9).

## What changes the plan

1. **Upgrade first, as one step.** astro 7.0.9 → 7.4.13, adapter 14.1.3 → 14.4.9 (peers astro ^7.4, wrangler ^4.125), wrangler → ≥4.135 (needed for Worker Previews), sharp ≥0.35.5, Node engine ≥22.23.4. Build and `astro check` pass on the upgraded set. [adapter changelog](https://raw.githubusercontent.com/withastro/astro/main/packages/integrations/cloudflare/CHANGELOG.md)
2. **`prerenderEnvironment: 'node'` must go, but only after the upgrade.** EmDash's D1/R2 adapters import `cloudflare:workers` and fail to build under `node`. On the pinned 14.1.3, removing it makes every page build as the 15-byte string `[object Object]` with exit code 0 (tested). On 14.4.9 the default `workerd` builds all 14 pages correctly (tested). [docs](https://docs.astro.build/en/guides/integrations-guide/cloudflare/#prerenderenvironment)
3. **Build-time D1 works (EmDash question 1: resolved by test).** With `workerd`, prerendered pages and `getStaticPaths` read D1 at build. Limits: CI starts with an empty local D1, so the binding needs `"remote": true` plus `CLOUDFLARE_API_TOKEN`; an empty DB builds empty pages with no error; a remote build would run migrations and auto-seed against production unless `EMDASH_MIGRATIONS_MODE` is `check`/`manual`. ❓ A successful remote read and Workers Builds token scope were not testable without credentials. [remote bindings](https://developers.cloudflare.com/workers/local-development/#remote-bindings)
4. **Publish-triggered rebuild is possible (question 2: resolved by source).** Workers Builds has Deploy Hooks (POST URL, no auth, free plan). EmDash fires `content:afterPublish/afterUnpublish/afterDelete`; a small trusted in-process plugin can POST the hook on Workers Free. The first-party webhook-notifier plugin is the wrong tool: it fires on save, not publish. Latency is a full build (minutes). [deploy hooks](https://developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/) · [hooks](https://docs.emdashcms.com/reference/hooks/)
5. **Draft preview needs on-demand routes.** Signed `?_preview` tokens are verified per request, so any collection route editors preview cannot be prerendered. This pushes content routes to on-demand + route cache (option B/C). [preview](https://docs.emdashcms.com/guides/preview/)
6. **Route cache has costs.** `cacheCloudflare()` is experimental. Enabling Workers Cache makes every request billable, static assets included (100k/day on Free). Purges are limited to 5/min; revision restores and media changes do not purge; each deploy starts cold. [Workers Cache](https://developers.cloudflare.com/workers/cache/) · [EmDash route caching](https://docs.emdashcms.com/deployment/route-caching/)
7. **Auth (question 3: resolved by source).** The Access adapter exists and works by email identity, but it replaces passkeys entirely, must cover all of `/_emdash/*`, and then blocks public media/search unless Bypass apps are added (❓ untested). The SIWE bridge is not viable for launch: spruceid/siwe-oidc last changed 2024-07-30, builds with Wrangler v1, and returns no email or groups, which Access and EmDash both key on. EmDash has no wallet auth. Simplest secure option: built-in passkeys with `EMDASH_SITE_URL` set before setup, two admins, invites for editors. [auth guide](https://docs.emdashcms.com/guides/authentication/) · [siwe-oidc](https://github.com/spruceid/siwe-oidc)
8. **EmDash has no singleton type.** "Page singletons" become entries in a `pages` collection, or Site Settings/Menus. Seed files apply once; later schema changes go through admin or `emdash schema`. [field types](https://docs.emdashcms.com/reference/field-types/) · [schema evolution](https://docs.emdashcms.com/deployment/schema-evolution/)
9. **Even a fully prerendered EmDash site needs the Worker at runtime.** Media is served from `/_emdash/api/media/file/*` via the R2 binding (tested).
10. **EmDash sign-in uses Astro sessions on KV.** The repo's `sessionDrivers.lruCache()` override would keep admin sessions per isolate; remove it. [cloudflare deploy](https://docs.emdashcms.com/deployment/cloudflare/)
11. **docs.emdashcms.com tracks unreleased main**, 80 commits ahead of 1.5.0. Releases land every 1 to 2 weeks. Pin exact versions and check behaviour against the installed tag.

## Findings register

| ID | Verdict | Note |
| --- | --- | --- |
| S1 | ✅ | `_headers` works for prerendered pages and would work if restored. It does not apply to Worker responses (actions, EmDash routes); those need middleware or a zone rule. Draft pages also lost their `X-Robots-Tag`. [docs](https://developers.cloudflare.com/workers/static-assets/headers/) |
| S2 | 🔁 | 16 advisories confirmed. The critical one is a Sharp/AVIF RCE fixed in astro 7.2.8 ([GHSA-26w7-cxv4-gfx2](https://github.com/advisories/GHSA-26w7-cxv4-gfx2)), not the `<=7.4.6` range. Not exploitable today (local images only); it becomes real with CMS media. |
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
- **N2:** Images on live pages are not resized (adapter bug with `node` + `compile`, fixed in 14.2.0). [PR](https://github.com/withastro/astro/pull/17347)
- **N3:** Turnstile: server ignores `action` and `hostname`; widget is not reset after a failed submit, so retries fail; `.env.example` test site key is not a valid test key. [docs](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- **N4:** The comment that prerendered pages cannot read wrangler `vars` is wrong; the adapter loads them at build (tested). The wrangler var is the live source of the site key.
- **N5:** `wrangler.jsonc` `assets.directory: ./dist` is ignored; the adapter generates `dist/server/wrangler.json` pointing at `dist/client`.
- **N6:** Links to `www.allinforsport.org` (NXDOMAIN) in `about.astro:66`, `projects.astro:26`.
- **N7:** `robots.txt` comments claim a Content-Signal that is not present. `public/robots.txt` will also shadow EmDash's managed `/robots.txt`.
- **N8:** `AGENTS.md` calls fonts experimental (stable since Astro 6); manifest icon is 400×272 declared as 192×192; footer microdata block is inert.

## Best practice where the repo differs

- `output: 'static'` + adapter is the documented form for a mostly prerendered site; actions still work. [docs](https://docs.astro.build/en/guides/on-demand-rendering/)
- Trailing slashes: the 307 comes from Workers assets `html_handling`. Link to `/path/` and set `trailingSlash: 'always'`. [docs](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)
- CSP: Astro `security.csp` emits a `<meta>` tag, does not support `<ClientRouter />` (used in BaseLayout), and cannot set `frame-ancestors`. Choose: drop ClientRouter, or a header CSP with `'unsafe-inline'` styles. [docs](https://docs.astro.build/en/reference/configuration-reference/#securitycsp)
- `not_found_handling: '404-page'` is unsafe once any route is on-demand: browser navigations skip the Worker. [docs](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
- www: redirect rule plus proxied originless DNS record. [docs](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- Passkeys bind to the site hostname and its subdomains, so staging should be `staging.superbenefit.org`, not `.dev`. [docs](https://docs.emdashcms.com/guides/change-domain/)
- Email: code uses the current API. Sending to arbitrary recipients is Workers Paid; on Free the recipient must be a verified destination. [pricing](https://developers.cloudflare.com/email-service/platform/pricing/)
- CI: Workers Builds for deploy plus a PR job (`npm ci`, `check`, `build`, `audit`) and Dependabot. `compatibility_date` is a year old. [docs](https://developers.cloudflare.com/workers/ci-cd/builds/)

## Could not verify

- Anything in the Cloudflare account: plan (Free vs Paid), zone rules, DNS for www, Email Service onboarding, what `sb-auth` is.
- Remote D1 read during a real CI build, and the token scope it needs.
- Whether EmDash admin, SSR and cron fit Workers Free limits (10 ms CPU, 50 subrequests).
- Access Bypass behaviour for public `/_emdash` routes; Zero Trust free seat count.
- GitHub security advisories for emdash (API blocked; npm shows none).
- Related repos (`design-system`, `knowledge-garden`, `governance-site`) were not read: this session's GitHub scope is `sb-website` only.
