---
name: new-page
description: Scaffold a new Astro page with BaseLayout, prerender export, and project conventions.
disable-model-invocation: true
argument-hint: <page-name> [title] [description]
---

# Scaffold a New Page

Create a new Astro page at `src/pages/$0.astro`.

## Arguments

- `$0` (required): Page name/path, e.g. `events` or `projects/dao-toolkit`
- `$1` (optional): Page title (defaults to capitalized page name)
- `$2` (optional): Meta description

## Template

Every page MUST follow this structure:

```astro
---
export const prerender = true;

import BaseLayout from '<relative-path>/layouts/BaseLayout.astro';
---

<BaseLayout
  title="<Title> — SuperBenefit"
  description="<description>"
>
  <section class="page-hero">
    <div class="container">
      <h1><Title></h1>
    </div>
  </section>

  <section class="page-content">
    <div class="container">
      <!-- Main content -->
    </div>
  </section>
</BaseLayout>

<style>
  .page-hero {
    background: var(--color-black);
    padding-block-start: calc(80px + var(--space-2xl));
    padding-block-end: var(--space-2xl);
  }

  .page-hero h1 {
    color: var(--color-cream);
    font-family: var(--font-serif);
    font-size: var(--text-3xl);
  }

  .page-content {
    background: var(--color-cream);
    padding-block: var(--space-2xl);
  }

  .container {
    max-width: 1200px;
    margin-inline: auto;
    padding-inline: var(--space-lg);
  }
</style>
```

## Conventions

1. **Always** include `export const prerender = true;` as the first frontmatter line.
2. Import `BaseLayout` from the correct relative path (`../layouts/BaseLayout.astro` for top-level, `../../layouts/BaseLayout.astro` for nested).
3. Do NOT import `SEO` — `BaseLayout` handles it via `title` and `description` props.
4. Use plain CSS with project design tokens from `src/styles/global.css`. Never Tailwind.
5. Use component-scoped `<style>` blocks, not global styles.
6. Use `data-theme` attribute selectors for theme-specific styling, not CSS classes.

After creating the file, run `npm run check` to verify there are no type errors.
