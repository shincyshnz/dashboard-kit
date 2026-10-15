# ADR 0008 — zod as the single validation library

**Status:** Accepted · 2026-10-12 · Partly resolves plan decision D5

## Context

Validation is needed in several places: forms, API responses, environment
variables and DESIGN.md. zod is already used for the latter two.

## Decision

- **zod** validates everything: form input, API responses, URL-independent config, env vars and design tokens.
- A form's schema is the source of its TypeScript type (`z.infer`), so types and validation rules cannot drift.
- Schemas live with their feature in `features/<name>/schemas.ts`; shared ones in `src/lib/schemas/`.
- Error messages are written in schemas, in plain sentence-case UI language ("Enter a valid email address").
- **Form state library: react-hook-form with `@hookform/resolvers/zod`** — recommended pairing; to be confirmed before Phase 4 (D5).

## Consequences

- One validation API for the whole stack; the same schema can validate a form and the API payload it sends.
- Invalid API responses fail loudly at the boundary instead of deep inside components.
- zod 4 is already a dependency of the tokens package and the starter; no new library.
