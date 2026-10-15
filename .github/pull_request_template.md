## What and why

<!-- One paragraph: what changes and why. Link the plan task (e.g. Phase 2, task 2.3). -->

## How to verify

<!-- Commands or steps a reviewer can follow. -->

## Checklist

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` pass
- [ ] `pnpm docs:check` passes
- [ ] Rules in the nearest `AGENTS.md` followed (stories: `pnpm stories:check`)
- [ ] If a rule changed: the relevant `AGENTS.md` updated
- [ ] Guides in `docs/` updated for any behaviour change
- [ ] Package README updated if its API, outputs or commands changed
- [ ] ADR added for any lasting decision (and listed in `docs/adr/README.md`)
- [ ] `CHANGELOG.md` updated and package versions bumped
- [ ] `docs/PLAN.md` task status updated
- [ ] If a design-tokens.json changed: `meta.version` bumped (`pnpm tokens:diff --strict`), DESIGN.md changelog line added, tables regenerated (`pnpm tokens:docs`)
