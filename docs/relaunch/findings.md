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
| N1 | JSON-LD uses `set:html={JSON.stringify(…)}` (`SEO.astro:111`, `updates/[...slug].astro:48`). A title containing `</script>` breaks out ([docs](https://docs.astro.build/en/reference/directives-reference/#sethtml)). | CMS build: `<EmDashHead>` writes the JSON-LD. Must land before CMS content reaches these pages. |

Not checked: SPF/DKIM/DMARC, zone settings, Worker secrets, GitHub org protections.

### Code
| ID | Finding | Resolved by |
| --- | --- | --- |
| C1, C2 | Draft gating is duplicated across six pages and again in the sitemap filter. | CMS build: EmDash draft status. |
| C3, C4 | Two near-identical loaders; a production build with no content source silently ships mock data. | CMS build. |
| C5 | `projects.astro` hardcodes its projects and ignores the collection. | CMS build. |
| C6 | `KnowledgeSpotlight`, `UpdatesSection` and `ProjectsGrid` are imported nowhere. | Hygiene issue. |
| C9 | `WebSite` schema has a `SearchAction` for a search that does not exist. | CMS build. |
| C10 | "Schedule an onboarding call" links to `#`. | Content. |
| C11 | No PR check, tests, lint or Dependabot. Workers Builds does build and preview every branch. | Hygiene issue. |
| N5 | The `assets` block in `wrangler.jsonc` is ignored; the adapter generates its own. | CMS build. |
| N8 | `manifest.json` declares a 192×192 icon that is 400×272. The hidden microdata block in `Footer.astro` has no `itemscope` and does nothing. | Design and hygiene. |

### SEO
- No `<h1>` on the homepage; title is "Make Better Faster".
- Sitemap lists two URLs.
- Extensionless URLs 307 to the trailing-slash form (Workers assets [`html_handling`](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)); internal links use the redirecting form.
- Homepage has hidden links to noindexed drafts.
- governance.superbenefit.org's canonical points to governance.superbenefit.dev (fleet).
- `robots.txt` comments claim a Content-Signal that the file does not contain (N7).
- No analytics.
- Not checked: the claim that the brand query "SuperBenefit DAO" surfaces Notion, Flowershow and Goverland ahead of superbenefit.org.

### Content
- Old messaging throughout; nothing on the accelerator, local capacity building, Pacto or ICS.
- Owner to confirm or cut: "Governance Innovation Lab", the "NFT Energy Labeling Experiment" description, the service SLAs and $5,000 tiers.
- Links to `www.allinforsport.org`, which does not resolve, in `about.astro` and `projects.astro` (N6). Use the apex.
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
| N3 | Turnstile failed on any return visit to `/contact/` and after a rejected submission; `.env.example` had an invalid test site key. | PR #18: explicit rendering. |
| N4 | Comments said prerendered pages cannot read `wrangler.jsonc` vars. They can: the adapter loads them at build (tested). | Comments and docs corrected. |
| N8 (part) | `AGENTS.md` called the fonts API experimental. | Corrected. |

## Withdrawn
- Footer entity wording ("Worker Self-Directed Non-Profit Digital LLC") is correct as written. Do not re-raise.
- Checking Turnstile's `action` and `hostname` on the server. Cloudflare's docs show it as optional; it is not a defect.
