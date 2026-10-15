# Architecture

## The three delivery channels

The kit reaches projects in three ways, chosen by how much a project should be
allowed to change each part.

| Channel | Contains | Project can edit? | Updates arrive by |
|---|---|---|---|
| **npm packages** (`@dashboard-kit/*`) | tokens compiler, auth, api client, config | No | Version bump |
| **shadcn registry** | Primitives (Button, Card…) and blocks (DataTable…) | Yes — the project owns its copy | `npx shadcn add` again |
| **Starter app** | Providers, router, layout, example features | Yes | One-time copy at project start |

See [ADR 0001](./adr/0001-monorepo-plus-registry.md) for why.

## How a design change flows

```
design-tokens.json (DTCG)       themes/<name>/design-tokens.json (overrides only)
   │                                 │
   ▼  parse.ts                       ▼  deep-merged onto the default tree
resolve {aliases} → convert.ts (DTCG → design object) → validate (zod)
   │                                 │  + no new token names
   │                                 │
   ▼  contrast.ts                    ▼
WCAG check, light + dark, every theme (fails the build on error)
   │
   ▼  compile.ts
dist/theme.css
   :root                     { --primary: …; --radius: …; --dk-spacing: …; --dk-font-sans: … }
   .dark                     { --primary: … }
   @theme inline             { --color-primary: var(--primary); --spacing: var(--dk-spacing); … }
   :root[data-theme="grove"]       { …every value for Grove… }
   :root[data-theme="grove"].dark  { … }
dist/base.css · dist/themes/<name>.css · dist/tokens.json
   DESIGN.md token tables (tokens:docs) · schema/*.schema.json (tokens:schema)
   │
   ▼  @import "@dashboard-kit/tokens/theme.css"  (apps/starter/src/styles/index.css)
Tailwind v4 utilities: bg-primary, p-4 = calc(var(--dk-spacing) * 4), rounded-lg, font-heading…
   │
   ▼
shadcn components (only semantic classes) → every screen
```

Three details make changes propagate everywhere:

1. **Everything themeable is a runtime variable.** Colours, radius, fonts,
   spacing, text sizes, shadows and easing all resolve through CSS variables,
   and `@theme inline` points Tailwind at them. Switching `.dark` or
   `data-theme` changes every value with no rebuild.
2. **One Tailwind mapping.** It is generated from the default theme's token
   names, which is why tenant themes may change values but not add names.
3. **Components use semantic names only** (`bg-primary`, never
   `bg-blue-600`), so a token change has no component it can miss.

In development, `turbo run dev` starts the token watcher and Vite together.
Saving any design-tokens.json rewrites `theme.css` (and DESIGN.md's generated tables); Vite's Tailwind plugin sees the
changed import and hot-reloads the styles.

## Theme switching at runtime

```
<html class="dark" data-theme="grove">
        │               │
        │               └─ ThemeProvider.theme  (user choice, or forcedTheme from tenant config)
        └───────────────── ThemeProvider.mode   (light | dark | system)
```

`index.html` applies both before React loads, so there is no flash of the
wrong theme. The available themes come from `tokens.json` → `list`.

## Packages and dependency rules

```
apps/starter ──► @dashboard-kit/tokens   (CSS + JSON only)
             ──► @dashboard-kit/config   (dev only)
             ──► @dashboard-kit/auth     (Phase 3) ──► @dashboard-kit/api
packages/ui  ──► (copied into apps, never imported at runtime)
apps/storybook ──► packages/ui/src (via the "@" alias, to render the registry source)
               ──► @dashboard-kit/tokens
```

| Rule | Reason |
|---|---|
| Packages never import from `apps/` | Apps are consumers, not libraries |
| `packages/ui` is never a runtime dependency | It is a registry source; projects get copies |
| `tokens` has no React dependency | Keeps theming framework-neutral |
| `auth` depends on `api`, not the reverse | The HTTP client stays usable without auth |

## Runtime structure of the starter

```
main.tsx
 └─ AppProviders            app/providers/app-providers.tsx
     └─ ThemeProvider       .dark + data-theme on <html>
         └─ RouterProvider  app/router/router.tsx (lazy feature routes)
             └─ RootLayout  app/router/root-layout.tsx
                 └─ NuqsAdapter (react-router/v8)
                     └─ AppShell → AppSidebar + AppHeader + <Outlet/>
```

Phase 3 adds `AuthProvider` and the server-state provider inside
`AppProviders`, and an auth loader on the protected route branch.

## URL state (nuqs)

Anything a user would expect to survive a reload or be shareable — filters,
search, sort, pagination, selected tab — lives in the URL through nuqs.
Each feature declares its parsers once in `features/<name>/search-params.ts`
and reads them with `useQueryStates`. Defaults are omitted from the URL
(setting a value to `null` clears it).
