# Conventions

## Code

- TypeScript strict, including `noUncheckedIndexedAccess`. No `any`; use `unknown` and narrow.
- Named exports only (config files excepted).
- One component per file; file name = component name in kebab-case.
- Props interfaces sit above the component and are not exported unless reused.
- Styling only through Tailwind utilities backed by tokens. No inline colour values; `style` is allowed only to read a CSS variable (e.g. the swatch preview).
- Every interactive element is reachable by keyboard and has a visible focus ring (`focus-visible:ring-*`).
- Icon-only buttons have an `aria-label`.

## State placement ([ADR 0007](./adr/0007-tanstack-query-and-zustand.md))

| State | Where |
|---|---|
| Filters, search, sort, page, tab | URL via nuqs (`features/<name>/search-params.ts`) |
| Server data | TanStack Query — never copied into a Zustand store |
| Session, UI preferences | Zustand stores |
| Form input | Form state library (D5), validated by zod |
| Purely local UI (open/closed) | `useState` |

## Validation ([ADR 0008](./adr/0008-zod-for-validation.md))

- Every form, API response and env var is validated with zod.
- Derive types from schemas (`z.infer<typeof schema>`); don't write a parallel interface.
- Schemas live in `features/<name>/schemas.ts`; shared ones in `src/lib/schemas/`.
- Error messages are UI copy: sentence case, say how to fix it.

## Copy (UI text)

- Sentence case. Plain verbs: "Save changes", not "Submit".
- An action keeps its name through the flow: "Delete order" → toast "Order deleted".
- Errors say what happened and what to do next. Empty states invite an action.

## Git

- Branches: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`, `chore/<topic>`.
- Commits: Conventional Commits — `feat(tokens): add contrast check`.
- Scopes: `tokens`, `ui`, `config`, `auth`, `api`, `starter`, `docs`, `repo`.
- Every PR follows the [PR template](../.github/pull_request_template.md): typecheck, lint, test, build and `docs:check` pass; docs and changelog updated.

## Dependencies

- Add with `pnpm --filter <package> add <dep>`, never at the root (root holds tooling only).
- Prefer releases that are at least two weeks old.
- Major upgrades of React, React Router, Tailwind or TypeScript get an ADR.

## Documentation

Documentation ships with the code. The rules, required artifacts and
templates are in [DOCUMENTATION-STANDARD.md](./DOCUMENTATION-STANDARD.md);
`pnpm docs:check` enforces them. ADRs: see [docs/adr/README.md](./adr/README.md).
