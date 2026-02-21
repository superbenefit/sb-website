/**
 * Lightweight HTML sanitizer for blog post content rendered via set:html.
 * Strips executable script vectors without requiring external dependencies.
 *
 * Removes: <script>, <style>, <iframe>, <object>, <embed>, <form>, <base>,
 * inline event handlers (on*), javascript: URLs, and data: URLs on src/href.
 *
 * For richer allowlist control (e.g. per-tag attribute whitelisting), replace
 * this with the `sanitize-html` npm package at build time.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  return html
    // Strip <script> blocks and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Strip <style> blocks and their content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Strip dangerous embedding elements (no content expected inside these in blog posts)
    .replace(/<\/?(iframe|frame|frameset|object|embed|applet|base|link|meta)\b[^>]*>/gi, '')
    // Strip inline event handler attributes (onclick, onload, onerror, etc.)
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Strip javascript: and vbscript: pseudo-protocol URLs
    .replace(/(href|src|action)\s*=\s*["'](?:javascript|vbscript):[^"']*/gi, '$1="#"')
    // Strip data: URLs in src/href (allow safe image data URIs via <img src="data:image/...">)
    .replace(
      /(src|href)\s*=\s*"data:(?!image\/(?:png|jpg|jpeg|gif|svg\+xml|webp))[^"]*"/gi,
      '$1="#"'
    );
}
