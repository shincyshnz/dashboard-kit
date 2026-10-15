# ADR 0010 — Host the registry and Storybook on GitHub Pages

**Status:** Accepted · 2026-10-12 · Resolves plan decision D8

## Context

The registry is a folder of static JSON files; Storybook builds to static
HTML. Both need a URL. There is no AWS account; the code already lives on
GitHub, where Actions can build and deploy.

## Decision

- Publish one GitHub Pages site from a GitHub Actions workflow on every push to `main`:

| Path | Content |
|---|---|
| `/` | Storybook |
| `/r/<item>.json` | shadcn registry items |
| `/r/registry.json` | Registry index |

- Projects reference it in `components.json`:
  `"@dashboard-kit": "https://<org>.github.io/<repo>/r/{name}.json"`

## Consequences

- No servers, no cost, deploys are automatic and versioned with git.
- **The site is public on GitHub Free, Pro and Team plans, even for a private repository.** Only GitHub Enterprise Cloud supports private Pages. Anyone with the URL can read component source code and Storybook. This is acceptable for UI components built on open-source shadcn/ui.
- **Private alternative, if ever needed:** serve the built JSON from the private repo through `raw.githubusercontent.com` and pass a token, using shadcn's per-registry headers:
  ```json
  "@dashboard-kit": {
    "url": "https://raw.githubusercontent.com/<org>/<repo>/registry-dist/r/{name}.json",
    "headers": { "Authorization": "Bearer ${REGISTRY_TOKEN}" }
  }
  ```
  That would supersede this ADR.
