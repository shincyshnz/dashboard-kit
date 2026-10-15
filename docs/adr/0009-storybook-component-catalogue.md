# ADR 0009 — Storybook as the component catalogue

**Status:** Accepted · 2026-10-12 · Resolves plan decision D7

## Context

Teams need one place to browse every registry component, see its variants and
states, and check it against every theme in light and dark mode before
copying it into a project. Options: Storybook, or a custom docs app.

## Decision

- Use **Storybook** (React + Vite builder) in `apps/storybook`.
- Stories import components straight from `packages/ui/src` — the registry source — so the catalogue always shows what the registry ships.
- A toolbar switches theme (`data-theme`) and mode (`.dark`), driven by `tokens.json`, so every story can be reviewed in every theme.
- The static build is published to GitHub Pages next to the registry (ADR 0010).

## Consequences

- No custom docs app to build or maintain; controls, docs pages and accessibility checks come from Storybook addons.
- Storybook is a large dev dependency, isolated in its own workspace app.
- Writing a story becomes part of adding a registry component; `pnpm registry:check` fails without one.
