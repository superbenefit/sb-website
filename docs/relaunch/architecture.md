# Architecture (decided 2026-11-20)

The design the relaunch builds. Every choice follows the official docs linked. Owner decisions are recorded at the end. The CMS install runs on a branch preview (2026-11-22); production is not deployed until launch. See First-deploy checks.

## Stack
Astro 7.4 + `@astrojs/cloudflare` 14.4 on Workers Paid, with EmDash on D1 (`DB`), R2 (`MEDIA`) and KV (`SESSION`). Set up exactly as [Deploy to Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/) describes:
Installed in B2 (#29) with `emdash` and `@emdash-cms/cloudflare` 1.5.0, `@astrojs/react`, `react` and `react-dom`:
- `astro.config.mjs`: `output: "server"`, `adapter: cloudflare()` with no options, `react()`, `emdash({ database: d1({ binding: "DB" }), storage: r2({ binding: "MEDIA" }) })`. No `sandboxRunner`: the guide drops it, with the `LOADER` binding, for a site with no marketplace, registry or sandboxed plugins.
- `wrangler.jsonc`: `main: ./src/worker.ts`, the `DB` (`sb-website`) and `MEDIA` (`sb-website-media`) bindings by name (Wrangler creates both on first deploy), the `EMDASH_ROOMS` Durable Object binding with the `exports` entry for `EmDashRoom` (co-editing rooms; co-editing stays off until `coEditing: true`), `triggers.crons: ["* * * * *"]`, and `EMDASH_SITE_URL` in `vars`. The adapter adds the `SESSION` KV and `IMAGES` bindings to the config it generates (`dist/server/wrangler.json`), at the top level and in `previews`.
- `src/worker.ts`: the documented entry from `@emdash-cms/cloudflare/worker`: the spread default handler with `createScheduledHandler()`, and the `EmDashRoom`, `EmDashRoomSite` and `PluginBridge` exports. `emdash doctor` reports the scheduler wiring as found.
- `src/live.config.ts` with `emdashLoader()`.
- `tsconfig.json` lists `./worker-configuration.d.ts` in `compilerOptions.types`, as Cloudflare's [TypeScript guide](https://developers.cloudflare.com/workers/languages/typescript/) says, so `src/worker.ts` type-checks against the Workers runtime types. Secrets are declared in `src/env.d.ts`.

Settings that conflicted with this were removed in B2: `prerenderEnvironment: 'node'`, the custom `imageService` object (the adapter default, the `IMAGES` binding, now transforms images at build and on demand), the `sessionDrivers.lruCache()` override (EmDash sign-in uses the adapter's KV sessions), the `assets` block in `wrangler.jsonc`, `@astrojs/sitemap` (with its draft filter) and `public/robots.txt`. `/sitemap.xml` and `/robots.txt` now come from EmDash, and the layout's `<link rel="sitemap">` points at `/sitemap.xml`. The existing pages are still prerendered and still read the legacy loaders until the page issues replace them.

docs.emdashcms.com tracks unreleased `main`, ahead of the npm release (1.5.0 on 2026-11-20). Check doc-derived behaviour against the installed version.

URLs (owner decision, 2026-11-22; finding T1): `trailingSlash: 'ignore'`, Astro's default ([`trailingSlash`](https://docs.astro.build/en/reference/configuration-reference/#trailingslash): "Match URLs regardless of whether a trailing '/' exists"). A4 had set `'always'`, under which every `/_emdash/` URL without a trailing slash returned 404, and the EmDash admin uses those URLs (it redirects to `/_emdash/admin/setup` and calls `/_emdash/api/...`). EmDash's docs say nothing about `trailingSlash`, and its [official templates](https://github.com/emdash-cms/emdash/tree/main/templates) set none. Consequences:
- Internal links still end in `/`.
- Prerendered pages: Astro does not control their trailing slash ("Trailing slashes on prerendered pages are handled by the hosting platform"). Workers static assets' default [`html_handling`](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/) still 307s `/about` to `/about/`.
- On-demand pages, once the page issues render them on demand: both `/about` and `/about/` answer 200. `Astro.url.pathname` keeps the form requested, which `SEO.astro` builds the canonical from and `isNavLinkActive` (`src/utils/nav.ts`) compares against `/about/`.
- EmDash reads the host setting (`emdash/dist/astro/index.mjs`, 1.5.0). Under `'ignore'` it leaves the URLs it builds for content (sitemap, menus) as the collection's URL pattern gives them, without a trailing slash.
- Verified locally (`astro preview`, EmDash 1.5.0, 2026-11-22): `/_emdash/admin` and `/_emdash/admin/` 302 to `/_emdash/admin/setup`, which returns 200 with and without the slash; `/_emdash/api/setup/status` returns 200 with and without the slash.

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
[Cloudflare Access](https://docs.emdashcms.com/guides/authentication/#cloudflare-access) with GitHub as the identity provider. Configured in B4 (#31); checked against the installed `@emdash-cms/cloudflare` and `emdash` 1.5.0 (`@emdash-cms/cloudflare/dist/auth/index.mjs`, `emdash/dist/astro/middleware/auth.mjs`).

| Who | Gets in because | EmDash role |
| --- | --- | --- |
| Members of the SuperBenefit GitHub org (not outside collaborators) | Access policy | Contributor (20): writes drafts, cannot publish |
| Members of the "Knowledge Stewardship" GitHub team | Access policy | Editor (40): manages and publishes all content; no settings or users |
| Members of the "Web Admins" GitHub team | Access policy | Admin (50) |

**In code** (`astro.config.mjs`), exactly as the guide shows: `auth: access({ teamDomain: "superbenefit.cloudflareaccess.com", audienceEnvVar: "CF_ACCESS_AUDIENCE", defaultRole: 20, roleMapping: { "Web Admins": 50, "Knowledge Stewardship": 40 } })`. 1.5.0 reads every option the [configuration reference](https://docs.emdashcms.com/reference/configuration/) lists: `teamDomain`, `audience`, `audienceEnvVar`, `defaultRole` and `roleMapping` in the adapter, `autoProvision`, `syncRoles` and `syncName` in the middleware. The last three keep their defaults (`true`, `false`, `true`). The AUD tag is the Worker secret `CF_ACCESS_AUDIENCE`, read from `process.env` at request time. It is never written into the repo, `vars` or `.env.example`.

**How a request is authenticated** (production build, `/_emdash/admin*` and every `/_emdash/api/*` route that is not public):
1. The JWT is taken from the `Cf-Access-Jwt-Assertion` header, else the `CF_Authorization` cookie. None: 401.
2. It is verified with `jose` against `https://superbenefit.cloudflareaccess.com/cdn-cgi/access/certs`: issuer `https://superbenefit.cloudflareaccess.com`, audience `CF_ACCESS_AUDIENCE`, 60 seconds clock tolerance.
3. Groups do not come from the JWT. EmDash calls `https://superbenefit.cloudflareaccess.com/cdn-cgi/access/get-identity` with the JWT and reads `groups` from the reply.
4. Role: EmDash walks `groups` in the order Access returns them and looks up each group's `name` as a key of `roleMapping` (`roleMapping[group.name]`). The first hit wins; no hit gives `defaultRole`. The comparison is exact: case, spaces and punctuation must match, and the group `id` is never compared. So the key `"Web Admins"` matches only a group whose `name` is exactly `Web Admins`, and likewise `"Knowledge Stewardship"`. Someone in both teams gets whichever team Access lists first, so they may land on Editor; an Admin promotes them in EmDash and it sticks.
5. The user is found by the identity's email. A new email gets an account (`autoProvision`) with that role, except that the first user in an empty `users` table is always Admin. An existing user keeps the role stored in EmDash (`syncRoles: false`), so admins can promote Contributors to Editor and it sticks, and a later change of GitHub team does not change anyone's role. The name is refreshed from Access on each request (`syncName`).

Any failure in steps 1 to 4 returns 401 with the plain-text body `Authentication failed`. EmDash does not redirect to the Access login; Access does that at the edge before the request reaches the Worker. The Worker log line says why: `[external-auth] Auth error: Error: No Access JWT present`, `... Environment variable "CF_ACCESS_AUDIENCE" not found or empty ...`, or a `jose` error. The adapter also logs `[cf-access] Identity from Access:` with the email and the group names it received.

**What does not ask for the JWT.** The public pages, `/sitemap.xml`, `/robots.txt` and `/_image` are outside `/_emdash/admin` and `/_emdash/api`, so the middleware only reads an existing session there. EmDash's own public API routes (`/_emdash/api/media/file/*`, `/_emdash/api/comments/*`, `/_emdash/api/search`, `/_emdash/api/health` and the setup and auth endpoints) skip the JWT check in the Worker too. On production they are still behind Access at the edge unless the Bypass application below exempts them. `/_emdash/admin/setup` and `/_emdash/api/setup*` also skip it: under Access the wizard has no administrator step and finishes setup on its own (`astro/routes/api/setup/index.ts`).

**Verified locally (2026-11-22, `astro preview` of the production build under workerd, after completing setup):**
- `/`, `/contact/`, `/sitemap.xml` and `/robots.txt` return 200.
- `/_emdash/admin`, `/_emdash/admin/`, `/_emdash/api/auth/me` and `/_emdash/api/content/posts` without a JWT return 401 `Authentication failed`, with and without `CF_ACCESS_AUDIENCE` in the generated `dist/server/wrangler.json`. With it missing, a request carrying a JWT logs the "not found or empty" error.
- A JWT with the right issuer and audience signed by a key that is not Cloudflare's, sent as the header or as the cookie, returns 401 and logs `JWKSNoMatchingKey: no applicable key found in the JSON Web Key Set` (the Worker fetched the team's real key set). A malformed header returns 401 and logs `JWSInvalid`.
- `/_emdash/api/search` returns 200 and `/_emdash/api/media/file/<missing>` returns 404 without a JWT: the Worker does not gate them.
- Not testable here: a real Access sign-in, the group names Access sends for GitHub, and the roles that follow. These are the owner's checks below.

**Local development.** The guide says EmDash "falls back to passkey authentication" in development. In 1.5.0 it does not, in practice: with `auth` set, `npm run dev` on an empty database shows a setup wizard that says "You're signed in via Cloudflare Access" and creates no passkey; `/_emdash/admin` then sends the browser to `/_emdash/admin/login`, whose page sees `authMode: "cloudflare-access"` and sends it back, in a loop (17 reloads in 15 seconds, no passkey prompt); and Settings > Security says "Passkey settings are not available when using external authentication". Local sign-in uses the documented development bypass instead ([CLI reference](https://docs.emdashcms.com/reference/cli/), [contributing](https://docs.emdashcms.com/contributing/)): after finishing the wizard, open `http://localhost:4321/_emdash/api/auth/dev-bypass?redirect=/_emdash/admin`. It creates `dev@emdash.local` as Admin and signs it in; it answers 403 outside `astro dev`. Verified with Playwright and a virtual authenticator (no credential was ever requested). Roles from Access cannot be tested locally.

**The three Access applications** (owner, dashboard; set up 2026-11-22). There are no others.

| # | Protects | Policy | Login | `CF_ACCESS_AUDIENCE` | In use |
| --- | --- | --- | --- | --- | --- |
| 1 | Every branch preview (`*.superbenefit.dev`) | Allow | GitHub | Previews Base secret | now |
| 2 | The CMS on the live site, `superbenefit.org/_emdash/*` | Allow | GitHub | Production secret | from launch |
| 3 | Public media on the live site, `superbenefit.org/_emdash/api/media/file/*` | Bypass, Everyone | none | not used | from launch |

Applications 1 and 2 were first reached through Cloudflare's own login ([Cloudflare as identity provider](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/cloudflare/), the default for a new Zero Trust organization). With that login the identity's `groups` are the person's Cloudflare accounts, not GitHub teams, so no `roleMapping` key can match. The owner switched both to GitHub on 2026-11-22; signed out, both now show a GitHub sign-in page (checked from outside, 2026-11-22).

**Signing out.** The admin's Log out button ends EmDash's session only (`routes/api/auth/logout.ts`); the Access session is still valid, so the page reloads signed in. To sign out, open `/cdn-cgi/access/logout` on the same hostname ([Cloudflare](https://developers.cloudflare.com/cloudflare-one/faq/authentication-faq/)). EmDash 1.5.0 has no setting for this.

**On the Cloudflare side**, in detail (see Ownership and `issues.md`, B3 step by step):
- Previews: the whole preview hostname is already behind the previews Access application (A5), so every request carries its JWT. The Previews Base secret `CF_ACCESS_AUDIENCE` is that application's AUD tag. Previews need no Bypass application: only signed-in people can open them anyway.
- Production: an Access application for `superbenefit.org/_emdash/*` with an Allow policy for the GitHub org (Include, selector Identity provider group, which Cloudflare shows for a GitHub identity provider: [policies](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/#selectors)); its AUD tag is the production secret `CF_ACCESS_AUDIENCE`. Protecting only `/_emdash/admin/*` would leave the API without the JWT it requires (guide).
- Production: a second Access application with a Bypass policy (Include: Everyone) for `superbenefit.org/_emdash/api/media/file/*`. The more specific path wins and does not inherit the `/_emdash/*` policy ([application paths](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/)). This is the pattern both docs give: EmDash's guide asks for it, and Cloudflare says "Bypass is typically used to enable applications that require specific endpoints to be public", with a separate application for the path and Include: Everyone as its example ([policies](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/)). The path is written with `/*` because Cloudflare's path table documents only that form as covering the URLs beneath a path. What needs it, from the 1.5.0 source: an entry's share image (`og:image`) and sitemap image entries (`seo/media-url.ts`), file, video and audio blocks, and any image the optimiser cannot handle (`media/responsive.ts`). Optimised images do not: they come from `/_image` (see Security headers). It exposes nothing new: the route serves one file per exact key, refuses backup and transfer keys, and the list API still needs sign-in; the same files are already reachable through `/_image`. Any file in the media library is therefore public to whoever has its URL. Cloudflare says to test a Bypass policy before production; that is a launch check (D7). The guide also lists comments, live search, public plugin routes and the health route; the site uses none of them, so they are added only when a later issue does. Bypass requests are not logged by Access and Bypass policies cannot use identity rules ([policies](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/)).

**Owner checks on the B4 preview** (`b4-access-sign-in.superbenefit.dev`), which decide the `roleMapping` keys:
1. Signed in, open `https://b4-access-sign-in.superbenefit.dev/cdn-cgi/access/get-identity` ([Cloudflare](https://developers.cloudflare.com/cloudflare-one/tutorials/extend-sso-with-workers/#2-view-the-users-identity)). This is the JSON EmDash reads. For a Web Admins member and a Knowledge Stewardship member, find the entry in `groups` for the team and copy its `name` exactly. If it is `Web Admins` (or `Knowledge Stewardship`), the key is right. If it is anything else (for example with the organization in front, or the team slug `web-admins`), the key in `astro.config.mjs` changes to that exact string and the form is recorded here.
2. In the admin, Users (`/_emdash/admin/users`): an org member who had never signed in to the staging admin before is listed as Contributor; a Knowledge Stewardship member who had never signed in before is listed as Editor; a Web Admins member who had never signed in before is listed as Admin. The account that ran setup in B2 already exists on the shared staging database and keeps the role it has; it does not test the mapping.
Recorded result (2026-11-22, preview `b4-access-sign-in`):
- Verified by the owner: `/_emdash/admin` opens through Access with no passkey and no second sign-in; an account in neither team was created as Contributor. Both checks were made while the application still used Cloudflare login.
- Not verified: the names GitHub sign-in puts in `groups`, and so the `Knowledge Stewardship` and `Web Admins` keys. Cloudflare's docs give a GitHub group as a plain name ([identity selectors](https://developers.cloudflare.com/cloudflare-one/traffic-controls/identity-selectors/)), which is what the keys assume.
- If a key does not match, nothing breaks: the person arrives as Contributor, an Admin sets their role under Users, and it sticks. The key is then corrected from that person's `get-identity` output (step 1).

- Admins promote Contributors to Editor inside EmDash; with `syncRoles: false` those changes stick.
- Production at launch (D7): the production `users` table is empty, so the first person through Access becomes Admin whatever their team. The owner signs in first.

## Security headers
- EmDash's middleware already sets `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and `X-Frame-Options: SAMEORIGIN` on every public route, and a strict CSP on `/_emdash/*` (source: `packages/core/src/astro/middleware.ts`, `middleware/csp.ts`). The site adds nothing on top.
- HSTS is a zone setting, so it is an owner dashboard item.
- No custom CSP on public pages at launch. EmDash's inline toolbar and bootstrap scripts need hashes under a strict policy ([configuration](https://docs.emdashcms.com/reference/configuration/)), so a public CSP is its own later issue, not part of the relaunch. `<ClientRouter />` stays.
- JSON-LD comes from `<EmDashHead>`, which removes the unescaped `set:html` blocks (finding N1).
- Images render through `<Image>` from `emdash/ui`. An image EmDash can optimise is served from `/_image`, which reads the original from R2 directly, so it works behind Access ([`images` option](https://docs.emdashcms.com/reference/configuration/#images); `@emdash-cms/cloudflare/dist/image-endpoint.mjs`). When Astro's `getImage()` cannot transform an image (it throws, or returns the source URL unchanged), the component renders a plain `<img>` pointing at `/_emdash/api/media/file/...` (`emdash/src/components/EmDashImage.astro` and `src/media/responsive.ts`, 1.5.0). That route is under `/_emdash/*`, so on production visitors get those images only through the Bypass application (see Auth). The earlier sentence here, that images work for visitors because `/_emdash/*` is behind Access, was true for optimised images only.

## Environments and CI
Two environments under one Worker, as Cloudflare's [Previews](https://developers.cloudflare.com/workers/previews/) docs describe. Cloudflare: "Previews are the recommended way to test changes before production", and "Do not use Version URLs for branch or pull request testing" ([compare workflows](https://developers.cloudflare.com/workers/previews/compare-workflows/)).

| | Production | Previews |
| --- | --- | --- |
| Branch | `main` | every other branch |
| Command (Workers Builds) | `npx wrangler deploy` | `npx wrangler preview` |
| URL | superbenefit.org | `<branch-name>.superbenefit.dev` |
| Settings | top level of `wrangler.jsonc` | the `previews` block; nothing is inherited |
| Database, bucket, sessions | the site's own, created by Wrangler on the first production deploy | one shared staging set |
| Secrets | dashboard: Worker > Settings > Variables and secrets > **Production** | the same section with **Previews Base** selected; applies to Previews created afterwards |
| Cron Trigger | runs | does not run |

- **Previews use staging resources, never production's.** Cloudflare: "Point Preview bindings at staging or test resources instead of production resources", and for D1 "configure one staging database that all Previews share by default" ([configuration](https://developers.cloudflare.com/workers/previews/configuration/), [resources](https://developers.cloudflare.com/workers/previews/resources/#d1-migrations)). EmDash: "the preview needs a database and bucket separate from production. Never point a preview binding at a production database or bucket" ([preview deployments](https://docs.emdashcms.com/deployment/cloudflare/#preview-deployments)). That is three staging resources in total, shared by every preview: one D1 database, one R2 bucket, one KV namespace for sessions. They are bound by ID in the `previews` block.
- **Production resources need no setup.** With the names in `wrangler.jsonc`, "Wrangler creates the D1 database and R2 bucket" on the first deploy ([Deploy to Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/#configure-bindings)).
- **Previews are protected with Cloudflare Access.** Custom-domain Preview URLs are public and do not get `X-Robots-Tag: noindex` ([custom domains](https://developers.cloudflare.com/workers/previews/custom-domains/#protect-preview-content)). With the CMS installed, an empty staging database shows the setup wizard and "the first visitor to finish the wizard becomes the administrator" (EmDash, same page). Access can protect one Worker's previews only ([Cloudflare Access](https://developers.cloudflare.com/workers/configuration/cloudflare-access/)).
- **Because all previews share the staging database**, a branch that upgrades EmDash migrates it for the others on its first request. A branch that needs isolation points its own `previews` block at another database (EmDash, same page).
- **Scheduled publishing cannot be tested on a preview**, because Cron Triggers target production ([limitations](https://developers.cloudflare.com/workers/previews/resources/#limitations)). It is confirmed after launch.
- **Site URL for the CMS** (EmDash 1.5.0 as installed, checked 2026-11-21):
  - Production sets `EMDASH_SITE_URL=https://superbenefit.org` in the top-level `vars`. No `siteUrl` in `astro.config.mjs`, because that is built into every preview ([EmDash guide](https://docs.emdashcms.com/deployment/cloudflare/#preview-deployments)). EmDash reads it from `process.env` at runtime, which Cloudflare fills from `vars` with `nodejs_compat` and our compatibility date.
  - Previews set no `EMDASH_SITE_URL`. The setup route (`emdash/dist/astro/routes/api/setup/index.mjs`) takes `siteUrl`, then `EMDASH_SITE_URL` or `SITE_URL`; failing those, a production build running on Cloudflare Workers (`navigator.userAgent` contains `Cloudflare-Workers`) uses `https://` plus the request hostname. `SITE_URL_REQUIRED` is returned only when none of these applies, such as a production build on Node with no URL configured. So a preview records `https://<branch-name>.superbenefit.dev` and setup does not fail; the guide's `SITE_URL_REQUIRED` warning does not apply to Workers in 1.5.0.
  - Verified locally: the production build under `astro preview` (workerd) with `EMDASH_SITE_URL` removed from the generated config completed the setup wizard, stored `emdash:site_url` as `https://localhost` (scheme forced to https, port dropped), created a passkey for RP ID `localhost`, and an uploaded image was served from the media route and through `/_image`. With `EMDASH_SITE_URL` present, setup stored that value and offered RP ID `superbenefit.org`.
  - Setup is run once on the shared staging database. After that, `emdash:setup_complete` is true and other previews skip setup; nothing in the source rejects a request because its hostname differs from the stored URL (`astro/routes/api/setup/index.ts`, `astro/middleware/setup.ts`, `api/csrf.ts`).
  - The cost on staging: links in emails and the sitemap point at whichever preview ran setup.
  - The setup wizard is still shown on an empty database under Access auth, without an administrator step; the first person through Access after setup becomes Admin (`astro/middleware/auth.ts`). See Auth.
  - Local development reads the top-level `vars`, so `.env` sets `EMDASH_SITE_URL=http://localhost:4321` (as `.env.example` does). The override keeps local setup, emails and the sitemap on localhost instead of `https://superbenefit.org`. Passkeys are not used locally while `access()` is configured (see Auth, Local development).
  - Preview names: a `/` in the branch name becomes `-` (observed: branch `docs/stage-4-final` is served at `docs-stage-4-final.superbenefit.dev`). Cloudflare's docs do not state the rule.
  - Confirmed by the owner on the first CMS preview, `b2-install-emdash.superbenefit.dev` (2026-11-22): setup completed without `EMDASH_SITE_URL`, so the Preview command needs no `--var`. Not checked: which URL setup stored as the site URL.
- `wrangler.jsonc` has the `previews` block with `DB`, `MEDIA` and `SESSION` on the staging resources by ID, and the `send_email` and `ratelimits` bindings. It does not repeat `EMDASH_ROOMS`: the guide's `previews` block leaves it out, so previews edit in single-editor mode. `wrangler deploy --dry-run` parses and schema-checks the `previews` block offline (it warns on unknown fields); only `wrangler preview` checks it against the account.
- Workers Builds is the only CI. Its build command is `npm run build`, which runs `wrangler types && astro check && astro build`, so a type error fails the build on every branch and on `main`. `astro build` alone does no type checking ([Astro TypeScript guide](https://docs.astro.build/en/guides/typescript/#type-checking)); the script is the one Astro's [Cloudflare adapter page](https://docs.astro.build/en/guides/integrations-guide/cloudflare/#typing) gives. EmDash's guide builds with the package's `build` script and deploys with `wrangler deploy` or `wrangler preview` ([Deploy to Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/#build-and-deploy)). Cloudflare recommends external CI only for self-hosted or unsupported Git hosts ([CI/CD](https://developers.cloudflare.com/workers/ci-cd/)), so there is no GitHub Actions workflow. Dependabot is decided at launch (D7): GitHub reads its config only from the default branch.
- `compatibility_date` moves to the current date.

History: until 2026-11-21 the Worker was on the legacy preview model (Version URLs), and earlier drafts of this plan were built around it. That model is gone; nothing in the plan depends on it.

## Ownership
All Worker domain and Access settings are configured by a human in the Cloudflare dashboard. They are not written into config files and not changed by agents through the API. That covers custom domains and routes (including `.dev` as the preview domain and the www redirect), the Access application, its policies and identity provider, and Turnstile widget hostnames. `wrangler.jsonc` carries bindings, cron, vars and the `previews` block only, with no `routes`. Issues that need one of these settings are written as an owner checklist item with the exact value to enter, and the code work waits on it.

## Not decided by this page
Copy and the new service offerings are content work; see `issues.md`. Fleet fixes (governance canonical, unidentified Workers) are last in the order.

## First-deploy checks
The first branch preview with EmDash (`b2-install-emdash`, 2026-11-22) passed the owner's checks: public pages render, the setup wizard completes, and an uploaded image displays. Still to run on production at launch (D7): the docs' own checklist, including admin sign-in through Access and the cron in `wrangler tail`, which cannot run on a preview.

## Owner decisions (2026-11-20)
1. Editors sign in through Access with GitHub. Org members are Contributors (drafts only); the "Knowledge Stewardship" team are Editors (added 2026-11-22); the "Web Admins" team are Admins.
2. The accelerator page lives at `/accelerator/`; `/support` and `/supports` redirect to it.
3. Updates are written in EmDash.
4. `/about/` stays.
5. `.dev` is the preview domain, set up by the owner. Domain and Access settings are dashboard-only (see Ownership).
6. No preview-specific Cloudflare resources (2026-11-21). See Environments and CI.
7. AI crawlers: block training, allow everything else. Projects awaiting acceptance are marked "Applicant".
8. `trailingSlash: 'ignore'` (2026-11-22), replacing A4's `'always'`, so the EmDash admin works. See Stack.

Owner items still open are listed at the top of `issues.md`. Already in place: the GitHub identity provider, the www redirect, HSTS, the `.dev` preview domain and the Turnstile preview hostname.
