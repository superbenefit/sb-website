/// <reference types="astro/client" />

// Bindings and vars are typed by `wrangler types` (worker-configuration.d.ts,
// listed in tsconfig.json `compilerOptions.types`). Secrets are not in
// wrangler.jsonc, so they are declared here by merging into Cloudflare.Env:
// https://developers.cloudflare.com/workers/languages/typescript/
declare namespace Cloudflare {
	interface Env {
		CONTACT_EMAIL?: string;
		TURNSTILE_SECRET_KEY?: string;
	}
}
