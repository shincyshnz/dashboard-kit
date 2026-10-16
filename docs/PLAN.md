# Dashboard Kit — Project Plan

| | |
|---|---|
| **Status** | Phases 0–1 complete · Phase 2 🚧 in progress (Steps 1–6 and token migration done) |
| **Owner** | Frontend team |
| **Last updated** | 2026-10-16 |

---

## 1. Purpose

Give every new company dashboard the same foundation, so teams start from a
working, branded, secure app on day one instead of rebuilding login, layout,
tables and theming each time.

### Goals

1. **One-file theming.** A project changes its whole look by editing `design-tokens.json` only (DESIGN.md explains it).
2. **Instant design feedback.** A token change reaches every component on save in dev and on every build in CI.
3. **Shared, centrally fixed logic.** Auth, API client and configuration are installed packages, upgraded with a version bump.
4. **Editable UI.** Components are copied into projects through a custom shadcn registry, so each project can adapt them.
5. **Strict, documented structure.** Every file has one obvious place; lint rules enforce the important boundaries.
6. **Fast start.** A new project runs with its own branding in under 30 minutes.

### Non-goals (for v1)

- Server-side rendering / React Server Components (the kit targets Vite SPAs).
- A no-code dashboard builder.
- Supporting frameworks other than React. `design-tokens.json` and `theme.css` stay framework-neutral, so this stays possible later.

---

## 2. Decisions already made

| Area | Decision | Record |
|---|---|---|
| Repo model | Monorepo (pnpm + Turborepo) **plus** custom shadcn registry | [ADR 0001](./adr/0001-monorepo-plus-registry.md) |
| Theme source | `design-tokens.json` (DTCG) → generated Tailwind v4 theme; DESIGN.md is the guide with generated tables | [ADR 0011](./adr/0011-dtcg-json-tokens.md) (supersedes 0002) |
| Routing & URL state | React Router 8 (data router) + nuqs | [ADR 0003](./adr/0003-react-router-and-nuqs.md) |
| Language | TypeScript 6 strict (not 7 yet) | [ADR 0004](./adr/0004-typescript-6.md) |
| Tenant theming | Runtime themes via `data-theme`, partial `themes/<name>/design-tokens.json` files (D11 = yes) | [ADR 0005](./adr/0005-runtime-tenant-themes.md) |
| Framework | React + Vite SPA, not Next.js; React Router framework mode if a server layer is ever needed | [ADR 0006](./adr/0006-react-vite-not-nextjs.md) |
| State | TanStack Query (server state) + Zustand (client state) + nuqs (URL state) (D1, D2) | [ADR 0007](./adr/0007-tanstack-query-and-zustand.md) |
| Validation | zod everywhere: forms, API responses, env, tokens | [ADR 0008](./adr/0008-zod-for-validation.md) |
| Documentation | Strict standard, enforced by `pnpm docs:check` | [DOCUMENTATION-STANDARD](./DOCUMENTATION-STANDARD.md) |
| Component catalogue | Storybook in `apps/storybook`, theme + mode toolbar | [ADR 0009](./adr/0009-storybook-component-catalogue.md) |
| Hosting | GitHub Pages: Storybook at `/`, registry at `/r/` (public site) | [ADR 0010](./adr/0010-github-pages-hosting.md) |
| UI | React 19.3, shadcn/ui new-york style, Tailwind 4.3, lucide icons | — |
| Build | Vite 8 | — |
| Package scope | `@dashboard-kit/*` (rename once before first publish) | — |

## 3. Open decisions — need your confirmation

These block the phases noted. Recommendations are marked ★.

| # | Question | Options | Blocks |
|---|---|---|---|
| ~~D1~~ | ~~Server-state library~~ | **Decided: TanStack Query** (ADR 0007) | — |
| ~~D2~~ | ~~Client-state library~~ | **Decided: Zustand** (ADR 0007) | — |
| D3 | Token storage | ★ Access token in memory + refresh token in httpOnly cookie · localStorage | Phase 3 |
| D4 | Data tables | ★ TanStack Table + nuqs for sort/page/filter | Phase 4 |
| D5 | Form state library (validation decided: zod, ADR 0008) | ★ react-hook-form + `@hookform/resolvers/zod` · TanStack Form | Phase 4 |
| D6 | Charts | ★ shadcn charts (Recharts) | Phase 4 |
| ~~D7~~ | ~~Component catalogue~~ | **Decided: Storybook** (ADR 0009) | — |
| ~~D8~~ | ~~Registry hosting~~ | **Decided: GitHub Pages** (ADR 0010) | — |
| D9 | Final npm scope and registry URL | e.g. `@mvp/*`, `registry.company.dev` | Phase 6 |
| D10 | Right-to-left (Arabic) and i18n support in v1? | Yes · Later | Phase 4 |
| ~~D11~~ | ~~Runtime per-tenant themes in v1?~~ | **Decided: yes** (ADR 0005) | — |

---

## 4. Phases

Each phase ends with a working, documented state. Nothing starts until the
previous phase is accepted.

### Phase 0 — Foundations ✅ done

**Delivered**
- Monorepo: `pnpm-workspace.yaml`, `turbo.json`, Node 22 + pnpm pinned
- `@dashboard-kit/config`: strict tsconfig presets, ESLint flat config with folder rules
- `DESIGN.md` with the default "Harbor" theme (light + dark, radius, type, shadows)
- `@dashboard-kit/tokens`: parse → validate (zod) → compile `theme.css` + `tokens.json`; watch mode
- `@dashboard-kit/ui`: registry manifest with `utils`, `button`, `card`, `badge`
- `apps/starter`: React Router 8 with lazy routes, nuqs filters, theme toggle, overview page, design-token preview page
- All documentation in `docs/`

**Accepted when** `pnpm install && pnpm build && pnpm typecheck && pnpm lint` pass, and editing `DESIGN.md` during `pnpm dev` updates the page. *(Verified.)*

### Phase 1 — Design token system, hardened ✅ done

**Goal:** make theme changes safe and support several themes.

| Task | Status | Delivered |
|---|---|---|
| 1.1 Contrast check | ✅ | WCAG check on every `X`/`X-foreground` pair + text on surfaces, light and dark, every theme. `checks.contrast` sets minimum, mode (error/warn/off) and extra pairs |
| 1.2 Multiple themes | ✅ | `themes/<name>/DESIGN.md` (now `design-tokens.json`, ADR 0011) lists only overrides; merged onto the default, validated, built to `theme.css`, `base.css`, `themes/<name>.css` |
| 1.3 Runtime theme switch | ✅ | `:root[data-theme="<name>"]` scoping; every themeable value is a runtime variable; `ThemeProvider` with `setTheme` / `forcedTheme`; no-flash pre-paint script; header theme picker |
| 1.4 Extended tokens | ✅ | `density.spacing`, `fontSizes`, `motion.duration`, `motion.ease`. *Dropped:* `zIndex` — Tailwind has no z-index theme namespace; revisit with named layers in Phase 4 if needed |
| 1.5 Figma import | ✅ | `pnpm tokens:import` for DTCG JSON (Figma Variables / Tokens Studio); converts to oklch, keeps comments, validates and rolls back on failure |
| 1.6 Theme diff | ✅ | `pnpm tokens:diff` vs git ref or file; reports required semver bump; `--strict` for CI |
| 1.7 Tests | ✅ (added) | Vitest suite for parser, compiler, contrast, import and diff (18 tests) |

**Accepted when** a second theme builds, switches at runtime without reload, and a low-contrast value fails the build with a clear message. *(Verified: Grove and Ember themes switch live; a 1.86:1 pair fails the build; editing a theme file hot-reloads the dev server.)*

### Phase 2 — Component library and registry 🚧 in progress

**Goal:** full shadcn primitive set, distributed from our registry, browsable in Storybook.
Built step by step, with a learning note per step in [docs/learning](./learning/README.md).

| Step | Task | Status |
|---|---|---|
| 1 | **Registry fundamentals:** build pipeline, `registry:check` (files, dependencies, references), verified `shadcn add` round trip, registry URL set for GitHub Pages | ✅ |
| 2 | **Storybook:** `apps/storybook` (10.6.1), stories for button/badge/card + foundations pages, theme + mode toolbar from `tokens.json`, a11y addon, `registry:check` requires a story per component; rendering verified in a headless browser across themes | ✅ |
| 2b | **Token format migration (inserted):** values moved from YAML in DESIGN.md to DTCG `design-tokens.json`; DESIGN.md becomes the guide with generated tables; JSON Schemas for editors; outputs verified byte-identical (ADR 0011) | ✅ |
| 3 | **Token audit lint rule:** `dashboard-kit/no-raw-design-values` in `@dashboard-kit/config` rejects palette classes (incl. black/white) and arbitrary colour, radius, shadow and font values; `packages/ui` now runs `pnpm lint`; RuleTester suite | ✅ |
| 4 | **Primitives:** input, label, textarea, select, checkbox, switch, dialog, sheet, dropdown-menu, popover, tooltip, tabs, table, skeleton, separator, avatar, sonner, sidebar, breadcrumb, command — each registered with dependencies and a Storybook story | ✅ 20 accessible, token-styled registry components and stories |
| 5 | **Starter sync:** `registry:sync` copies registry source into the starter; header theme picker becomes the registry Select | ✅ `pnpm registry:sync [name…]` copies items + registry deps and adds npm deps; `registry:check` fails on drift; header uses the registry Select (verified switching themes live) |
| 6 | **Deploy:** GitHub Actions workflow builds registry + Storybook and publishes to GitHub Pages | ✅ `.github/workflows/pages.yml` (push to `main` + manual): verify → `pnpm pages:build` → deploy; site verified locally under a `/dashboard-kit/` sub-path. First live deploy needs Pages source set to GitHub Actions |
| 7 | **Close-out:** consumer test from the Pages URL, phase report, version bumps | ⏳ |

**Accepted when** a fresh Vite app can run `npx shadcn add @dashboard-kit/button` against the GitHub Pages URL and get a themed button, and every registry component has a story that renders in every theme.

### Phase 3 — Authentication and data layer

**Goal:** a ready-made, secure login flow and a standard way to call APIs.

| Task | Detail |
|---|---|
| 3.1 `@dashboard-kit/auth` | `AuthAdapter` interface (`login`, `refresh`, `logout`, `getCurrentUser`); default JWT adapter |
| 3.2 Token handling | Per D3: access token in memory, refresh via httpOnly cookie, silent refresh on page load |
| 3.3 Refresh flow | On 401: one shared refresh call, queue other requests, retry; logout on failure |
| 3.4 Guards | React Router `requireAuth` loader, `<RequireRole>`, `<Can permission="…">`, redirect back after login |
| 3.5 `@dashboard-kit/api` | `createHttpClient()`, typed `ApiError`, zod response validation (ADR 0008) |
| 3.6 State | TanStack Query client + devtools, query-key factories, Zustand stores; `docs/STATE-MANAGEMENT.md` with the "what goes where" rule (ADR 0007) |
| 3.7 Starter pages | Login, forgot password, session-expired, 403 pages |
| 3.8 Mock backend | MSW handlers so the starter runs without a real API |

**Accepted when** the starter logs in against MSW, survives a reload, refreshes an expired token transparently, and blocks a route by role.

### Phase 4 — Dashboard building blocks

| Task | Detail |
|---|---|
| 4.1 App shell | Collapsible sidebar (shadcn sidebar), breadcrumbs, user menu, mobile sheet nav |
| 4.2 DataTable | TanStack Table; sort, page, filter and column visibility synced to the URL with nuqs |
| 4.3 Page blocks | PageHeader, StatCard, EmptyState, ErrorState, FilterBar, ConfirmDialog |
| 4.4 Forms | Form field wrappers using zod schemas (ADR 0008) and the D5 form-state library |
| 4.5 Charts | Chart wrappers reading `chart-1…5` tokens (per D6) |
| 4.6 Command palette | ⌘K navigation built from `config/navigation.ts` |
| 4.7 i18n / RTL | Only if D10 = yes |

**Accepted when** the starter has a complete CRUD example feature (list → detail → edit) using only kit blocks.

### Phase 5 — Quality

| Task | Detail |
|---|---|
| 5.1 Unit tests | Vitest + Testing Library for components; extend the existing tokens suite to full branch coverage |
| 5.2 E2E | Playwright: login, guard, table URL state, theme toggle |
| 5.3 Accessibility | axe checks in Storybook and Playwright; keyboard paths documented |
| 5.4 Visual regression | Screenshot each story per theme to catch token side effects |

### Phase 6 — Distribution and CI/CD

| Task | Detail |
|---|---|
| 6.1 Versioning | Changesets; semver for every package; token-file version in `$extensions` meta |
| 6.2 Publish | GitHub Packages for `tokens`, `auth`, `api`, `config` |
| 6.3 Pipelines | GitHub Actions: PR = typecheck, lint, test, build, `tokens:diff --strict`; main = publish + deploy registry |
| 6.4 Scaffolder | `pnpm create dashboard-kit <name>` copies the starter and asks for name, API URL, theme |

### Phase 7 — Adoption

- Migration guide for existing dashboards (adopt tokens first, then components, then auth)
- Example project built from the scaffolder
- Upgrade guide per release

---

## 5. Indicative timeline

| Weeks | Phase |
|---|---|
| 0 | Phase 0 ✅ |
| 1 | Phase 1 ✅ |
| 2–4 | Phase 2 🚧 |
| 4–6 | Phase 3 |
| 6–8 | Phase 4 |
| 8–9 | Phase 5 (runs alongside 3–4 where possible) |
| 9–10 | Phase 6–7 |

## 6. Risks

| Risk | Mitigation |
|---|---|
| Projects edit generated `theme.css` (or DESIGN.md's tables) instead of `design-tokens.json` | Header warnings, `dist/` git-ignored, CI regenerates, `docs:check` fails on stale tables |
| Copied registry components drift from the source | `registry:sync`, with `registry:check` failing on starter drift; registry versioning and a changelog per component |
| Hard-coded colours bypass tokens | Phase 2 lint rule; code review checklist |
| Fast-moving dependencies (React Router 8, TS 7, Tailwind 4.x) | Pin ranges, upgrade on a schedule, record in ADRs |
| Auth needs differ per backend | Adapter interface instead of hard-coded endpoints |

## 7. Definition of done (every phase)

A phase is done only when **all** of these hold. Details and templates:
[DOCUMENTATION-STANDARD.md](./DOCUMENTATION-STANDARD.md).

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` pass
- `pnpm docs:check` passes
- Every task in the phase table is marked ✅ with what was delivered (or explicitly dropped, with the reason)
- Each decision taken during the phase has an ADR, listed in `docs/adr/README.md`
- Guides in `docs/` describe the new behaviour; package READMEs match their API
- Phase report `docs/phases/phase-N.md` written from the template
- `CHANGELOG.md` section added and package versions bumped
