# Handoff prompt for the next planning session

Paste everything below the line into a new session opened on `superbenefit/sb-website`.

---

You are continuing the planning of the superbenefit.org relaunch. Stages 1 to 3 are done and Stage 4 is drafted. Stage 4 is finished; this session does Stage 5. It produces one prompt. It does not write application code.

## Read first, in this order
All on branch `feature/relaunch`, in `docs/relaunch/`:
1. `brief.md`: the goal, messaging, content standard and working rules.
2. `architecture.md`: the decided design. Do not reopen it.
3. `mockups/README.md`, then look at `mockups/screenshots/`. The mockups are the owner's design instructions.
4. `issues.md`: the Stage 4 list. Start with "Needs the owner".
5. `findings.md`: the register of defects, open and fixed.
6. `planning-prompt.md`: the five stages. You are at the end of Stage 4.
Then `AGENTS.md` for the code as it stands.

## State
- Merged into `feature/relaunch`: dependency upgrade and Turnstile fix (PR #18), architecture and design prompt (PR #19), mockups, issue list and Worker Previews setup (PRs #20 and #22).
- The owner approved the issue list on 2026-11-21. The 32 issues exist on GitHub as issues 23 to 54, in the order of `issues.md` (A1 is 23, E3 is 54). Do not create them again.
- `main` still runs the old site. Nothing from the relaunch is in production.
- Branch previews work: each branch is served at `<branch-name>.superbenefit.dev`.
- Open owner items are at the top of `issues.md` and in the issues titled "Owner - ...".

## What to do
**Stage 5.** Ask which coding harness the owner uses if it changes the prompt. Then write the prompt for that harness to execute the issues: the order, which can run in parallel, branch and PR conventions, the check that must pass before each issue closes, and when to stop and ask the owner. Put it in `docs/relaunch/` through a PR.

## Rules the owner has set. Follow them exactly.
- **Official docs only.** Every claim about Astro, EmDash, Cloudflare or any tool comes from current official docs or source read in the session, with a link. Use the documented pattern. Do not invent rules, pinning strategies or workarounds. If you have not read it, say so.
- **The mockups are instructions.** Do not second-guess the design. The home page project selector auto-advances and is built as designed.
- **Every change goes through a branch and a PR into `feature/relaunch`.** Never push to `feature/relaunch` or `main` directly.
- **Cloudflare domain and Access settings are set by a human in the dashboard.** Never put routes or custom domains in config files, and never change these through the API. Write them as owner items with the exact value to enter.
- **Never bury an action item.** If the owner must do or decide something, say so plainly at the top of the reply or document, with what is needed, why, and enough information to decide. Do not leave it in a table cell or a closing paragraph.
- **Ask clearly and directly, one question at a time,** when you need an answer. Do not ask the owner to make technical choices the official docs already settle.
- **Do the work before reporting it.** If something has to happen first (an upgrade, a fix), do it. Do not describe it as a future step and move on.
- **Verify before claiming.** Run the check, build, and preview. Say what was tested and what was not.
- **Keep replies short and organized.** Lead with the outcome. No walls of text.
- **Keep docs few and current.** Update an existing file instead of adding one. When a decision changes, fix every file that states the old one.

## Facts that are easy to get wrong
- The Cloudflare account is on Workers Paid, with R2 enabled.
- Branch previews are Worker Previews on the owner's preview domain: `<branch-name>.superbenefit.dev`. `wrangler.jsonc` needs its `previews` block for them. HSTS is on and the preview hostname is allowed on the Turnstile widget.
- Read the account before stating its condition. The Cloudflare tools can list D1, KV, R2 and Workers; a single failed call is not evidence that something is switched off.
- Do not give the owner setup steps for things you cannot see. Ask what already exists first. The GitHub identity provider for Access already exists.
- Workers Builds is connected: `main` deploys to production with `wrangler deploy`; every other branch is a Worker Preview (`wrangler preview`) at `<branch-name>.superbenefit.dev`. Previews inherit nothing from production: settings come from the `previews` block, secrets from the preview base config, and data from one shared staging database, bucket and namespace. Read `architecture.md`, Environments and CI, before touching `wrangler.jsonc`.
- The Turnstile site key reaches the prerendered contact page from `vars` in `wrangler.jsonc` at build time.
- npm 11.19 blocks dependency install scripts until approved with `npm install-scripts approve`. `esbuild` and `workerd` are approved, pinned by version; a version bump needs re-approval.
- docs.emdashcms.com describes unreleased `main`, ahead of npm. Check behaviour against the installed version.
- EmDash sets its own security headers and a strict CSP on its admin. The site adds none.
- Access roles: GitHub org members are Contributors (`defaultRole: 20`); the "Web Admins" team are Admins (`roleMapping`). The exact group name Access passes for a GitHub team is unverified until first deploy.
- This session could not read `superbenefit/design-system`, `knowledge-garden` or `governance-site`. If you need them, ask the owner to add them.
