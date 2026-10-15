# AGENTS.md — Storybook rules (apps/storybook)

These instructions apply to **any change under `apps/storybook/`**, made by a
person or an AI agent. They are mandatory. "MUST" and "MUST NOT" are strict.
Repo-wide rules are in the [root AGENTS.md](../../AGENTS.md); this file adds to them.

Most rules are enforced by `pnpm stories:check` (`scripts/check-stories.mjs`).
Its error messages cite the rule numbers below (S1–S11).

## Context you need

- Stories render the **registry source** in `packages/ui/src` through the `@`
  alias. A story shows exactly what `npx shadcn add @dashboard-kit/<name>` installs.
- The toolbar sets `data-theme` (tenant theme) and `.dark` (mode) on `<html>`
  via the `withTheme` decorator in `.storybook/preview.tsx`.
- Themes come from `DESIGN.md` files. Components and stories use only token classes.

## Rules

**S1 — One story file per component.** Every `registry:ui` item MUST have
`src/stories/ui/<item-name>.stories.tsx`; every `registry:block` item MUST have
`src/stories/blocks/<item-name>.stories.tsx`. `<item-name>` is the `name` in
`packages/ui/registry.json`. Story files MUST NOT exist for items that are not
in the registry. Only `*.stories.tsx` files go in `src/stories/{ui,blocks,foundations}`.

**S2 — Titles.** `title` MUST be `"UI/<item title>"` or `"Blocks/<item title>"`,
using the item's `title` from `registry.json` exactly. Token pages use `"Foundations/<Topic>"`.

**S3 — File shape.** Use this exact structure:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: { children: "Save changes", onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

- Import components from `@/components/ui/<name>` or `@/components/blocks/<name>` (the registry source).
- MUST NOT copy, re-implement or wrap component code inside a story file.
- MUST use `satisfies Meta<typeof Component>`, not a `: Meta` annotation.

**S4 — Default story.** Every component file MUST export `Default`, rendering
`meta.args` with no extra settings.

**S5 — Full coverage.** Stories MUST show **every** option of every `cva`
variant group in the component (e.g. every `variant` and every `size`).
Also add a story for each state the component supports: disabled, loading,
empty, error, long content, `asChild` — whichever apply.

**S6 — Accessibility.** Icon-only controls MUST have an `aria-label`.
Decorative icons next to text MUST have `aria-hidden`. A new or changed story
MUST show no violations in the Accessibility panel in light and dark mode, in
the default theme and at least one tenant theme.

**S7 — Tokens and content only.** Stories MUST NOT contain hard-coded visual
values: no hex/`oklch()`/`rgb()`/`hsl()` colours, no Tailwind palette classes
(`bg-blue-500`), no arbitrary values (`rounded-[7px]`, `bg-[…]`). Use token
classes (`bg-primary`, `text-muted-foreground`, `rounded-lg`). Use realistic
dashboard content (orders, revenue, team members) — never "lorem ipsum".
Layout utilities (`flex`, `gap-2`, `max-w-sm`) are allowed.

**S8 — Interactions.** Event props (`onClick`, `onValueChange`…) MUST use
`fn()` from `storybook/test` in `args`. No `console.log`, no `alert`.

**S9 — Global setup is off-limits.** MUST NOT change `.storybook/main.ts`,
`.storybook/preview.tsx`, `src/styles.css`, `package.json` dependencies or
Storybook versions unless the task explicitly asks for it. If it does: all
`storybook` / `@storybook/*` packages stay on one identical, exact version at
least two weeks old, and the README is updated in the same change.

**S10 — Never weaken checks.** MUST NOT edit `scripts/check-stories.mjs`,
`packages/ui/scripts/check-registry.mjs`, lint config or TypeScript settings
to make a story pass, and MUST NOT add `// @ts-ignore`, `eslint-disable` or
`any`. Fix the story (or the component) instead. Changing a rule needs a
person's approval and an update to this file.

**S11 — Paperwork.** A new story for a new component comes with the registry
entry (see [docs/REGISTRY.md](../../docs/REGISTRY.md)) and a `CHANGELOG.md` line.

## Workflow

1. Read the component source in `packages/ui/src` and its item in `packages/ui/registry.json`.
2. Create or edit the story following S1–S8.
3. Run every command below. All MUST pass.
4. Report what you changed and the command results.

## Verify (all MUST pass before you finish)

```bash
pnpm tokens:build                                   # generated theme the stories need
pnpm stories:check                                  # rules S1–S7 (automated)
pnpm registry:check                                 # registry ↔ source ↔ stories
pnpm --filter @dashboard-kit/storybook typecheck
pnpm --filter @dashboard-kit/storybook lint         # includes stories:check
pnpm storybook:build                                # stories compile and render
```

If a command fails, fix the cause. Do not finish with a failing command, and
do not report success without having run them.
