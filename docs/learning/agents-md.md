# Working with AI agents: AGENTS.md

## What AGENTS.md is

A plain Markdown file that AI coding agents read before working in a
repository: like a README, but written for them. It's an open convention
shared by many tools (OpenAI Codex, Cursor, GitHub Copilot's coding agent,
Gemini CLI, and others). Claude Code reads `CLAUDE.md` instead, so this repo
has small `CLAUDE.md` files that import `AGENTS.md` with the line `@AGENTS.md`
— one set of rules, every agent.

## Nesting: the nearest file wins

Agents read the `AGENTS.md` closest to the file they are editing, plus the
ones above it. So:

| File | Scope |
|---|---|
| `AGENTS.md` (root) | Whole repo: commands, global rules, definition of done |
| `apps/storybook/AGENTS.md` | Extra rules S1–S11 for stories |

Later, Phase 3 can add `packages/auth/AGENTS.md` with security rules, without
making the root file longer.

## Instructions guide; checks enforce

An agent can skip, misread or "creatively interpret" instructions — just like a
person skimming a README. So every rule that *can* be checked by a program is:

| Rule | Enforced by |
|---|---|
| S1 one story per registry item, no orphans | `stories:check`, `registry:check` |
| S2 titles match `registry.json` | `stories:check` |
| S3 `satisfies Meta`, `export default meta` | `stories:check` + TypeScript |
| S4 `Default` story | `stories:check` |
| S5 every `cva` variant and size shown | `stories:check` (reads the component's `cva` config) |
| S7 no hard-coded colours or lorem ipsum | `stories:check` |
| S6 accessibility | Accessibility panel today; automated in Phase 5 |
| S9–S11 setup, checks, paperwork | Review + PR template |

`stories:check` runs inside `pnpm lint`, so it can't be forgotten. Rule
numbers appear in its error messages, so an agent (or person) can look up
exactly which rule broke.

## Writing good agent instructions

- **Be specific and testable.** "Use `satisfies Meta<typeof X>`" beats "write good stories".
- **Say MUST / MUST NOT.** Agents treat soft wording ("try to") as optional.
- **Show the exact template** for the common case; agents copy patterns well.
- **List the verification commands** and require running them before finishing.
- **Close loopholes explicitly.** Agents under pressure to "make it pass"
  sometimes edit the test instead of the code — rule S10 forbids weakening checks.
- **Number the rules** and reference those numbers in tool output.
- **Keep it short and link out** to the full docs instead of copying them.

## How the S5 check works (worth reading)

`scripts/check-stories.mjs` finds `variants: { … }` in the component source,
reads the object with a tiny brace-matching parser (skipping strings), and
collects every option name (`default`, `secondary`, `sm`, `lg`…). Each one must
appear as a string in the story file. It's ~40 lines and no dependencies —
a good example of a cheap, targeted check instead of a big framework.

## Try it yourself

1. In `badge.stories.tsx`, remove `"warning"` from the `variants` array and run `pnpm stories:check`.
2. Undo, then add `className="bg-red-500"` to a badge and run it again.
3. Ask your AI agent to "add a Loading story to the Button stories" and check
   that it runs the verification commands from `apps/storybook/AGENTS.md`.
