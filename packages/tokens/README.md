# @dashboard-kit/tokens

Compiles the root `design-tokens.json` and every `themes/<name>/design-tokens.json`
(DTCG format) into a Tailwind v4 / shadcn theme, with validation, WCAG contrast
checks, generated docs tables and editor schemas.

## Outputs

| File | Use |
|---|---|
| `dist/theme.css` | `@import "@dashboard-kit/tokens/theme.css"` — every theme, ready for shadcn |
| `dist/base.css` | Default theme + Tailwind mapping, for lazy-loaded tenant themes |
| `dist/themes/<name>.css` | One tenant theme |
| `dist/tokens.json` | All themes' resolved values and the theme list, for JavaScript |
| `schema/design-tokens.schema.json` | Editor schema for the root file (committed, generated) |
| `schema/theme-tokens.schema.json` | Editor schema for tenant files (committed, generated) |
| DESIGN.md token tables | Between the `tokens:start` / `tokens:end` markers (generated) |

## Commands

```bash
pnpm build                    # build all themes; exits 1 on any error
pnpm dev                      # rebuild on every save; also refreshes DESIGN.md tables
pnpm tokens-docs [--check]    # regenerate DESIGN.md tables (or fail if stale)
pnpm tokens-schema [--check]  # regenerate JSON Schemas (or fail if stale)
pnpm tokens-import --help     # Figma / Tokens Studio (DTCG JSON) → design-tokens.json
pnpm tokens-diff --help       # token changes + required version bump
pnpm test                     # vitest
```

From the repo root: `pnpm tokens:build`, `tokens:watch`, `tokens:docs`,
`tokens:schema`, `tokens:import`, `tokens:diff`.

Environment overrides: `TOKENS_FILE` (default `<repo>/design-tokens.json`),
`THEMES_DIR` (default `themes/` next to it), `DESIGN_DOC` (default `DESIGN.md` next to it).

## Source map

| File | Responsibility |
|---|---|
| `src/dtcg.ts` | DTCG tree helpers: flatten with inherited `$type`, aliases, JSON formatting |
| `src/values.ts` | DTCG values → CSS for each `$type` (string and object forms) |
| `src/convert.ts` | DTCG tree → internal design object; allowed groups and their `$type`s |
| `src/parse.ts` | JSON reading with line/column errors, validation, tenant merging |
| `src/schema.ts` | Internal design contract (zod); required shadcn colours |
| `src/load.ts` | Discovers the default and `themes/*` |
| `src/contrast.ts` | WCAG contrast pairs and results |
| `src/compile.ts` | Runtime variables, `@theme inline` mapping, CSS/JSON output |
| `src/docs.ts` | Generated token tables for DESIGN.md |
| `src/json-schema.ts` | Editor JSON Schemas |
| `src/color.ts` | Colour parsing and oklch formatting |
| `src/paths.ts` | File locations |
| `src/commands/*` | `build`, `docs`, `schema`, `import`, `diff` |

Full guide: [docs/DESIGN-TOKENS.md](../../docs/DESIGN-TOKENS.md).
