# Dashboard Kit

A company template for building React dashboards. One design file, one
component registry, one starter app — reused across every project.

| | |
|---|---|
| **UI** | React 19.3, shadcn/ui (new-york), Tailwind CSS 4.3 |
| **Routing** | React Router 8 (data router, lazy routes) + nuqs for URL state |
| **Build** | Vite 8, TypeScript 6 (strict), pnpm workspaces, Turborepo |
| **State** | TanStack Query (server), Zustand (client), nuqs (URL); zod for all validation |
| **Theming** | `design-tokens.json` (DTCG, + tenant themes) → `@dashboard-kit/tokens` → Tailwind/shadcn theme, switchable at runtime |
| **Distribution** | Monorepo packages (locked logic) + custom shadcn registry (editable UI) |

## Quick start

```bash
nvm use            # Node 22
corepack enable    # uses the pnpm version pinned in package.json
pnpm install
pnpm dev           # starts the token watcher and the starter app
```

Open the URL Vite prints. The **Design tokens** page previews the current theme.

## Change the theme

Edit **[design-tokens.json](./design-tokens.json)** — nothing else. Your editor
autocompletes token names from its schema. While `pnpm dev` runs, every
component updates on save. **[DESIGN.md](./DESIGN.md)** explains the design and
the rules, with token tables generated from the JSON. Invalid values and low-contrast colour pairs are
reported in the terminal with the exact token name.

Need a second brand or tenant? Add `themes/<name>/design-tokens.json` with only
the values that differ, and switch with `<html data-theme="<name>">` — see
[themes/grove](./themes/grove/design-tokens.json) for an example.

## Repository map

```
dashboard-kit/
├── design-tokens.json   ← the default theme's values (DTCG; single source of truth)
├── DESIGN.md            ← design guide + rules + generated token tables
├── themes/<name>/       ← tenant themes: design-tokens.json with overrides only
├── apps/starter/        ← template app new projects start from
├── apps/storybook/      ← component catalogue with theme + mode toolbar
├── packages/
│   ├── tokens/          ← design-tokens.json → theme.css + tokens.json; docs / schema / import / diff CLI
│   ├── ui/              ← shadcn registry source (23 primitives and surfaces)
│   ├── config/          ← shared tsconfig + ESLint (incl. structure rules)
│   ├── auth/            ← planned, Phase 3
│   └── api/             ← planned, Phase 3
└── docs/                ← plan, architecture, rules, guides, ADRs
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Token watcher + starter dev server |
| `pnpm build` | Builds tokens, then the starter |
| `pnpm typecheck` | `tsc` in every package |
| `pnpm lint` | ESLint, including folder-structure rules |
| `pnpm test` | Unit tests (tokens compiler today) |
| `pnpm tokens:build` | Regenerate themes from the design-tokens.json files once |
| `pnpm tokens:docs` | Regenerate the token tables in DESIGN.md |
| `pnpm tokens:schema` | Regenerate the JSON Schemas used for editor autocomplete |
| `pnpm tokens:import --file x.json` | Import Figma / Tokens Studio variables into design-tokens.json |
| `pnpm tokens:diff` | Show token changes vs git and check the version bump |
| `pnpm docs:check` | Verify READMEs, ADRs, phase reports, changelog and links |
| `pnpm registry:check` | Verify registry.json matches the component source and the starter's copies are in sync |
| `pnpm registry:sync [name…]` | Copy registry components into `apps/starter` (re-copies existing ones; names add new ones) |
| `pnpm registry:build` | Build the registry JSON into `packages/ui/public/r` |
| `pnpm storybook` | Component catalogue on http://localhost:6006 |
| `pnpm stories:check` | Enforce the story rules (also part of `pnpm lint`) |
| `pnpm storybook:build` | Static Storybook in `apps/storybook/storybook-static` |
| `pnpm pages:build` | Build the GitHub Pages site (Storybook at `/`, registry at `/r/`) into `site/` |

## Using AI coding agents

Agents read [AGENTS.md](./AGENTS.md) (Claude Code via [CLAUDE.md](./CLAUDE.md)).
Folder-specific rules live in nested `AGENTS.md` files, e.g.
[apps/storybook/AGENTS.md](./apps/storybook/AGENTS.md).

## Documentation

| Doc | Read it when |
|---|---|
| [docs/PLAN.md](./docs/PLAN.md) | You want the roadmap, phases and open decisions |
| [docs/DOCUMENTATION-STANDARD.md](./docs/DOCUMENTATION-STANDARD.md) | You finish a task, a phase or open a PR |
| [docs/phases/](./docs/phases) | You want what each completed phase delivered |
| [docs/learning/](./docs/learning/README.md) | You want to understand *how* things work, step by step |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | You need to know how the pieces fit |
| [docs/PROJECT-STRUCTURE.md](./docs/PROJECT-STRUCTURE.md) | You add a file and need to know where it goes |
| [docs/DESIGN-TOKENS.md](./docs/DESIGN-TOKENS.md) | You change or extend the theme |
| [docs/REGISTRY.md](./docs/REGISTRY.md) | You add or consume a component |
| [docs/CONVENTIONS.md](./docs/CONVENTIONS.md) | You write code or open a PR |
| [docs/adr/](./docs/adr/README.md) | You want to know *why* a decision was made |
