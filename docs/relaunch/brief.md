# SuperBenefit web relaunch: brief

Last updated 2026-11-20. Source: owner's kickoff brief plus a recon session.

## Goal
Get SuperBenefit's Cloudflare web properties complete, consistent and launched under one brand, starting with superbenefit.org (this repo).

## Messaging (owner's direction)
Two focus areas:
1. **Nonprofit DAO Accelerator**: for aligned teams who want to join as cells. "Nonprofit DAO accelerator" is the chosen SEO term.
2. **Local Capacity Building**: for external communities and organizations who need help stewarding their data and infrastructure and using emerging technologies for local resilience and social change. Keywords and framing still to be researched (candidates: digital resilience, data stewardship, community tech capacity, community-owned AI).

Current themes: local impact, local data, local AI, sovereign tech, worker cooperatives, community infrastructure.

## Active projects to feature
Each gets a feature card and an overview page:
- All In For Sport (allinforsport.org)
- DAO Primitives
- Pacto (application pending)
- Institute for Community Sustainability (London, Ontario)

## Accelerator/supports vs services
- **Accelerator and supports are the same thing and share one page.** The Nonprofit DAO Accelerator is the offer to cells; the supports (peer support: organizing, admin support, shared infrastructure) are what it consists of. Internal, no prices or SLAs. URL not yet confirmed; working assumption is `/accelerator/` with `/support` and `/supports` redirecting.
- **Services page** (external, pairs with Local Capacity Building): deliverable- and SLA-focused work; training, experiment facilitation and similar. Pared down from the current three tiers.

## Content management
Use EmDash (Astro-native CMS on D1 + R2), properly integrated with the Cloudflare stack. Not yet installed. Set up exactly as the official Cloudflare deployment docs describe; see `emdash-notes.md`.

## Design
A SuperBenefit design system exists at `superbenefit/design-system`. The current styling predates it and is due for a redesign, run as a separate design session whose mockups feed back into the plan.

## Content standard
Overhaul all copy to remove AI slop and make real points directly.
- Every section says who it is for, what they get, what it costs, what happens next.
- Every claim carries a name, number, date, place or link.
- No values grids, no unattributed pull quotes.
- Avoid: flywheel, ecosystem (as self-description), unqualified "regenerative", systems transformation, harness, weave, catalyze, "emerging technologies", "at the edge of".
- No "not X, but Y", no rhythm triplets, no em dashes.
- Agent-drafted copy gets a human edit before publish.

## Stack facts (at b643382)
Astro 7.0.9, @astrojs/cloudflare 14, Tailwind 4, Wrangler 4. `output: 'server'`, all pages prerendered; the Worker runs only the contact action (Turnstile + Cloudflare Email Service). Live: `/` and `/contact/`; other routes are noindexed "Coming soon" drafts. No tests, lint or CI.

## Fleet
| Property | Worker | Notes |
| --- | --- | --- |
| superbenefit.org | sb-website | www returns 522 |
| superbenefit.dev | same build | public copy |
| knowledge.superbenefit.org / .dev | knowledge-garden | Knowledge Garden |
| governance.superbenefit.org | governance-site | Starlight, Astro 5; canonical wrongly points to .dev |
| allinforsport.org | aifs-site | Astro 6 |
| unidentified hostnames | knowledge-server, governance-server, sb-auth, docs, regen-toolkit, slc-advisor | |

## Working rules
1. Verify before asserting. Claims about Astro, EmDash, Cloudflare or any tool come from current official docs or source, with a link. Say plainly what you could not verify.
2. Report real errors only. Do not flag wording or choices that are not wrong.
3. Write plainly: specific names, numbers, dates and links.
4. Keep these docs few and short. Update one instead of adding another.

## Answered
- The SuperBenefit Cloudflare account is on Workers Paid (2026-11-20).

## Open questions
- Which services survive the cut, and are the $5,000 tiers and hour-based SLAs real?
- What is Pacto, and what can be said publicly while the application is pending?
- `/accelerator/` or `/supports/` as the page URL?
- Who edits content after launch, and do they need a non-developer interface?
- Canonical channels: which Discord invite, Paragraph or Mirror, X handle?
- What are `docs`, `regen-toolkit`, `slc-advisor` and `sb-auth` serving, and which are in scope?
- Should the `.dev` domains be staging behind Access, or retired?
- AI-crawler policy across the fleet: block, allow, or allow with attribution?
