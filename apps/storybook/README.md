# @dashboard-kit/storybook

Component catalogue for the registry. Every story renders the registry
**source** in `packages/ui/src`, so what you see is what
`npx shadcn add @dashboard-kit/<name>` installs. See [ADR 0009](../../docs/adr/0009-storybook-component-catalogue.md).

```bash
pnpm storybook          # from the repo root → http://localhost:6006
pnpm storybook:build    # static site in apps/storybook/storybook-static
```

## Toolbar

| Control | Sets | Source |
|---|---|---|
| **Theme** | `data-theme` on `<html>` | `tokens.json` → every `themes/<name>/DESIGN.md` |
| **Mode** | `.dark` on `<html>` | Light / dark |

Both are applied by the `withTheme` decorator in `.storybook/preview.tsx` — the
same two switches the apps use, so a story looks exactly as it will in a project.

## Layout

| Path | Purpose |
|---|---|
| `.storybook/main.ts` | Story locations, addons, Tailwind plugin, `@` → `packages/ui/src` alias |
| `.storybook/preview.tsx` | Global CSS, toolbar (`globalTypes`), theme decorator, defaults |
| `src/styles.css` | Tailwind + generated theme; `@source` adds `packages/ui/src` to scanning |
| `src/stories/ui/<name>.stories.tsx` | One file per `registry:ui` item (required by `registry:check`) |
| `src/stories/blocks/<name>.stories.tsx` | One file per `registry:block` item (from Step 4) |
| `src/stories/foundations/` | Token pages: colours, typography, radius, shadows, density |
| `scripts/check-stories.mjs` | `pnpm stories:check` — enforces the rules in AGENTS.md |
| `AGENTS.md` / `CLAUDE.md` | Rules for anyone (or any AI agent) editing stories |

## Writing a story

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Button",          // sidebar location
  component: Button,           // enables Docs page + controls from props
  args: { children: "Save" },  // default props for every story
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};                      // renders meta.args
export const Disabled: Story = { args: { disabled: true } };
```

**Rules:** the strict rules for stories (S1–S11) live in
[AGENTS.md](./AGENTS.md) — they apply to people and AI agents alike. Most are
enforced by `pnpm stories:check`, which also runs as part of `pnpm lint`.

## Version policy

All `storybook` / `@storybook/*` packages are pinned to the **same exact
version** (they must match). Upgrade them together, to a release at least
two weeks old.
