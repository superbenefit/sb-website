---
name: deploy
description: Build and deploy the site to Cloudflare Workers. Runs type checking first.
disable-model-invocation: true
---

# Deploy to Cloudflare Workers

Run these steps in order. Stop and report if any step fails.

1. **Type check**: Run `npm run check` to verify there are no TypeScript or Astro errors.
2. **Deploy**: Run `npm run deploy` which builds the site and deploys via `wrangler deploy`.
3. **Report**: Show the deployment URL and any warnings from the output.

If the type check fails, do NOT proceed to deploy. Show the errors and ask the user to fix them first.
