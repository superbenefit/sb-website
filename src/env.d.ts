/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

/**
 * Shape of `env` imported from `cloudflare:workers`.
 *
 * Declared here rather than via the `wrangler types` generated file
 * because `wrangler types --include-runtime` (the default) generates
 * a file that overrides the DOM `Response` interface (workerd's
 * `Body.json<T>()` returns `Promise<T>` defaulting to `unknown`,
 * while the DOM `Response.json()` returns `Promise<any>`).  In an
 * Astro project that renders to the browser, this breaks any code
 * that uses `response.json()` without an explicit type parameter.
 * Neither the Astro nor Cloudflare docs address this conflict for
 * Astro projects.
 *
 * The generated file (`worker-configuration.d.ts`) is still produced
 * by `npm run check` and `npm run build` as a reference, but is not
 * loaded into the TypeScript compilation context (no `/// <reference>`
 * to it, and `tsconfig.json`'s `include` is scoped to `src/`).
 *
 * Keep the `SendEmail` shape in sync with the generated file's
 * builder overload at `worker-configuration.d.ts:~9938` (the
 * workerd-generated shape is the source of truth, not the Cloudflare
 * Workers API docs).
 */
interface SendEmail {
  send(message: {
    to: string | string[];
    from: string;
    subject: string;
    text?: string;
    html?: string;
    replyTo?: string | { email: string; name?: string };
    cc?: string | string[];
    bcc?: string | string[];
    headers?: Record<string, string>;
    attachments?: Array<{
      filename: string;
      content: string | ArrayBuffer;
      type?: string;
      disposition?: 'attachment' | 'inline';
    }>;
  }): Promise<{ messageId: string }>;
}

declare module 'cloudflare:workers' {
  interface Env {
    EMAIL?: SendEmail;
    CONTACT_EMAIL?: string;
    TURNSTILE_SECRET_KEY?: string;
    PUBLIC_TURNSTILE_SITE_KEY?: string;
  }
  export const env: Env;
}
