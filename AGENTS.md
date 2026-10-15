# AGENTS.md — Dashboard Kit

Instructions for AI coding agents (and a quick brief for people). Follow them
strictly. More specific `AGENTS.md` files in subfolders add rules for that
folder and win on conflicts — **read the nearest one before editing a file**:

| Folder | Instructions |
|---|---|
| `apps/storybook/` | [apps/storybook/AGENTS.md](./apps/storybook/AGENTS.md) — story rules S1–S11 |

## What this repo is

A pnpm + Turborepo monorepo: a theme pipeline (`design-tokens.json` → `@dashboard-kit/tokens`),
a shadcn component registry (`packages/ui`), a component catalogue
(`apps/storybook`) and a starter app (`apps/starter`). Start with
[README.md](./README.md) and [docs/PLAN.md](./docs/PLAN.md).

## Commands

```bash
pnpm install
pnpm tokens:build        # generate themes — run before anything else
pnpm typecheck
pnpm lint                # ESLint + structure rules + stories:check
pnpm test
pnpm build
pnpm registry:check
pnpm docs:check
```

## Rules that apply everywhere

1. **Theme values live only in `design-tokens.json` files** (root and `themes/<name>/`). MUST NOT hard-code colours, radii, fonts, shadows or spacing units in code, CSS or stories. Use token classes. Before changing the design, read the "For AI agents" section of [DESIGN.md](./DESIGN.md). ([docs/DESIGN-TOKENS.md](./docs/DESIGN-TOKENS.md))
2. **MUST NOT edit generated output:** `packages/tokens/dist/`, `packages/tokens/schema/`, the `tokens:start`…`tokens:end` block in DESIGN.md, `packages/ui/public/r/`, `apps/*/dist/`, `storybook-static/`. Regenerate with the matching command instead.
3. **Follow the folder rules** in [docs/PROJECT-STRUCTURE.md](./docs/PROJECT-STRUCTURE.md) and code rules in [docs/CONVENTIONS.md](./docs/CONVENTIONS.md).
4. **Respect recorded decisions** in [docs/adr/](./docs/adr/README.md). MUST NOT introduce a library or pattern that contradicts an ADR (e.g. Redux, Next.js, a second validation library); propose a new ADR instead.
5. **Dependencies:** add with `pnpm --filter <package> add`, never at the root; choose releases at least two weeks old; never upgrade majors without being asked.
6. **Never weaken a check** (lint rules, tsconfig strictness, `scripts/*check*.mjs`) to make code pass. No `any`, `@ts-ignore` or `eslint-disable` added to silence errors.
7. **Documentation ships with the change** — see [docs/DOCUMENTATION-STANDARD.md](./docs/DOCUMENTATION-STANDARD.md). Update the guide, README, `CHANGELOG.md` and, when a rule changes, the relevant `AGENTS.md`.

## Definition of done for any change

All of `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`,
`pnpm registry:check` and `pnpm docs:check` pass, and your final message lists
the commands you ran and their results. Never claim a check passed without
running it.
