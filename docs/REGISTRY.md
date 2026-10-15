# Custom shadcn registry

## Why a registry

Visual components should be **owned** by each project: a team must be able to
tweak a table without forking a package. The shadcn registry model copies
source code into the project; our registry serves our themed versions.
See [ADR 0001](./adr/0001-monorepo-plus-registry.md).

## How it works

A registry is just **static JSON files**. Nothing runs on a server.

```
packages/ui/registry.json        manifest you edit: items, files, dependencies
packages/ui/src/…                component source you edit
        │
        ▼  pnpm registry:build   (registry:check, then `shadcn build`)
packages/ui/public/r/
  ├── registry.json              index of all items
  ├── button.json                one file per item, with the source code inlined
  └── …
        │
        ▼  deployed to GitHub Pages  (ADR 0010)
https://mvp-applications.github.io/dashboard-kit/r/button.json
```

A built item looks like this — the `content` field is the whole component:

```json
{
  "name": "button",
  "type": "registry:ui",
  "dependencies": ["@radix-ui/react-slot", "class-variance-authority"],
  "registryDependencies": ["@dashboard-kit/utils"],
  "files": [{ "path": "src/components/ui/button.tsx", "type": "registry:ui", "content": "import …" }]
}
```

When a project runs `npx shadcn add @dashboard-kit/button`, the CLI:

1. Looks up `@dashboard-kit` in the project's `components.json` → `registries` and fills `{name}` into the URL.
2. Downloads `button.json`, then every `registryDependencies` item (here `utils.json`), recursively.
3. Installs the npm `dependencies` with the project's package manager.
4. Writes each file to the folder its `type` maps to (`registry:ui` → the `ui` alias, `registry:lib` → `lib`), rewriting `@/lib/utils`-style imports to the project's aliases.

This flow was verified end to end against a fresh Vite project in Phase 2, Step 1.

## Item types we use

| Type | Goes to | Use for |
|---|---|---|
| `registry:ui` | `components/ui/` | shadcn primitives (Button, Dialog…) |
| `registry:block` | `components/` (per its files) | Composed components (StatCard, DataTable…) — Phase 2 Step 4+ |
| `registry:lib` | `lib/` | Helpers (`cn()`) |
| `registry:hook` | `hooks/` | Shared hooks |

## Adding a component

1. Create the file in `packages/ui/src/components/ui/<name>.tsx` (or `components/blocks/`).
2. Style it only with token-backed classes (rules below).
3. Add an item to `packages/ui/registry.json`: `name`, `type`, `title`, `description`, npm `dependencies`, `registryDependencies`, `files`.
4. `pnpm registry:check` — fails if anything is out of sync (below).
5. Add a story: `apps/storybook/src/stories/ui/<name>.stories.tsx` (or `blocks/`). `registry:check` fails without it — see [the Storybook README](../apps/storybook/README.md).
6. Copy it into `apps/starter` (Phase 2 Step 5 adds `registry:sync`).
7. Add a `CHANGELOG.md` line.

## What `registry:check` enforces

| Rule | Why |
|---|---|
| Every file in `registry.json` exists | A missing file breaks `shadcn add` for every project |
| Every file in `src/` is listed by an item | Unlisted files are invisible to projects |
| Every `registryDependencies` entry is an item in this registry | Prevents dangling references |
| Every npm package a file imports is in its item's `dependencies` | Otherwise the copied file fails to compile in the project |
| Every `registry:ui` / `registry:block` item has a story | The catalogue must show every component (ADR 0009) |

`react` and `react-dom` are exempt; every project has them.

## Styling rules for registry components

| Allowed | Not allowed |
|---|---|
| `bg-primary`, `text-muted-foreground`, `border-input` | `bg-blue-600`, `text-gray-500` |
| `rounded-md`, `rounded-xl` | `rounded-[7px]` |
| `shadow-sm`, `font-heading`, `font-mono` | `shadow-[0_2px_4px_#0003]`, `font-[Inter]` |
| `ring-ring/50`, `bg-destructive/90` | any hex, rgb or oklch value in a class |

Layout utilities (`flex`, `gap-4`, `px-6`, `size-9`) are fine — they follow
`density.spacing` automatically.

`pnpm lint` enforces this table with the `dashboard-kit/no-raw-design-values`
rule (from `@dashboard-kit/config/eslint/token-audit`). It reports Tailwind
palette classes (including `black` and `white`) and arbitrary colour, radius,
shadow and font values, with or without variants such as `hover:` or `dark:`.
If a component needs a colour the theme doesn't have, add a token to
`design-tokens.json` instead of working around the rule.

## Testing the registry locally

```bash
pnpm registry:build
cd packages/ui/public && python3 -m http.server 4400     # or: npx serve -l 4400 .
```

In any test project's `components.json`:

```json
"registries": { "@dashboard-kit": "http://localhost:4400/r/{name}.json" }
```

```bash
npx shadcn add @dashboard-kit/button
```

## Using it in a project

```json
"registries": {
  "@dashboard-kit": "https://mvp-applications.github.io/dashboard-kit/r/{name}.json"
}
```

Replace the org and repo in the URL if the repository lives elsewhere.

### Known gap until Phase 6

Components use theme classes (`bg-primary`, `bg-success`…). In a project
outside this monorepo, those exist only after the project imports
`@dashboard-kit/tokens/theme.css`, which needs the tokens package published
(Phase 6). Until then, use the registry from inside the monorepo, or copy
`theme.css` into the project.
