# ADR 0002 — DESIGN.md as the single source of design tokens

**Status:** Superseded by 0011 · 2026-10-15 (accepted 2026-10-10)

## Context

Theming must be changeable by editing one file, readable by designers and
developers, and importable into shadcn/Tailwind without manual steps.

## Decision

- Tokens live in the **YAML front matter of `DESIGN.md`**; the Markdown body documents them.
- `@dashboard-kit/tokens` validates the YAML (zod) and generates `theme.css`
  in shadcn's structure (`:root`, `.dark`, `@theme inline`, `@theme`) plus `tokens.json`.
- Colour names follow shadcn exactly; extra names are allowed.
- Generated files are never committed or hand-edited.

## Consequences

- One edit re-themes every component; watch mode gives instant feedback.
- Mistakes fail the build with token-level messages instead of silently breaking UI.
- The format is ours to evolve — schema changes require a `meta.version` major bump.
