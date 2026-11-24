import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';
import { env } from 'cloudflare:workers';

const SENDER = 'submissions@mail.superbenefit.org';

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const contact = defineAction({
  accept: 'form',
  input: z.object({
    // null (an empty form field, see the Turnstile field below) becomes ''
    // so "Name is required" is the message, not Zod's default.
    name: z.preprocess(
      (v) => (v == null ? '' : v),
      z
        .string()
        .trim()
        .min(1, 'Name is required')
        .max(120, 'Name must be 120 characters or fewer')
        .refine(hasNoLineBreak, 'Name cannot contain line breaks'),
    ),
    email: z.email({ message: 'Please enter a valid email address' }).trim().toLowerCase().max(200, 'Email must be 200 characters or fewer'),
    // Optional, as in the mockup (docs/relaunch/mockups/pages/contact.html
    // labels it "Subject", not "(required)"). Astro passes an empty form
    // field as `null` (see the Turnstile field below), so it becomes ''.
    // An empty subject gets a default in the handler.
    subject: z.preprocess(
      (v) => (v == null ? '' : v),
      z
        .string()
        .trim()
        .max(200, 'Subject must be 200 characters or fewer')
        .refine(hasNoLineBreak, 'Subject cannot contain line breaks'),
    ),
    message: z
      .string()
      .trim()
      .min(10, 'Message must be at least 10 characters')
      .max(5000, 'Message must be 5000 characters or fewer'),
    // Populated by the Turnstile widget on successful challenge.
    // Preprocess converts Astro's `null` (from formDataToObject when the
    // widget hasn't completed) to '' so Zod's .min(1) check fires with
    // the meaningful "Please complete the CAPTCHA challenge" message
    // instead of the stock "Invalid input: expected string, received null".
    // Verified against node_modules/astro/dist/actions/runtime/server.js
    // (function handleFormDataGet, ~line 245): for missing FormData fields
    // where the base validator is not $ZodOptional, it returns `null`.
    'cf-turnstile-response': z.preprocess(
      (v) => (v == null ? '' : v),
      z.string().min(1, 'Please complete the CAPTCHA challenge'),
    ),
  }),
  handler: async (input, context) => {
    // ── Resolve runtime bindings ────────────────────────────────────
    // `Astro.locals.runtime.env` no longer exists. Use `env` from
    // `cloudflare:workers` (shimmed in dev by the Cloudflare adapter).
    // The shape is declared in `src/env.d.ts`.

    // Production fail-fast: silently falling back to a default recipient
    // or test secret is a footgun (form appears to work, but mail goes to
    // the wrong place and siteverify rejects real tokens). Failing here
    // surfaces the misconfiguration at request time. The detail goes to the
    // Worker log; the visitor sees only GENERIC_FAULT.
    const recipient = env.CONTACT_EMAIL;
    if (!recipient) {
      throw serverFault(
        'CONTACT_EMAIL is not set. Run `wrangler secret put CONTACT_EMAIL`.',
      );
    }

    const turnstileSecret = env.TURNSTILE_SECRET_KEY;
    if (!turnstileSecret) {
      throw serverFault(
        'TURNSTILE_SECRET_KEY is not set. Run `wrangler secret put TURNSTILE_SECRET_KEY`.',
      );
    }

    const clientIp =
      context.request.headers.get('CF-Connecting-IP') ??
      context.request.headers.get('x-forwarded-for') ??
      undefined;

    // ── Rate limit per client IP ────────────────────────────────────
    // `ratelimits` binding, configured in wrangler.jsonc (top level and
    // `previews`). Counts are per Cloudflare location and approximate:
    // https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
    if (!env.CONTACT_RATE_LIMITER) {
      throw serverFault('CONTACT_RATE_LIMITER binding is missing.');
    }
    const { success: underLimit } = await env.CONTACT_RATE_LIMITER.limit({
      key: clientIp ?? 'unknown-ip',
    });
    if (!underLimit) {
      throw new ActionError({
        code: 'TOO_MANY_REQUESTS',
        message:
          'Too many messages from your network. Please wait a minute and try again.',
      });
    }

    // ── Turnstile verification ──────────────────────────────────────
    const verifyBody = new URLSearchParams();
    verifyBody.set('secret', turnstileSecret);
    verifyBody.set('response', input['cf-turnstile-response']);
    if (clientIp) verifyBody.set('remoteip', clientIp);

    let verifyResult: { success: boolean; 'error-codes'?: string[] };
    try {
      const resp = await fetch(TURNSTILE_VERIFY_URL, {
        method: 'POST',
        body: verifyBody,
      });
      verifyResult = (await resp.json()) as {
        success: boolean;
        'error-codes'?: string[];
      };
    } catch (err) {
      console.error(
        '[contact action] turnstile verify fetch failed:',
        err instanceof Error ? err.message : String(err),
      );
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not verify CAPTCHA. Please try again.',
      });
    }

    if (!verifyResult.success) {
      console.warn(
        '[contact action] turnstile rejected:',
        verifyResult['error-codes'],
      );
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: 'CAPTCHA verification failed. Please try again.',
      });
    }

    // ── Email send via Cloudflare Email Service ─────────────────────
    if (!env.EMAIL) {
      throw serverFault('EMAIL send_email binding is missing.');
    }

    const text = [
      `From: ${input.name} <${input.email}>`,
      '',
      input.message,
    ].join('\n');

    const html = `
      <p><strong>From:</strong> ${escapeHtml(input.name)} &lt;${escapeHtml(input.email)}&gt;</p>
      <p>${escapeHtml(input.message).replace(/\n/g, '<br>')}</p>
    `;

    try {
      const result = await env.EMAIL.send({
        to: recipient,
        from: SENDER,
        replyTo: { email: input.email, name: input.name },
        // `name` has no line breaks (schema), so the default is one line.
        subject: input.subject || `Message from ${input.name}`,
        text,
        html,
      });
      return { ok: true as const, messageId: result.messageId };
    } catch (err) {
      const e = err as Error & { code?: string };
      const code = e.code ?? 'E_DELIVERY_FAILED';
      console.error('[contact action] send failed:', code, e.message);
      const actionCode =
        code === 'E_RATE_LIMIT_EXCEEDED' || code === 'E_DAILY_LIMIT_EXCEEDED'
          ? 'TOO_MANY_REQUESTS'
          : 'INTERNAL_SERVER_ERROR';
      throw new ActionError({
        code: actionCode,
        message:
          'We could not send your message right now. Please try again in a few minutes.',
      });
    }
  },
});

/** Shown to visitors for any fault on our side; the detail is logged. */
const GENERIC_FAULT =
  'Something went wrong on our side. Please try again later.';

/** Logs a server fault and returns the generic error for the visitor. */
function serverFault(detail: string): ActionError {
  console.error('[contact action] server fault:', detail);
  return new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: GENERIC_FAULT });
}

/** CR or LF are not allowed in single-line fields (name, subject). */
function hasNoLineBreak(s: string): boolean {
  return !/[\r\n]/.test(s);
}

/** Minimal HTML escape for trusted internal interpolation. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
