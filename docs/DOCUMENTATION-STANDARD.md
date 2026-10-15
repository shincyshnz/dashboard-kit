# Documentation standard

Documentation is part of the work, not a follow-up. **A phase, feature or
package is not done until its documentation meets this standard**, and
`pnpm docs:check` must pass before any merge.

## 1. What must exist

| Artifact | Required when | Location | Checked by `docs:check` |
|---|---|---|---|
| Package / app README | Every package and app | `packages/*/README.md`, `apps/*/README.md` | ✅ exists, has a title and content |
| ADR | A decision that is hard to reverse or affects several packages | `docs/adr/NNNN-*.md` + row in `docs/adr/README.md` | ✅ format, status, sections, listed in index |
| Phase report | Every phase marked ✅ in `PLAN.md` | `docs/phases/phase-N.md` | ✅ exists with all required sections |
| Plan update | Every phase start and finish | `docs/PLAN.md` (status, task table, decisions) | — review |
| Changelog entry | Every change to a package version | `CHANGELOG.md` | ✅ every package version appears |
| Guide update | Any change to how people use the kit | The matching file in `docs/` | — review |
| Code comments | Non-obvious *why* (not *what*) | In code | — review |
| Learning note | Every step of a phase (requested for this project) | `docs/learning/phase-N-step-M-*.md` + row in its README | — review |
| Agent instructions | A folder has rules beyond the root ones; update whenever a rule changes | `AGENTS.md` in that folder (+ `CLAUDE.md` importing it) | — review; rules enforced by checks where possible |
| Working links | Always | All Markdown | ✅ relative links resolve |

## 2. Per-phase workflow

1. **Start:** set the phase to "🚧 in progress" in `PLAN.md`; confirm its open decisions; record each as an ADR before writing code that depends on it.
2. **During:** update guides in the same change as the code. A PR that changes behaviour without docs is incomplete.
3. **Finish:**
   - Mark each task ✅ in the plan's task table, with what was delivered.
   - Write `docs/phases/phase-N.md` from [the template](./phases/_template.md).
   - Add the `CHANGELOG.md` section and bump package versions.
   - Run `pnpm docs:check`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`.
4. **Acceptance:** the phase is accepted only after review of the phase report.

## 3. Writing rules

- **Audience first.** Guides answer "how do I…?"; ADRs answer "why?"; READMEs answer "what is this and how do I run it?".
- **Task-oriented headings** ("Add a tenant theme"), not system-oriented ones ("Theme loader internals").
- **Show the command or code** for every procedure; keep examples runnable and copied from real code.
- **Tables for reference, prose for reasoning, numbered lists only for real sequences.**
- **Sentence case**, plain verbs, no marketing language. Explain abbreviations on first use.
- **One source of truth.** Link to the canonical doc instead of repeating it. Rules live in `PROJECT-STRUCTURE.md` and `CONVENTIONS.md`; guides link there.
- **State limitations honestly** — what is not supported yet and why.
- **Date and version** anything that will age (plan status, ADR status, phase reports).

## 4. Required sections

**Package README:** purpose (one paragraph) · install/run commands · public API or outputs (table) · source map (table) · link to the full guide.

**ADR:** title `ADR NNNN — …` · `**Status:**` line (Proposed / Accepted / Superseded by NNNN) with date · Context · Decision · Consequences.

**Phase report:** Summary · Delivered · Decisions · Verification · Documentation updated · Known limitations · Next.

## 5. Pull requests

Every PR uses [the PR template](../.github/pull_request_template.md). Reviewers
reject PRs whose checklist is incomplete. From Phase 6, CI runs
`pnpm docs:check` on every PR.
