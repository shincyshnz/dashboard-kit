# ADR 0011 — Design tokens in DTCG JSON; DESIGN.md becomes the guide

**Status:** Accepted · 2026-10-15 · Supersedes 0002; amends file names in 0005

## Context

ADR 0002 stored token values as YAML front matter inside `DESIGN.md`, next to
their explanation. In practice:

- Designers work in Figma, whose variable exports (and Tokens Studio, Style
  Dictionary) use the W3C Design Tokens Community Group (DTCG) JSON format.
  Every import had to translate DTCG into our own YAML.
- YAML is easy to break (indentation, implicit types), and editors can't offer
  autocomplete for a YAML block inside Markdown.
- Tenant themes multiply token files; agents and scripts edit them more
  reliably as strict, schema-checked JSON.

## Decision

- **Values** live in `design-tokens.json` (default) and
  `themes/<name>/design-tokens.json` (tenant overrides only), in DTCG structure:
  groups, `$value`, `$type` (inherited from groups), `$description`, and
  `{group.token}` aliases. Kit metadata (name, version, contrast checks) lives in
  `$extensions["dev.dashboard-kit"]`.
- Values may be readable CSS strings (`"oklch(…)"`, `"0.625rem"`, `"120ms"`) or
  DTCG object forms; strings are the house style. Light and dark are groups
  `color.light` / `color.dark` (DTCG has no settled modes format yet).
- **`DESIGN.md`** becomes the human and agent guide: design intent, rules,
  agent instructions and the theme changelog. Its token tables are **generated**
  from the JSON (`pnpm tokens:docs`) and `pnpm docs:check` fails when stale.
- JSON Schemas (`packages/tokens/schema/*.schema.json`) are generated from the
  same source as the validator and referenced via `$schema` for editor
  autocomplete; a test fails if they drift.
- The compiler, contrast check, runtime theming and all outputs are unchanged.

## Consequences

- Figma/Tokens Studio exports map directly; a round trip back to Figma becomes possible.
- Editors validate token files while typing; typos in group or token names are flagged.
- The token file is longer (~390 lines vs ~100 lines of YAML) and has no comments;
  `$description` fields and the generated tables replace comments.
- Two files instead of one, but each has one job, and drift between them is checked.
- Migration verified: all generated CSS and JSON outputs were byte-identical before and after.
