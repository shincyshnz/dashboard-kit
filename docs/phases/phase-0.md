# Phase 0 — Foundations

| | |
|---|---|
| **Status** | ✅ Complete · 2026-10-10 |
| **Versions** | `@dashboard-kit/tokens` 0.1.0 · `config` 0.1.0 · `ui` 0.1.0 · `starter` 0.1.0 |

## Summary

Set up the monorepo, the DESIGN.md → Tailwind/shadcn token pipeline, the
registry source package and a runnable starter app, with project documentation.

## Delivered

| Task | Result |
|---|---|
| Monorepo | pnpm workspaces + Turborepo; Node 22 and pnpm pinned |
| Shared config | Strict tsconfig presets; ESLint flat config with folder rules |
| Token pipeline | `DESIGN.md` → validated → `theme.css` + `tokens.json`; watch mode |
| Registry source | `utils`, `button`, `card`, `badge` in `packages/ui` |
| Starter app | React 19.3, React Router 8 (lazy routes), nuqs filters, theme toggle, overview and design pages |
| Documentation | README, PLAN, ARCHITECTURE, PROJECT-STRUCTURE, DESIGN-TOKENS, REGISTRY, CONVENTIONS |

## Decisions

| Decision | Record |
|---|---|
| Monorepo plus custom registry | ADR 0001 |
| DESIGN.md as the single token source | ADR 0002 |
| React Router 8 + nuqs | ADR 0003 |
| TypeScript 6 | ADR 0004 |

## Verification

`pnpm install`, `pnpm build`, `pnpm typecheck`, `pnpm lint` pass. Editing
DESIGN.md during `pnpm dev` hot-reloads styles. The folder lint rule rejects
a deep feature import.

## Documentation updated

All initial docs created.

## Known limitations

No auth, API layer or tests yet; registry not hosted.

## Next

Phase 1 — design token system hardening.
