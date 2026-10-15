# ADR 0006 — React + Vite SPA, not Next.js

**Status:** Accepted · 2026-10-12

## Context

The question was raised whether the kit should be built on Next.js instead of
React + Vite. Dashboards built from the kit sit behind a login, are used for
long sessions, have no SEO needs, and are deployed to Ubuntu/EC2 and static
hosting. Phases 0–1 are already built on Vite + React Router 8.

## Decision

Keep **React + Vite** as a client-rendered SPA with **React Router 8**
(data-router mode). Do not adopt Next.js.

If a server layer becomes necessary (for example a backend-for-frontend that
keeps tokens out of the browser, or aggregating several APIs), use
**React Router 8 framework mode** rather than switching frameworks.

## Consequences

- Deployment stays simple: static files behind Nginx, S3 or a CDN; no Node runtime to operate.
- One mental model (everything runs in the browser); no server/client component split.
- Runtime tenant theming (ADR 0005) needs no server/client coordination.
- No built-in SSR or SEO; acceptable for authenticated dashboards. Public marketing pages belong in a separate site.
- `DESIGN.md`, `@dashboard-kit/tokens` and `theme.css` stay framework-neutral, so a future move remains possible.
