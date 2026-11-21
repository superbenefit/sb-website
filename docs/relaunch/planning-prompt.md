# Planning session prompt

Progress: all five stages are done. The 32 issues are GitHub issues 23 to 54. The build is run from `execution-prompt.md`.

You are planning the relaunch of superbenefit.org. This session produces a plan, not code. Do not change application code. Write plan outputs to `docs/relaunch/` on this branch.

Read first: `docs/relaunch/brief.md`, `architecture.md` and `findings.md`, then `AGENTS.md`. Related repos: `superbenefit/design-system`, `superbenefit/knowledge-garden`, `superbenefit/governance-site`.

Work through five stages. Stop at the end of each and wait for my go-ahead.

**Stage 1. Validate.** Check every finding and assumption against current official docs and source: Astro 7, `@astrojs/cloudflare`, Workers static assets and headers, EmDash, Astro route caching, Turnstile, Cloudflare Email Service. For each: confirmed, wrong, or changed, with a link. Resolve the open EmDash questions by testing or by source: build-time D1 access for prerendered pages, publish-triggered rebuilds, and Cloudflare Access auth. Report current best practice where the repo differs from it.

**Stage 2. Decide.** Propose the architecture in one page: rendering mode per route, EmDash content model (projects, services, accelerator supports, updates, page singletons), auth, caching, security headers, CI. List the decisions that are mine and ask them one at a time.

**Stage 3. Design handoff.** Once the page list and content model are settled, write a prompt I can run in a separate design session. It must name the design-system repo, the pages and components to mock up, the content fields each one shows, and the constraints (existing tokens, accessibility, performance, no JS animation libraries). Then stop. I will come back with the mockups.

**Stage 4. Decompose.** Integrate the mockups. Break the work into GitHub issues for `superbenefit/sb-website`: one outcome each, acceptance criteria, how to verify, dependencies, rough size. Show me the list before creating anything. Order: hygiene and security first, then CMS, then pages, then content, then fleet fixes. Hygiene issues do not depend on design and can be released while the design session runs.

**Stage 5. Orchestrate.** Write the prompt for my local coding harness to execute the issues: order, which can run in parallel, branch and PR conventions (work targets `feature/relaunch`, not `main`), the check that must pass before each issue closes, and when to stop and ask me. Ask which harness I use if it changes the prompt.

Rules: follow the working rules in `brief.md`; cite docs for every technical claim; say what you could not verify; keep every output short enough to review on a phone.
