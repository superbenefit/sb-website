# Findings register (recon, 2026-11-20)

Commit b643382. Read-only recon, not a full code audit. Each item needs validating against current docs before it becomes an issue.

## Security
- S1 High: no security headers live; `public/_headers` deleted in 185e9a0 (Astro 7 upgrade).
- S2 High: `npm audit --omit=dev` shows 16 advisories (1 critical: astro <= 7.4.6, pinned 7.0.9; 14 high incl. wrangler, vite, zod, undici, sharp, devalue).
- S3 Medium (High with CMS): `src/utils/sanitize.ts` regex sanitizer bypassed by `<img/onerror=...>`, unquoted `href=javascript:`, `<form action>`, nested `<scr<script></script>ipt>`.
- S4 Medium: lorem-ipsum mock posts built to public URLs (`/updates/governance-primitives-web3/` etc.).
- S5 Medium: superbenefit.dev and knowledge.superbenefit.dev are unprotected public copies.
- S6 Low: `errorBanner.innerHTML = error.message` in contact.astro.
- S7 Low: contact subject not stripped of CR/LF; no rate limit beyond Turnstile.
- S8 Low: `.mcp.json` references nonexistent npm package `@anthropic-ai/cloudflare-docs-mcp`.
- Not checked: SPF/DKIM/DMARC, zone settings, Worker secrets, GitHub org protections.

## Code
- C1/C2: draft gating duplicated across six pages and again in the sitemap filter.
- C3/C4: duplicate loaders; silent fallback to mock data in production builds.
- C5: projects.astro hardcodes projects, ignores the collection.
- C6: unused components KnowledgeSpotlight, UpdatesSection, ProjectsGrid.
- C7: stale comments (Astro v6, .opencode reference, nav.ts duplication note).
- C9: fictional SearchAction in WebSite schema.
- C10: "Schedule an onboarding call" links to `#`.
- C11: compatibility_date 2025-12-01; no CI, tests, lint, dependency automation.

## SEO
- No `<h1>` on homepage; title "Make Better Faster"; two-URL sitemap.
- 307 redirects from extensionless to trailing-slash URLs; internal links use the redirecting form.
- www.superbenefit.org returns 522.
- Hidden links to noindexed drafts on homepage.
- governance.superbenefit.org canonical points to governance.superbenefit.dev.
- Brand query "SuperBenefit DAO" surfaces Notion, Flowershow, knowledge-garden-c1o.pages.dev and Goverland, not superbenefit.org.
- No analytics beacon found.

## Content
- Old messaging throughout; no accelerator, local capacity, Pacto or ICS.
- Likely invented: "Governance Innovation Lab"; "NFT Energy Labeling Experiment" description; mock authors; possibly the service SLAs and $5,000 tiers.
- Inconsistent: Discord invites (q95fFXGu67 vs d2EeszTvVm), Mirror vs Paragraph, knowledge .org vs .dev links, dead Knowledge Garden doc links.

## Withdrawn
- Footer entity wording ("Worker Self-Directed Non-Profit Digital LLC") is correct as written. Not a finding; do not re-raise.
