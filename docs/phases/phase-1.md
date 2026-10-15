# Phase 1 — Design token system, hardened

| | |
|---|---|
| **Status** | ✅ Complete · 2026-10-11 |
| **Versions** | `@dashboard-kit/tokens` 0.2.0 · Harbor theme 1.1.0 |

## Summary

Made theme changes safe and multi-brand: tenant themes that list only their
overrides, runtime switching, more themeable tokens, WCAG contrast checks,
Figma import and a theme diff tool.

## Delivered

| Task | Result |
|---|---|
| 1.1 Contrast check | Every text/surface pair, light + dark, every theme; configurable in `checks.contrast` |
| 1.2 Multiple themes | `themes/<name>/DESIGN.md` overrides merged onto the default; `theme.css`, `base.css`, `themes/<name>.css` |
| 1.3 Runtime switch | `data-theme` scoping; all themeable values are runtime variables; `ThemeProvider` with `setTheme` / `forcedTheme` |
| 1.4 Extended tokens | `density.spacing`, `fontSizes`, `motion.duration`, `motion.ease` (z-index dropped — no Tailwind namespace) |
| 1.5 Figma import | `pnpm tokens:import` (DTCG JSON), comment-preserving, rollback on invalid result |
| 1.6 Theme diff | `pnpm tokens:diff` with required semver bump and `--strict` |
| 1.7 Tests | 18 Vitest tests for parser, compiler, contrast, import, diff |

## Decisions

| Decision | Record |
|---|---|
| Runtime tenant themes with partial files (D11) | ADR 0005 |

## Verification

- `pnpm typecheck`, `pnpm lint`, `pnpm test` (18/18), `pnpm build` pass.
- Editing `themes/grove/DESIGN.md` during `pnpm dev` updates the page live.
- A 1.86:1 colour pair fails the build and names the pair.
- The contrast check found a real issue: Harbor light `success` was 4.34:1; fixed in 1.1.0.
- Import of the example Figma export changes only token lines.

## Documentation updated

- `docs/DESIGN-TOKENS.md` — rewritten (themes, runtime switching, checks, import, diff)
- `docs/ARCHITECTURE.md` — new token flow and runtime switching
- `docs/PROJECT-STRUCTURE.md` — `themes/` and tokens source map
- `packages/tokens/README.md`, `apps/starter/README.md`, `README.md`, `CHANGELOG.md`

## Known limitations

- Shadows are variables, so Tailwind `shadow-<colour>` modifiers do not apply.
- Theme picker is a native select until Phase 2's Select component.
- Contrast check skips translucent colours.

## Next

Phase 2 — component library and registry. Waiting on D7 (catalogue) and D8 (registry hosting).
