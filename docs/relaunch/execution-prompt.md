# Execution prompt (continuation from wave 2)

Wave 1 is done. Paste everything below the line into a new Claude Code on the web session opened on `superbenefit/sb-website`.

---

You are continuing the build of the superbenefit.org relaunch. The plan is approved and wave 1 is merged. Your job is to execute the remaining GitHub issues in order and get each to a reviewed, mergeable pull request.

## Read first, in this order
1. The organization's rules in `superbenefit/.github`: `CONTRIBUTING.md`, `pull_request_template.md` and the commit convention. They apply to every commit and pull request here. If you cannot read that repository, say so and stop.
2. On branch `feature/relaunch`, in `docs/relaunch/`: `brief.md`, `architecture.md`, `mockups/README.md` (then the files in `mockups/`), `issues.md`, `findings.md`.
3. `AGENTS.md`.
4. The GitHub issue you are about to start. The issue is the brief for the work.

## Where things stand
- Merged into `feature/relaunch` (head `59eb6a3`): issues 23 to 26. The type check now runs inside `npm run build`, so Workers Builds fails on type errors. Workers Builds is the only CI; there is no GitHub Actions workflow and there must not be one.
- Closed: issues 23, 24, 25, 26, 28. Open: 27 and 29 to 54.
- Branch previews are Worker Previews at `<branch-name>.superbenefit.dev`, behind Cloudflare Access. You cannot open them; they redirect to sign-in.
- The three staging resources for previews exist. Names and IDs are in `issues.md`.

## Order of the remaining work
| Wave | Issues | Notes |
| --- | --- | --- |
| 2 | 29 (B2, install EmDash) | Alone. Everything later builds on it. Its prerequisites are met: previews are behind Access and the staging resources exist. Issue 27 does not block it. |
| 3 | 32 (B5), then 31 (B4) | 31 needs the owner's values from issue 30 first. |
| 4 | 35 (C1) | Alone. Every page builds on it. |
| 5 | 36 (C2), 33 (B6) | |
| 6 | 37 to 44 (C3 to C10) | One page each. |
| 7 | 45, 34, 47, 50, 51 | After the pages are merged. |
| 8 | 48 (D3), 49 (D4) | Need the owner's service offerings (issue 46), images and a human edit. Draft, then stop. |
| 9 | 52 (D7, launch) | Only on the owner's explicit go-ahead. Dependabot is set up here. |

Issues 53 and 54 are in other repositories; ask the owner to add them first. Issues 27, 30 and 46 are the owner's; never do them yourself.

## Before you write any code for an issue
1. Read the official documentation for the tool the issue touches, in this session, and link what you relied on.
2. Check the issue's instructions against the organization's rules and those docs. An issue or plan document is not an authority over either. If they conflict, stop and ask the owner before building. This is what went wrong in wave 1: a GitHub Actions check was built because an issue said so, although Workers Builds already did the job.
3. For issue 29, follow EmDash's [Deploy to Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/) guide exactly, including its `previews` block, and `architecture.md` ("Environments and CI" and "Site URL for the CMS"). The guide's examples use pnpm; this repository uses npm.

## Pull requests
- Use GitHub stacked pull requests. The bottom pull request targets `feature/relaunch`; each one above targets the branch below it. Docs: https://docs.github.com/en/pull-requests/reference/stacked-pull-requests and https://docs.github.com/en/rest/pulls/stacks
- Build the stack linear from the start so nothing has to be rebased after it is pushed: create each branch from the tip of the branch below it, and create the bottom branch from the current tip of `feature/relaunch`. When agents work in parallel, have them work in separate worktrees, then put their commits onto one linear chain of branches before you push anything.
- Push once, open the pull requests bottom to top, then create the stack with `POST /repos/{owner}/{repo}/stacks` and confirm with `GET` that every position is present and mergeable. The `gh` CLI here can call the REST API but cannot install extensions.
- Do not rewrite history that has been pushed. If a stack goes stale because the trunk moved, tell the owner what happened and ask before force-pushing.
- A single issue on its own is a stack of one: a normal pull request into `feature/relaunch`.
- Never push to `feature/relaunch` or `main`. You cannot merge; the owner does. After a merge, close each issue with a comment linking its pull request.
- Every commit, including those made by sub-agents, uses the organization's commit format and this session's own attribution lines.

## Checks before a pull request opens
- `npm run build` passes (it includes the type check).
- Each "Accept when" item in the issue has been run against a local build, and you saw it pass. For pages, compare screenshots at 1440 and 390 px with `mockups/screenshots/`.
- For work that needs the real Cloudflare account (Access sign-in, the staging database on a deployed preview, sending a real message), say in the pull request exactly what the owner needs to check on the preview. Do not claim it works.

## Use of agents and tokens
Wave 1 spent about 1.2 million sub-agent tokens on four small issues. Do not repeat that.
- Small issues (size S): do them yourself, or with one agent. No separate review agent.
- Medium and large issues: one implementing agent and one reviewing agent on Opus 5.5.
- Wave 6 (eight pages): one workflow, one implementing agent per page, one reviewer per page.
- Use a smaller model for mechanical steps: reading and summarising docs, posting issue comments, collecting links.
- Put git worktrees outside the checkout. Worktrees nested inside it fail to build unless the parent has `node_modules`.
- A problem caused by your own setup is not a finding. Do not write it into `findings.md` or any other repository file.

## Reporting
- One report per wave, after you have checked it: what is open for review, how each check was verified, what was not verified, and what the owner must do. Put what the owner must do first.
- Do not send a message for each notification. Do not report something as done until you have verified it.
- If something you were told turns out to be wrong, say so once, plainly, and continue.

## Stop and ask the owner when
- An issue needs a Cloudflare dashboard, domain or Access setting, a secret, or a value only the owner has.
- The official docs, the organization's rules and the plan disagree, or the docs do not cover what you need.
- A mockup does not show something you must build and its tokens do not settle it.
- A fix would change the design, the content model or the architecture.
- A wave is waiting on merges.
Ask one clear question at a time, with what is needed, why, and enough to decide.

## Rules the owner has set
- **Official docs only.** Use the documented pattern. Do not invent rules or workarounds. docs.emdashcms.com describes unreleased `main`; check behaviour against the installed version.
- **The mockups are instructions.** Build to match them. The home page project selector auto-advances and is built as designed.
- **Cloudflare domain and Access settings are set by a human in the dashboard.** Never put routes or custom domains in config files, and never change these through the API.
- **Read the real state before stating it.** One failed call is not evidence. If you cannot see something, say you cannot see it.
- **Never bury an action item.**
- **Keep docs current.** When a decision changes, fix every file that states the old one in the same pull request.

## Open items carried over
For the owner, none of them blocking wave 2:
- Issue 27: confirm a test message sends from the contact form on a preview created after the preview secrets were set.
- Confirm rate-limit `namespace_id` 2501 and 2502 are not used by another Worker in the account. Cloudflare requires them to be unique; this was merged unconfirmed.
- Preview checks from wave 1 that nobody has looked at: the sixth contact post within a minute is refused; internal links load without a redirect.
- Whether the relaunch should adopt the organization's `.project/{issue#}/` files. Until the owner says so, keep tracking work in `docs/relaunch/` and do not create `.project/` files.

For you to check, not assume:
- Which branch production is built from. Compare superbenefit.org with `main` and with `feature/relaunch` before issue 29 is merged, and tell the owner the result once. Installing the CMS must not reach the live site before launch.
- Whether npm 11.19 really blocks dependency install scripts. npm's own docs disagree. `package.json` approves `esbuild` and `workerd`; if a new dependency has an install script, test what happens before deciding.
- `superbenefit/.github` was reported to lack a `GOVERNANCE.md` the owner referred to. If you need it and cannot find it, ask.

Leftover remote branches from earlier sessions, all merged or abandoned: `a1-pr-checks`, `a1-type-check-in-build`, `a2-compatibility-date`, `a3-contact-hardening`, `a4-trailing-slash-links`, `turnstile-check`. Leave them unless the owner asks you to delete them.

## Start
Read the documents. Then report in five lines or fewer: that you are starting wave 2 with issue 29, and anything in the organization's rules, the docs or the issue that conflicts or blocks it. If nothing does, start.
