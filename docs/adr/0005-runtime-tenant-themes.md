# ADR 0005 — Runtime tenant themes with partial DESIGN.md files

**Status:** Accepted · 2026-10-11 · Resolves plan decision D11

## Context

Several projects (notably multi-tenant dashboards) need different brands in
one deployed app, switched without a rebuild. Tenants usually differ in a
handful of values, and keeping a full copy of every token per tenant would
drift and be hard to review.

## Decision

- Tenant themes live in `themes/<name>/DESIGN.md` and list **only overrides**.
  They are deep-merged onto the root DESIGN.md before validation.
- Themes are scoped with `:root[data-theme="<name>"]` (and `.dark` on top).
- **Every themeable value is a runtime CSS variable** — not only colours and
  radius, but fonts (`--dk-font-*`), spacing unit (`--dk-spacing`), text sizes,
  shadows and easing. `@theme inline` maps Tailwind's namespaces onto them.
- The Tailwind mapping is generated once from the **default** token set, so
  themes may change values but may not add token names.
- `theme.css` bundles every theme; `base.css` + `themes/<name>.css` allow lazy loading.

## Consequences

- Switching tenant or mode is an attribute change — instant, no reload.
- A tenant theme is typically 20–40 lines and easy to review in a PR.
- Adding a token always starts in the root DESIGN.md, keeping one source of truth.
- Spacing becomes a theme knob (`density.spacing`), which is powerful but global;
  docs warn to change it in small steps.
- Tailwind's `shadow-<color>` modifiers don't combine with variable-based shadows;
  acceptable for dashboards.
