# Phase 2 · Step 5 — Keeping the starter in sync with the registry

## The idea in one sentence

`pnpm registry:sync` copies registry components into the starter the way
`shadcn add` would, and `pnpm registry:check` fails if those copies drift.

## Why the starter holds copies, not imports

The registry model says projects *own* their components (ADR 0001). The
starter is the template every new project copies, so it has to look exactly
like a real project: components live in `src/components/ui/` as plain source,
not as imports from `packages/ui`. That keeps the starter honest — if it
works there, it works after `shadcn add` in a project.

The cost is two copies of the same file inside the monorepo. Without a guard,
someone fixes a bug in the starter's `button.tsx` and the registry never gets
it, or the other way round. That is the "copied registry components drift"
risk in the plan.

## Why not run `shadcn add` against a local server

It would work, but it needs a build, a running HTTP server and network-style
resolution for every sync. The registry source is already on disk, and
`registry.json` has everything `shadcn add` uses: the files, their types, the
npm `dependencies` and the `registryDependencies`. A short script reads the
same manifest and does the same three things:

1. Follow `registryDependencies` recursively (Select pulls in `utils`).
2. Map each file's `type` to a folder through the project's `components.json`
   aliases (`registry:ui` → `@/components/ui` → `src/components/ui`).
3. Install missing npm packages — here with `pnpm --filter … add`, reusing the
   range `packages/ui` already has, so the two can't pick different versions.

## One source, enforced

A rule people must remember is weaker than a check. `registry:sync --check`
compares every starter copy with its source and runs inside
`pnpm registry:check`, which is part of the definition of done. The fix is
always the same: edit `packages/ui`, run `pnpm registry:sync`.

With no arguments the script re-copies only what the starter already has, so
the starter stays small: it gets a component when it uses one
(`pnpm registry:sync select`), not all twenty-three.

## The first user: the theme picker

The header's theme picker was a native `<select>` with hand-written classes,
waiting for a Select component. It is now the registry Select: keyboard
navigation, a portal-based menu and token styling come from the shared
component, and the header code only describes the choices.

## Current limitations

The script never deletes files — removing a component from the starter is a
manual decision. It assumes `@/` maps to `src/` in both projects (true for
both tsconfigs). Projects outside the monorepo keep using `npx shadcn add`.

## Try it yourself

```bash
pnpm registry:sync --check        # passes
echo "// drift" >> apps/starter/src/components/ui/card.tsx
pnpm registry:check               # fails: card.tsx differs from packages/ui
pnpm registry:sync                # restores the copy
pnpm registry:sync tabs           # adds Tabs (+ @radix-ui/react-tabs) to the starter
```
