# ADR 0007 — TanStack Query for server state, Zustand for client state

**Status:** Accepted · 2026-10-12 · Resolves plan decisions D1 and D2

## Context

The kit needs a standard for state. Options considered: TanStack Query or SWR
or RTK Query for server data; Zustand or Redux Toolkit for client state.
URL-shareable state (filters, sorting, pagination, tabs) is already handled
by nuqs (ADR 0003), so the client store only holds a small amount of state.

## Decision

- **Server state: TanStack Query.** Every API read is a query; every write is a mutation that invalidates or updates the affected queries.
- **Client state: Zustand.** Small, focused stores (session, UI preferences); no single global store.
- **One home per kind of state** — enforced by review and documented in `docs/STATE-MANAGEMENT.md` (Phase 3):

| State | Lives in |
|---|---|
| Data from the API | TanStack Query cache — never copied into Zustand |
| Filters, search, sort, page, tab | URL (nuqs) |
| Session (current user, access token in memory) | Zustand store in `@dashboard-kit/auth` |
| UI preferences (sidebar collapsed, density) | Zustand store, persisted where useful |
| Form input | Form state (ADR 0008) |
| Local UI (open/closed) | `useState` |

- Query keys come from per-feature key factories (`features/<name>/api/keys.ts`); no inline string arrays.

## Consequences

- Little boilerplate; each feature owns its query hooks in `features/<name>/api/`.
- Caching, retries, background refetch, pagination and optimistic updates come built in.
- No Redux time-travel debugging; TanStack Query Devtools and Zustand's devtools middleware cover the practical needs.
- Teams with heavy shared client state could still add Redux in a single project without affecting the kit.
