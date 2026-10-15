# Project structure (strict)

These rules apply to the monorepo and to every project created from the
starter. Rules marked 🔒 are enforced by ESLint.

## Monorepo

```
dashboard-kit/
├── design-tokens.json        default theme (DTCG) — every token name and value
├── DESIGN.md                 design guide, rules, agent instructions, generated token tables
├── themes/
│   └── <name>/
│       ├── design-tokens.json  tenant theme — overrides only
│       └── README.md           optional brand notes + changelog
├── apps/
│   ├── starter/              template app
│   └── storybook/            component catalogue (stories per registry item)
│       └── AGENTS.md         strict story rules S1–S11
├── packages/
│   ├── tokens/               design-token compiler + CLI (publishable)
│   │   ├── src/
│   │   │   ├── schema.ts     the internal design contract (zod)
│   │   │   ├── dtcg.ts       DTCG tree helpers: flatten, aliases, formatting
│   │   │   ├── values.ts     DTCG values → CSS (colour, dimension, font, shadow…)
│   │   │   ├── convert.ts    DTCG tree → design object; allowed groups and $types
│   │   │   ├── parse.ts      JSON reading, validation, theme merging
│   │   │   ├── docs.ts       generated token tables for DESIGN.md
│   │   │   ├── json-schema.ts  editor schemas for design-tokens.json
│   │   │   ├── load.ts       finds the default + themes/*
│   │   │   ├── contrast.ts   WCAG checks
│   │   │   ├── compile.ts    CSS + JSON output
│   │   │   ├── color.ts      colour parsing / oklch formatting
│   │   │   ├── paths.ts      file locations (DESIGN_FILE, THEMES_DIR)
│   │   │   ├── cli.ts        build | import | diff
│   │   │   └── commands/     one file per CLI command
│   │   ├── schema/           generated JSON Schemas (tokens:schema)
│   │   ├── test/             vitest suite
│   │   └── examples/         sample Figma export
│   ├── ui/                   registry source (not published to npm)
│   ├── config/               tsconfig + ESLint presets (publishable)
│   ├── auth/                 Phase 3 (publishable)
│   └── api/                  Phase 3 (publishable)
├── docs/                     this documentation
│   ├── adr/                  architecture decision records (+ index, template)
│   └── phases/               one report per completed phase (+ template)
├── scripts/
│   └── check-docs.mjs        documentation checks (pnpm docs:check)
├── .github/
│   └── pull_request_template.md
├── AGENTS.md                 rules for AI agents (CLAUDE.md imports it)
├── CHANGELOG.md
├── package.json              root scripts only — no runtime deps
├── pnpm-workspace.yaml
└── turbo.json
```

## Starter app (`apps/starter/src`)

```
src/
├── main.tsx                  entry: mounts <AppProviders/>; nothing else
├── app/                      app-wide wiring, no business logic
│   ├── providers/            context providers and their contexts
│   └── router/               route tree, root layout, (Phase 3) guards
├── components/
│   ├── ui/                   shadcn primitives — copied from the registry
│   └── layout/               AppShell, AppSidebar, AppHeader
├── features/                 one folder per business feature
│   └── <feature>/
│       ├── index.ts          PUBLIC API — the only file others may import
│       ├── pages/            route components
│       ├── components/       components used only by this feature
│       ├── data/ | api/      mock data now; from Phase 3: api/keys.ts (query keys) + query/mutation hooks
│       ├── schemas.ts        zod schemas for this feature's forms and API data
│       ├── search-params.ts  nuqs parsers for this feature's URL state
│       └── types.ts          feature types (when needed)
├── pages/                    pages that belong to no feature (404, error)
├── hooks/                    hooks shared by several features
├── config/                   app.config.ts, navigation.ts, routes.ts, env.ts
├── lib/                      framework-agnostic helpers (utils.ts)
└── styles/                   index.css (imports theme), fonts.css
```

## Rules

### Placement

1. A file used by **one feature** lives inside that feature.
2. A file used by **two or more features** moves to `components/`, `hooks/` or `lib/`.
3. `components/ui/` holds only registry components. Change them freely, but
   if the change is useful for all projects, upstream it to `packages/ui`.
4. Route paths are defined only in `config/routes.ts`; navigation only in `config/navigation.ts`.
5. Environment variables are read only in `config/env.ts` (validated with zod).
6. Theme values are defined only in design-tokens.json files. No colour, radius, font,
   spacing-unit, text-size, shadow or easing values in `styles/` or components.
7. A tenant theme folder contains `design-tokens.json`, an optional `README.md` (and, later, brand assets
   such as a logo). Its folder name is its theme id.

### Imports

8. 🔒 Import a feature only through its `index.ts`: `@/features/dashboard`, never `@/features/dashboard/components/x`.
9. 🔒 No deep relative imports (`../../`). Use `@/…` across folders; `./` or `../` only inside one feature.
10. Features do not import other features' internals. If two features need the same thing, rule 2 applies.
11. 🔒 Type-only imports use `import type`.

### Naming

| Thing | Convention | Example |
|---|---|---|
| Files and folders | kebab-case | `orders-table.tsx`, `search-params.ts` |
| Components | PascalCase, named export | `export function OrdersTable()` |
| Hooks | `use-*.ts`, `useCamelCase` | `use-theme.ts` → `useTheme` |
| Pages | `<name>-page.tsx` | `dashboard-page.tsx` |
| Constants | camelCase objects, `as const` | `paths`, `navigation` |
| Tokens | kebab-case, shadcn names | `sidebar-primary-foreground` |

No default exports, except where a tool requires them (config files).

## Adding a feature — checklist

1. `src/features/<name>/` with `index.ts` and `pages/<name>-page.tsx`
2. Path in `config/routes.ts`
3. Lazy route in `app/router/router.tsx`
4. Menu entry in `config/navigation.ts` (if it appears in the sidebar)
5. URL state in `search-params.ts` (if it has filters)
