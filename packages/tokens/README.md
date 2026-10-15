# @dashboard-kit/tokens

Compiles the root `DESIGN.md` and every `themes/<name>/DESIGN.md` into a
Tailwind v4 / shadcn theme, with validation and WCAG contrast checks.

## Outputs

| File | Use |
|---|---|
| `dist/theme.css` | `@import "@dashboard-kit/tokens/theme.css"` — every theme, ready for shadcn |
| `dist/base.css` | Default theme + Tailwind mapping, for lazy-loaded tenant themes |
| `dist/themes/<name>.css` | One tenant theme |
| `dist/tokens.json` | All themes' values and the theme list, for JavaScript |

## Commands

```bash
pnpm build                    # build all themes; exits 1 on any error
pnpm dev                      # rebuild on every save of any DESIGN.md
pnpm tokens-import --help     # Figma / Tokens Studio (DTCG JSON) → DESIGN.md
pnpm tokens-diff --help       # token changes + required version bump
pnpm test                     # vitest
```

From the repo root use `pnpm tokens:build`, `pnpm tokens:import`, `pnpm tokens:diff`.

Environment overrides: `DESIGN_FILE` (default `<repo>/DESIGN.md`),
`THEMES_DIR` (default `themes/` next to the design file).

## Source map

| File | Responsibility |
|---|---|
| `src/schema.ts` | DESIGN.md contract; required shadcn colours |
| `src/parse.ts` | Front matter, validation, merging tenant overrides |
| `src/load.ts` | Discovers the default and `themes/*` |
| `src/contrast.ts` | WCAG contrast pairs and results |
| `src/compile.ts` | Runtime variables, `@theme inline` mapping, CSS/JSON output |
| `src/color.ts` | Colour parsing (CSS + DTCG) and oklch formatting |
| `src/paths.ts` | File locations |
| `src/commands/*` | `build`, `import`, `diff` |

Full guide: [docs/DESIGN-TOKENS.md](../../docs/DESIGN-TOKENS.md).
