# ADR 0001 — Monorepo plus custom shadcn registry

**Status:** Accepted · 2026-10-10

## Context

The kit must be reused by many projects. Some parts must be identical
everywhere and fixed centrally (auth, API client, tokens compiler, lint
rules). Other parts — visual components — must be adaptable per project.
A template-only approach drifts; a package-only approach makes shadcn
components hard to customise.

## Decision

- A pnpm + Turborepo **monorepo** holds every package and the starter app.
- Locked logic ships as **npm packages** (`@dashboard-kit/tokens`, `auth`, `api`, `config`).
- Visual components ship through a **custom shadcn registry** (`packages/ui`), copied into projects.
- New projects begin as a copy of **`apps/starter`**.

## Consequences

- Fixes to shared logic reach all projects through version bumps.
- Projects own their component copies; registry updates are opt-in per component.
- We maintain a small hosting setup for registry JSON (Phase 2).
