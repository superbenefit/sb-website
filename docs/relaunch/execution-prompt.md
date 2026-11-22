# Execution prompt (Stage 5)

Paste everything below the line into a new Claude Code on the web session opened on `superbenefit/sb-website`.

---

You are building the superbenefit.org relaunch. The plan is finished and approved. Your job is to execute the GitHub issues, in order, and get each one to a reviewed pull request. Use a workflow for each wave of work, with Opus 5.5 agents for implementation and review. Use smaller models for mechanical steps such as posting issue comments, collecting links or checking file lists.

## Read first, in this order
All on branch `feature/relaunch`, in `docs/relaunch/`:
1. `brief.md`: the goal, content standard and working rules.
2. `architecture.md`: the decided design. Do not reopen it. Read "Environments and CI" before touching `wrangler.jsonc`.
3. `mockups/README.md`, then the files in `mockups/`. The mockups are the owner's design instructions. Build pages to match them.
4. `issues.md`: the work and its order. The same items are GitHub issues 23 to 54 (A1 is 23, E3 is 54). Read each issue on GitHub before starting it; the issue is the brief for the agent that does it.
5. `findings.md`: known defects, open and fixed.
Then `AGENTS.md` for the code as it stands.

## Order
Work in waves. Inside a wave, issues run in parallel, each in its own git worktree. A wave starts only when the pull requests it depends on are merged into `feature/relaunch`. You cannot merge; the owner does.

| Wave | Issues | Notes |
| --- | --- | --- |
| 1 | 23, 24, 25, 26 (A1 to A4) | No dependencies. Start here. |
| 2 | 29 (B2) | Alone. It changes the build configuration every later issue relies on. |
| 3 | 32 (B5), then 31 (B4) | B4 needs the owner's values from issue 30 first. |
| 4 | 35 (C1) | Alone. Every page builds on it. |
| 5 | 36 (C2), 33 (B6) | In parallel. |
| 6 | 37 to 44 (C3 to C10) | In parallel, one page per agent. |
| 7 | 45 (C11), 34 (B7), 47 (D2), 50 (D5), 51 (D6) | After the pages are merged. |
| 8 | 48 (D3), 49 (D4) | Need the owner's service offerings (issue 46), images and a human edit. Draft, then stop. |
| 9 | 52 (D7) | Launch. Do not start without the owner's explicit go-ahead. |

Issues 53 and 54 (E1, E3) are in other repositories. Ask the owner to add those repositories before starting them. Issues 27, 30 and 46 are the owner's; never do them yourself.

## For every issue
1. Branch from the current `feature/relaunch`. Name it after the issue: `a3-contact-hardening`, `c3-home-page`. A `/` in a branch name becomes `-` in the preview address.
2. Do only what the issue's Outcome says. If you find another defect, add it to `findings.md` in the same pull request; do not fix it there.
3. Before opening the pull request, all of these must pass, and you must have run them yourself:
   - `npm run check` with 0 errors, and `npm run build`.
   - The issue's "Accept when" checks, run against a local build (`npm run preview`, or `npm run dev` for CMS work, which uses a local database). For pages, compare screenshots at 1440 and 390 px wide with `mockups/screenshots/`.
   - A second Opus 5.5 agent reviews the diff against the issue and the mockup and tries to find what is wrong. Fix what it finds that is real.
4. Open one pull request into `feature/relaunch`. Never push to `feature/relaunch` or `main` directly. In the description: what changed, how each "Accept when" check was verified, what was not verified, and a link to the issue.
5. Watch the pull request until its Workers Builds check is green. Fix failures at the cause. Never skip or weaken a check.
6. When the owner merges it, close the issue with a comment linking the pull request. Pull requests into `feature/relaunch` do not close issues automatically.

## What you cannot verify yourself
Branch previews are served at `<branch-name>.superbenefit.dev` and sit behind Cloudflare Access, so they redirect you to a sign-in page. Verify locally, and say in the pull request which checks the owner needs to look at on the preview. Anything that needs the real Cloudflare account, such as Access sign-in, the staging database on a deployed preview, or sending a real contact message, is the owner's to confirm.

## Stop and ask the owner when
- An issue needs a Cloudflare dashboard, domain or Access setting, a secret, or a value only the owner has. Say exactly what is needed and why, at the top of your message.
- The official docs and the plan disagree, or the docs do not cover what you need to do.
- A mockup does not show something you must build and the mockup tokens do not settle it.
- A check fails and the fix would change the design, the content model or the architecture.
- A wave is waiting on merges. Report the open pull requests in one short list and stop.
Ask one clear question at a time. Do not ask the owner to make technical choices the official docs already settle.

## Rules the owner has set. Follow them exactly.
- **Official docs only.** Every claim about Astro, EmDash, Cloudflare or any tool comes from current official docs or source read in this session, with a link in the pull request. Use the documented pattern. Do not invent rules or workarounds. docs.emdashcms.com describes unreleased `main`; check behaviour against the installed version.
- **The mockups are instructions.** Do not second-guess the design. The home page project selector auto-advances and is built as designed.
- **Cloudflare domain and Access settings are set by a human in the dashboard.** Never put routes or custom domains in config files, and never change these through the API.
- **Read the real state before stating it.** Check the repository, the build output or the account before you claim what is there. One failed call is not evidence.
- **Do the work before reporting it.** If something has to happen first, do it.
- **Never bury an action item.** What the owner must do or decide goes first, with what, why and enough to decide.
- **Report plainly.** Lead with the outcome. Say what was tested and what was not. No process narration, no walls of text.
- **Keep docs current.** When a decision changes, fix every file that states the old one, in the same pull request.

## Facts that are easy to get wrong
- Two environments under one Worker. `main` deploys to superbenefit.org with `wrangler deploy`. Every other branch is a Worker Preview (`wrangler preview`). Previews inherit nothing from production: settings come from the `previews` block in `wrangler.jsonc`, secrets from the preview base configuration, and data from one shared staging set.
- The staging resources exist. Their names and IDs are in `issues.md`. Production's database and bucket are created by Wrangler on the first production deploy.
- Preview base secrets reach only previews created after the secret was set.
- npm 11.19 blocks dependency install scripts until approved with `npm install-scripts approve`. `esbuild` and `workerd` are approved, pinned by version; a version bump needs re-approval.
- The Turnstile site key reaches the prerendered contact page from `vars` in `wrangler.jsonc` at build time. Turnstile uses explicit rendering tied to `astro:page-load`; keep that when the contact page is rebuilt.
- EmDash sets its own security headers and a strict CSP on its admin. The site adds none.
- Access roles: everyone the Access policy lets in starts as Contributor (`defaultRole: 20`). An Admin sets Editor ("Knowledge Stewardship") and Admin ("Web Admins") under Users in the CMS; EmDash cannot read GitHub teams (`architecture.md`, Auth; decided 2026-11-22).
- `main` still runs the old site. Nothing reaches production until issue 52.

## Start
Read the documents, then report in five lines or fewer: which wave you are starting, which issues are in it, and anything in the documents or issues that blocks it. Then start wave 1.
