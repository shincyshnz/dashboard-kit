# @dashboard-kit/starter

The app every new project starts from. Inside the monorepo it doubles as the
live test bed for tokens and registry components.

```bash
pnpm dev          # from the repo root: token watcher + this app
```

## Make it yours (new project)

1. `src/config/app.config.ts` — name and description
2. `.env.local` (copy `.env.example`) — `VITE_APP_NAME`, `VITE_API_BASE_URL`
3. `src/config/navigation.ts` — sidebar menu
4. `design-tokens.json` — colours, radius, fonts, spacing, type scale, shadows, motion (see [DESIGN.md](../../DESIGN.md))
5. Delete the example features you don't need (`features/dashboard`, `features/design`)

## Pages

| Route | Feature | Shows |
|---|---|---|
| `/` | `features/dashboard` | KPI cards, orders table with URL filters (`?q=&status=`) |
| `/design` | `features/design` | Live preview of the active theme's tokens |

## Themes

The header has a theme picker (the registry Select, shown when more than one
theme exists) and a light/dark toggle. For a tenant app, pass the tenant's theme instead:

```tsx
<ThemeProvider forcedTheme={tenant.theme}>…</ThemeProvider>
```

## Registry components

`src/components/ui/` and `src/lib/utils.ts` are copies of the registry source
in `packages/ui`. In this monorepo, change them there and run
`pnpm registry:sync` (or `pnpm registry:sync <name>` to add one); see
[docs/REGISTRY.md](../../docs/REGISTRY.md#keeping-the-starter-in-sync).

Folder rules: [docs/PROJECT-STRUCTURE.md](../../docs/PROJECT-STRUCTURE.md).
