# @dashboard-kit/ui — registry source

This package is **not installed** by projects. It is the source of the custom
shadcn registry. Projects *copy* components from it and then own the copy:

```bash
npx shadcn add @dashboard-kit/button @dashboard-kit/card
```

| Path | Purpose |
|---|---|
| `registry.json` | Registry manifest: every item, its files and dependencies |
| `src/components/ui/` | shadcn primitives, styled only with semantic tokens |
| `src/components/blocks/` | (Phase 4) composed components: DataTable, StatCard, PageHeader… |
| `src/lib/utils.ts` | `cn()` helper |
| `public/r/` | Build output (`pnpm registry:build`) — deployed as static JSON |
| `scripts/check-registry.mjs` | `pnpm registry:check` — keeps registry.json and src/ in sync |

Rules for every component here:

1. Use only semantic classes (`bg-primary`, `text-muted-foreground`,
   `rounded-lg`, `shadow-sm`, `font-heading`). Never raw palette classes like
   `bg-blue-600` or arbitrary values like `rounded-[7px]` — those would not
   follow design-tokens.json.
2. Register every new file in `registry.json`.
3. Keep upstream shadcn structure (`data-slot`, `cva` variants) so upgrades
   from shadcn stay easy to merge.

Full guide: [docs/REGISTRY.md](../../docs/REGISTRY.md).
