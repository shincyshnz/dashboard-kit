# @dashboard-kit/auth — planned (Phase 3)

Not implemented yet. Scope agreed in [docs/PLAN.md](../../docs/PLAN.md#phase-3--authentication-and-data-layer):

- `AuthAdapter` interface (`login`, `refresh`, `logout`, `getCurrentUser`) so each project plugs in its own backend
- In-memory access token, refresh token in an httpOnly cookie
- Single-flight refresh on 401, request queue, logout on refresh failure
- React Router guards (`requireAuth` loader, `<RequireRole>`), `<Can permission="…">`
