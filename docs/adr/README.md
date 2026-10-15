# Architecture decision records

An ADR records one decision with lasting impact: its context, the decision and
its consequences. ADRs are never edited after acceptance (except to mark them
superseded); a changed decision gets a new ADR.

| # | Decision | Status |
|---|---|---|
| [0001](./0001-monorepo-plus-registry.md) | Monorepo plus custom shadcn registry | Accepted |
| [0002](./0002-design-md-single-source.md) | DESIGN.md as the single source of design tokens | Superseded by 0011 |
| [0003](./0003-react-router-and-nuqs.md) | React Router 8 with nuqs for URL state | Accepted |
| [0004](./0004-typescript-6.md) | Stay on TypeScript 6 for now | Accepted |
| [0005](./0005-runtime-tenant-themes.md) | Runtime tenant themes with partial DESIGN.md files | Accepted |
| [0006](./0006-react-vite-not-nextjs.md) | React + Vite SPA, not Next.js | Accepted |
| [0007](./0007-tanstack-query-and-zustand.md) | TanStack Query for server state, Zustand for client state | Accepted |
| [0008](./0008-zod-for-validation.md) | zod as the single validation library | Accepted |
| [0009](./0009-storybook-component-catalogue.md) | Storybook as the component catalogue | Accepted |
| [0010](./0010-github-pages-hosting.md) | Host the registry and Storybook on GitHub Pages | Accepted |
| [0011](./0011-dtcg-json-tokens.md) | Design tokens in DTCG JSON; DESIGN.md becomes the guide | Accepted |

## Writing a new ADR

1. Copy [`_template.md`](./_template.md) to `NNNN-short-title.md` (next number).
2. Fill in Context, Decision, Consequences. Keep it to one page.
3. Add a row to the table above.
4. `pnpm docs:check` verifies the format and that this index is complete.
