# SuperBenefit web relaunch: brief

Last updated 2026-11-22. Source: owner's kickoff brief, a recon session, and owner decisions during planning.

Companion docs: `architecture.md` (decided design), `findings.md` (issue register), `mockups/` (the owner's design; start with its README), `issues.md` (the work, broken into issues), `design-handoff.md` (the prompt the design session was given), `execution-prompt.md` (the prompt that runs the build in a new session), `planning-prompt.md` (the five planning stages).

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
- Pacto (applicant; https://covenant-gov.github.io/pacto-app/)
- Social Lean Canvas (applicant; https://socialleancanvas.com/)
- Institute for Community Sustainability (London, Ontario)

## Accelerator/supports vs services
- **Accelerator and supports are the same thing and share one page.** The Nonprofit DAO Accelerator is the offer to cells; the supports (peer support: organizing, admin support, shared infrastructure) are what it consists of. Internal, no prices or SLAs. URL is `/accelerator/`, with `/support` and `/supports` redirecting.
- **Services page** (external, pairs with Local Capacity Building): deliverable- and SLA-focused work; training, experiment facilitation and similar. Pared down from the current three tiers.

## Content management
Use EmDash (Astro-native CMS on D1 + R2), properly integrated with the Cloudflare stack, set up exactly as the official Cloudflare deployment docs describe; see `architecture.md`. Installed on `feature/relaunch` by B2 (#29); the pages do not read EmDash content yet.

## Design
A SuperBenefit design system exists at `superbenefit/design-system`. The owner's mockups for the relaunch are in `mockups/` and are the design instructions: pages are built to match them.

## Content standard
Overhaul all copy to remove AI slop and make real points directly.
- Every section says who it is for, what they get, what it costs, what happens next.
- Every claim carries a name, number, date, place or link.
- No values grids, no unattributed pull quotes.
- Avoid: flywheel, ecosystem (as self-description), unqualified "regenerative", systems transformation, harness, weave, catalyze, "emerging technologies", "at the edge of".
- No "not X, but Y", no rhythm triplets, no em dashes.
- Agent-drafted copy gets a human edit before publish.

## Stack facts (`feature/relaunch`, after PR #18)
Astro 7.4.13, @astrojs/cloudflare 14.4.9, Tailwind 4.3, Wrangler 4.166, TypeScript 6, Node 24. `output: 'server'`, all pages prerendered; the Worker runs the contact action (Turnstile + Cloudflare Email Service) and, since B2, EmDash 1.5.0's admin and API. Live on `main`: `/` and `/contact/`; other routes are noindexed "Coming soon" drafts. Workers Builds deploys `main` and previews every branch. No tests or lint; Workers Builds type-checks every branch through `npm run build`.

## Fleet
| Property | Worker | Notes |
| --- | --- | --- |
| superbenefit.org | sb-website | www redirects to the apex (301) |
| superbenefit.dev | same build | public copy |
| knowledge.superbenefit.org / .dev | knowledge-garden | Knowledge Garden |
| governance.superbenefit.org | governance-site | Starlight, Astro 5; canonical wrongly points to .dev |
| allinforsport.org | aifs-site | Astro 6 |
| other Workers | knowledge-server, governance-server | not identified |
| out of scope | docs, sb-auth | for later use; ignore for now |
| moved elsewhere | regen-toolkit, slc-advisor | |

## Working rules
1. Verify before asserting. Claims about Astro, EmDash, Cloudflare or any tool come from current official docs or source, with a link. Say plainly what you could not verify.
2. Report real errors only. Do not flag wording or choices that are not wrong.
3. Write plainly: specific names, numbers, dates and links.
4. Keep these docs few and short. Update one instead of adding another.
5. Worker domain and Access settings are configured by a human in the Cloudflare dashboard. Agents do not put them in config files or change them through the API.

## Answered (2026-11-20)
- The Cloudflare account is on Workers Paid.
- Accelerator page URL is `/accelerator/`. Updates are written in EmDash. `/about/` stays.
- Editors sign in with GitHub through Cloudflare Access: org members as Contributors (drafts only), the "Knowledge Stewardship" team as Editors, the "Web Admins" team as Admins. Editors use the EmDash admin, so no developer is needed to publish.
- Branch previews are Worker Previews at `<branch-name>.superbenefit.dev`, bound to one shared staging database, bucket and session namespace. See `architecture.md`, Environments and CI.
- Discord invite everywhere: `https://discord.gg/DMezXT7UAt`.
- AI crawlers: block training, allow all other bots.
- The three services on the old site are real; the owner is redoing the offerings.
- Pacto and Social Lean Canvas are shown as applicants.
- The GitHub OAuth app and Zero Trust identity provider already exist.
- X handle stays `SuperBenefitDAO`. "Book an onboarding call" has no link yet; the button is hidden until an editor adds one.

## Answered (2026-11-22)
- `trailingSlash` is `'ignore'`, Astro's [default](https://docs.astro.build/en/reference/configuration-reference/#trailingslash), not A4's `'always'`, which made the EmDash admin URLs 404 (finding T1). Internal links keep the trailing slash; see `architecture.md`, Stack.

## Open questions
- The new service offerings (owner is redoing them).
