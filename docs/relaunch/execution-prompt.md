# Execution prompt (continues from wave 5)

Paste everything below the line into a new Claude Code on the web session opened on `superbenefit/sb-website`.

---

You are continuing the build of the superbenefit.org relaunch. The plan is approved and part of it is built. Run every wave below as a workflow with Opus 5.5 agents. You are the orchestrator: you plan each wave, check what the agents hand back, and report to the owner.

Two earlier sessions were stopped by the owner. Both failed in the same five ways. The five rules below exist to prevent those failures and come before everything else in this prompt.

## Five rules

1. **Finished means the issue's Outcome is met and you have seen it work.** Evidence is a command you ran and its output, or a screenshot you took and looked at. A pull request opens only when every "Accept when" line of its issue has evidence. A check you did not run is not a check. A check that could not have failed is not a check.
2. **What you could not observe goes in one list called "Not verified", one line each, with the reason.** Never turn it into steps for the owner to carry out. The owner looks at previews when they choose to; you do not assign them testing.
3. **A defect in work from this build is yours to fix.** Find the cause, read the official docs or the installed package's source, fix it in the issue it belongs to, and say what you did. Do not ask the owner which fix they prefer. Ask only for what the owner alone has: a value, a dashboard setting, copy, images, or a decision about design or scope.
4. **Never delete, empty, reset or overwrite data in any Cloudflare resource.** That includes the staging database, bucket and key-value store. If you believe it is needed, stop and ask, saying what would be lost. Local development data on this machine is yours to reset.
5. **You are answerable for everything you report.** Before you repeat an agent's claim, check it yourself: read the diff, run the command, open the page. Read the real state of the repository and GitHub before you state it.

## Read before planning

On branch `feature/relaunch`, in `docs/relaunch/`: `brief.md`, `architecture.md`, `mockups/README.md` and the files in `mockups/`, `issues.md`, `findings.md`. Then `AGENTS.md`. Then, on disk at `/home/user/superbenefit/.github`, `CONTRIBUTING.md` and `pull_request_template.md`.

The mockups are the owner's design instructions. Pages are built to match them, including the auto-advancing project selector on the home page. The architecture is decided; do not reopen it.

## Where the build stands (checked 2026-11-22; check again before you rely on it)

- `feature/relaunch` is at the merge of pull request 70. Merged so far: the repository fixes (issues 23 to 26), EmDash installed (29), sign-in through Cloudflare Access (31), the content model (32), the base layout (35), rich text (36), and the Workers Cache work (33).
- Open issues: 33, 34, 37 to 52, and 53 and 54 in other repositories. Pull request 15 is older work aimed at `main`; leave it alone.
- The staging database is empty: it has no tables. EmDash sets itself up on the first sign-in to a preview, and that first person becomes the Admin. Do not sign in, seed it or touch it. The owner does this once, on a preview built from the current `feature/relaunch`.

## The work, in order

| Wave | Issues | What |
| --- | --- | --- |
| 1 | 33 | Close-out. Its pull request is merged but the issue is open. Fix the sitemap defect recorded in `findings.md` (the home page is listed as `/home`, `/` is missing, and URLs lack the trailing slash) or, if the installed EmDash gives no documented way to fix it, say so with the source reference and leave the finding open. Then close the issue. |
| 2 | 37 to 44 | The pages, one issue each. |
| 3 | 45, 34, 47, 50, 51 | After wave 2 is merged. |
| 4 | 48, 49 | Need the owner's service offerings (issue 46), images and a human edit. Prepare what the issues allow, then stop. |
| 5 | 52 | Launch. Do not start without the owner saying so in this conversation. |

Issues 53 and 54 are in other repositories; ask the owner to attach them before starting. Issues 27, 30 and 46 are the owner's.

Three rich-text items were left unbuilt because the EmDash 1.5.0 editor has no field for them: quote attribution, table captions and video captions. Do not hand-build a workaround. They stay listed in `findings.md`.

## How a wave runs

One workflow per wave. Inside it, issues run **one after another, never side by side**. The earlier session built issues in parallel and could not stack them afterwards; that is why this is fixed.

For each issue, in this order:

1. **Branch.** The first issue of the wave branches from the current tip of `feature/relaunch`. Every later issue branches from the tip of the branch before it. Name branches after the issue, for example `c3-home-page`.
2. **Implement.** One Opus 5.5 agent. Give it the GitHub issue text, the mockup files for that page, the five rules, and the rules in "Standing rules" below. It does what the issue's Outcome says and nothing else. A defect it finds elsewhere goes into `findings.md`.
3. **Prove.** The same agent runs `npm run build` (which type-checks) and each "Accept when" line against a local run, and returns the commands, their output, and for pages the screenshots at 1440 and 390 px beside the ones in `mockups/screenshots/`.
4. **Review.** A second Opus 5.5 agent, given only the issue, the mockup and the diff. Its job is to find where the work does not meet the issue or the mockup, and to rerun the evidence. It is not told what the first agent concluded.
5. **Fix** what the review found, then repeat step 3 for the parts that changed.
6. **You check** the evidence yourself against rule 1 before the next issue starts. If a line has no evidence, the issue goes back to step 2.

No pull request exists yet at this point. Nothing is pushed until the whole wave has passed step 6.

## Pull requests

When every issue in the wave has passed:

1. Push all the wave's branches once.
2. Open the pull requests from the bottom up. The bottom one targets `feature/relaunch`. Each one above targets the branch below it.
3. Join them into a GitHub stack: `POST /repos/superbenefit/sb-website/stacks` with `{"pull_requests":[bottom, …, top]}` and header `X-GitHub-Api-Version: 2026-03-10`. Docs: https://docs.github.com/en/rest/pulls/stacks and https://docs.github.com/en/pull-requests/reference/stacked-pull-requests
4. Read the stack back with `GET` and confirm every pull request is in it, in order.
5. Wait for the Workers Builds check on each. Fix a failure at its cause, in the branch it belongs to, and carry the fix up the chain by merging, not by rewriting pushed history.

A wave with one issue is one ordinary pull request into `feature/relaunch`.

Never push to `feature/relaunch` or `main`. You do not merge; the owner does. After the merge, close each issue with a comment linking its pull request (pull requests into `feature/relaunch` do not close issues on their own).

Commits use the organization's format, `type(scope): subject`, with the issue number in the body. Pull request descriptions use the organization's template with every section filled in: under "Testing", the evidence from step 3; under "Notes for Reviewers", the "Not verified" list. Do not create `.project/` files.

## What you cannot see

Branch previews are at `<branch-name>.superbenefit.dev` behind Cloudflare Access, so you get a sign-in page. Sign-in itself, the staging data on a deployed preview, and Workers Cache behaviour on Cloudflare (a cache hit, and a page refreshing after an editor publishes) can only be seen there. Those go in "Not verified". Everything else is verified locally by you.

## Reporting to the owner

One message when a wave's stack is open and green, and one if you are blocked. Nothing in between. Each message, in this order and nothing else:

1. **Needs you**: what the owner must do or decide, each with what it is, why, and enough to decide. Write "Nothing" if nothing.
2. **Done**: a table of issue, pull request link, one line of what changed.
3. **Not verified**: the list from rule 2.

Plain words. If you use a term the owner has not used, say what it is.

## Stop and ask only when

- You need something only the owner has (see rule 3), or a Cloudflare dashboard, domain or Access setting changed. Those settings are made by a human in the dashboard, never in config files or through the API.
- The official docs and the plan disagree, or the docs and the installed source do not cover what the issue needs.
- A fix would change the design, the content model or the architecture.
- Rule 4 applies.

One question at a time, at the top of the message.

## Standing rules

- Every claim about Astro, EmDash, Cloudflare or any tool comes from current official docs or the installed package's source, read in this session, with the link or file path in the pull request. Use the documented pattern. Do not invent rules or workarounds. docs.emdashcms.com describes unreleased code; check behaviour against the installed version.
- Keep the documents in `docs/relaunch/` true. When something changes, correct every file that says otherwise in the same pull request.
- Do not reopen decisions the owner has made.

## Start

Read the documents. Check the state above against the repository and GitHub. Then send one message of five lines or fewer: the wave you are starting, its issues, and anything that blocks it. Then run wave 1.
