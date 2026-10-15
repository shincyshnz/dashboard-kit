# ADR 0003 — React Router 8 with nuqs for URL state

**Status:** Accepted · 2026-10-10

## Context

Dashboards depend on filters, sorting and pagination that users expect to
bookmark and share. Routing must support lazy-loaded features and, from
Phase 3, auth guards.

## Decision

- **React Router 8** in data-router mode (`createBrowserRouter`), with `lazy` feature routes.
- **nuqs** (`nuqs/adapters/react-router/v8`) for typed URL search-param state, mounted in the root layout.
- Each feature declares its parsers in `search-params.ts`.

## Consequences

- Filter state survives reloads and can be shared as a link with no extra code.
- Loaders give a natural place for auth checks in Phase 3.
- React Router 8 is recent; we follow its minor releases closely.
