# Phase 2 · Step 4 — Building accessible primitives

## The idea in one sentence

The registry now includes twenty form, navigation, overlay and feedback
primitives, each styled with theme tokens and catalogued in Storybook.

## Why use primitive libraries selectively

Text fields, textareas, tables, skeletons and breadcrumbs are mostly semantic
HTML with predictable styling, so they stay small and easy to customise.
Controls that need keyboard navigation, focus management, labeling or portal
behavior use Radix UI. Command search and toast notifications use cmdk and
Sonner. The kit keeps these packages as registry dependencies, not runtime
dependencies of the monorepo's applications: consuming projects install only
what the selected component needs.

## What a registry component includes

For each new primitive there are three connected artifacts:

1. Its implementation under `packages/ui/src/components/ui/`.
2. An item in `packages/ui/registry.json`, including external npm and internal
   registry dependencies.
3. One Storybook story under `apps/storybook/src/stories/ui/`.

`pnpm registry:check` verifies the source, imports, dependency declarations
and story all stay in sync. `pnpm stories:check` checks story titles, defaults,
variant coverage and token-safe content.

## Why the stories include states

A control's default appearance is not enough to judge whether it will work in
a dashboard. Stories also show relevant disabled, invalid, empty, collapsed
and directional states. Interactive callbacks use Storybook's `fn()` spy so
changes are visible in the Actions panel. The theme and mode toolbar makes
the same story useful across tenants and light/dark appearance.

## Current limitations

The sidebar primitive provides controlled and uncontrolled collapsed state
and a keyboard shortcut; responsive mobile navigation is composed separately
with Sheet. The Sonner story shows the notification viewport; application
code still calls Sonner's `toast` API when an event occurs. Reusable page
blocks and starter synchronization are later steps.

## Try it yourself

```bash
pnpm tokens:build
pnpm stories:check
pnpm registry:check
pnpm --filter @dashboard-kit/storybook typecheck
pnpm storybook:build
```
