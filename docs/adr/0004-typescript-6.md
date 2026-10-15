# ADR 0004 — Stay on TypeScript 6 for now

**Status:** Accepted · 2026-10-10

## Context

TypeScript 7 (the native compiler) is available, but `typescript-eslint`
currently supports TypeScript below 6.1 only. Type-aware lint rules are part
of how we enforce code quality.

## Decision

Pin `typescript` to `~6.0.3` across the workspace.

## Consequences

- Linting and type checking work with the full toolchain today.
- Revisit when `typescript-eslint` supports TypeScript 7; upgrade with a new ADR.
