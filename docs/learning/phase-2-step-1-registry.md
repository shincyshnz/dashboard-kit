# Phase 2 · Step 1 — How a shadcn registry works

## The idea in one sentence

A shadcn registry is a folder of JSON files, each containing the **source
code** of a component plus a list of what it needs; the `shadcn` CLI downloads
those files and writes the code into your project.

## Why copy code instead of installing a package?

With an npm package, the code lives in `node_modules` and you can only change
it through props. With a registry, the code lands in `src/components/ui/`, and
you own it: edit it, delete a variant, add one. The trade-off is that updates
are no longer automatic — you re-add a component when you want the new version.
That's why the kit splits work: logic that must never drift (auth, tokens) is
an npm package; visuals that projects customise come from the registry.

## The three pieces

1. **`registry.json` (you write it).** A manifest: each item has a `name`, a
   `type`, its `files`, the npm packages it needs (`dependencies`) and other
   registry items it needs (`registryDependencies`).
2. **`shadcn build` (generates the output).** Reads the manifest, inlines each
   file's source into a `content` field, and writes one JSON file per item to
   `public/r/`. Open `packages/ui/public/r/button.json` after a build to see it.
3. **`shadcn add` (in the consuming project).** Reads `components.json` to find
   the registry URL, downloads the item and its dependencies recursively,
   installs npm packages, and writes the files — rewriting import paths like
   `@/lib/utils` to match that project's aliases.

## What a namespace is

`@dashboard-kit/button` is a *namespaced* item name. The project's
`components.json` maps the namespace to a URL template:

```json
"registries": { "@dashboard-kit": "https://…/r/{name}.json" }
```

`{name}` becomes `button`. Several registries can coexist in one project
(`@shadcn/…`, `@dashboard-kit/…`, a partner's registry).

## Why we added `registry:check`

`shadcn build` only checks that listed files exist. It doesn't notice a
component that imports a package you forgot to declare — that mistake only
shows up later, as a compile error in somebody else's project. Our check reads
every file's imports and compares them with the item's `dependencies`, so the
mistake fails here, in our repo, where it's cheap to fix. It also catches
files nobody registered and links to items that don't exist.

The check itself is ~70 lines of plain Node in
`packages/ui/scripts/check-registry.mjs`: read JSON, walk folders, run a
regular expression over `from "…"` imports. Worth reading — most tooling is
this simple underneath.

## What we verified

A fresh Vite project with a `components.json` pointing at a local server ran
`npx shadcn add @dashboard-kit/button @dashboard-kit/badge` and got
`components/ui/button.tsx`, `components/ui/badge.tsx` and `lib/utils.ts`
(pulled in automatically as a dependency), plus the npm packages.

One surprise worth knowing: the CLI also fetches a colour preset from
`ui.shadcn.com` while writing files, even for third-party registries. So
`shadcn add` needs internet access to shadcn's site, not only to your registry.

## Try it yourself

```bash
pnpm registry:build
cat packages/ui/public/r/button.json         # see the inlined source
pnpm registry:check                          # passes
# now remove "class-variance-authority" from the button item in registry.json
pnpm registry:check                          # see the error, then undo
```
