# Phase 2 · Step 6 — Publishing to GitHub Pages with Actions

## The idea in one sentence

Every push to `main` builds Storybook and the registry, merges them into one
static folder and publishes it to GitHub Pages — Storybook at `/`, registry
JSON at `/r/`.

## Why one site for two things

Both outputs are plain static files: Storybook builds to HTML and JavaScript,
and the registry is a folder of JSON (see Step 1). Static files need only a
file host, and GitHub Pages is free next to the code (ADR 0010). Putting the
registry under `/r/` inside the Storybook site gives one URL to remember and
one deploy to watch.

## How the workflow is shaped

`.github/workflows/pages.yml` has two jobs:

1. **build** — check out, install pnpm (version read from `packageManager`)
   and Node 22, install the *locked* dependencies (`--frozen-lockfile`), run
   the checks, then `pnpm pages:build`. The result, `site/`, is uploaded as a
   special "Pages artifact".
2. **deploy** — takes that artifact and publishes it with
   `actions/deploy-pages`.

The split matters for permissions. Publishing needs `pages: write` and
`id-token: write` (Pages verifies the deploy with a short-lived OpenID
Connect token). Only the small deploy job gets those; the build job, which
runs all the project's code, can only read the repository.

`concurrency: pages` with `cancel-in-progress: false` makes pushes queue
instead of cancelling a deploy halfway.

## Why the checks run before deploying

The site is what other projects install from. A broken component on `main`
would otherwise reach every `npx shadcn add` within minutes. If any check
fails the job stops, nothing is uploaded, and the last good deploy stays live.

## Why `pages:build` is a script, not workflow steps

The assembly (copy Storybook, copy the registry into `r/`) lives in
`scripts/build-pages.mjs`, so you can build the identical site on your laptop
with `pnpm pages:build` and test it before pushing. The workflow only calls
the script. The script also refuses to run if Storybook ever produces its own
`r/` folder, which would silently hide the registry.

## Sub-paths: the classic Pages trap

A project site lives at `https://<owner>.github.io/<repo>/`, not at the domain
root. Any absolute link like `/assets/app.js` would break. Storybook's build
uses relative links, and the registry is fetched by full URL from
`components.json`, so both work under the sub-path. The local preview in
`docs/REGISTRY.md` serves `site/` under `/dashboard-kit/` to prove it.

## Pinning action versions

Each action is pinned to an exact release tag (`actions/checkout@v7.0.1`),
not a moving major tag (`@v7`), following the repo rule of using releases at
least two weeks old: a moving tag would pick up a release published
yesterday. Upgrading is a deliberate edit.

## Current limitations

- Pages must be switched on once by a repository admin: Settings → Pages →
  Source: **GitHub Actions**. A workflow can't do this with its default token.
- The site is public on GitHub's Free, Pro and Team plans, even for a private
  repository (ADR 0010).
- Pull requests are not built or checked yet; that is Phase 6.3.

## Try it yourself

```bash
pnpm pages:build
mkdir -p /tmp/pages && ln -sfn "$PWD/site" /tmp/pages/dashboard-kit
python3 -m http.server 4410 -d /tmp/pages
# http://localhost:4410/dashboard-kit/                 → Storybook
# http://localhost:4410/dashboard-kit/r/button.json    → registry item
```
