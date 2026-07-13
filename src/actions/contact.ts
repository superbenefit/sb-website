import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { env } from 'cloudflare:workers';

const SENDER = 'submissions@mail.superbenefit.org';

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const contact = defineAction({
  accept: 'form',
  input: z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(120, 'Name must be 120 characters or fewer'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address')
      .max(200, 'Email must be 200 characters or fewer'),
    subject: z
      .string()
      .trim()
      .min(1, 'Subject is required')
      .max(200, 'Subject must be 200 characters or fewer'),
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
    // Astro v6 removed `Astro.locals.runtime.env`. Use `env` from
    // `cloudflare:workers` (shimmed in dev by the Cloudflare adapter).
    // The shape is declared in `src/env.d.ts`.

    // Production fail-fast: silently falling back to a default recipient
    // or test secret is a footgun (form appears to work, but mail goes to
    // the wrong place and siteverify rejects real tokens). Throwing here
    // surfaces the misconfiguration at request time, not silently in
    // deployed traffic.
    const recipient = env.CONTACT_EMAIL;
    if (!recipient) {
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'Server misconfiguration: CONTACT_EMAIL is not set. ' +
          'Run `wrangler secret put CONTACT_EMAIL`.',
      });
    }

    // ── Turnstile verification ──────────────────────────────────────
    const turnstileSecret = env.TURNSTILE_SECRET_KEY;
    if (!turnstileSecret) {
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'Server misconfiguration: TURNSTILE_SECRET_KEY is not set. ' +
          'Run `wrangler secret put TURNSTILE_SECRET_KEY`.',
      });
    }

    const clientIp =
      context.request.headers.get('CF-Connecting-IP') ??
      context.request.headers.get('x-forwarded-for') ??
      undefined;

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
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Email service is not configured on this deployment.',
      });
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
        subject: input.subject,
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
          'We could not send your message right now. Please try again or email us directly at contact@superbenefit.org.',
      });
    }
  },
});

/** Minimal HTML escape for trusted internal interpolation. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
