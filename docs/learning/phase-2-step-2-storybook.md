# Phase 2 · Step 2 — Storybook from scratch

## What Storybook is

A separate app that renders your components **in isolation**, one "story" per
state — "Button, disabled", "Card, metric". You browse them in a sidebar,
change props live, and check them against themes, without running the real
dashboard or logging in.

## How it is put together

Storybook has two halves:

| Half | Runs | Configured in |
|---|---|---|
| **Manager** | The outer UI: sidebar, toolbar, addon panels | `.storybook/main.ts` (addons) |
| **Preview** | An `<iframe>` where your components render | `.storybook/preview.tsx` |

They talk to each other through messages. That's why the theme toolbar lives
in the manager but must change the `<html>` element *inside the iframe* — the
decorator does that.

### `main.ts`: the build

- `framework: "@storybook/react-vite"` — use Vite to bundle, React to render.
- `stories: [...]` — glob patterns. Storybook finds every `*.stories.tsx` file matching them.
- `addons` — `addon-docs` (auto-generated Docs pages) and `addon-a11y` (accessibility checks).
- `viteFinal` — hook to change Storybook's Vite config. We add the Tailwind
  plugin and the `@` alias, because our components import `@/lib/utils`.

### `preview.tsx`: what every story shares

- **Global CSS import** — Tailwind and the generated theme.
- **`globalTypes`** — defines toolbar menus. Their current values are
  "globals", available to every story as `context.globals`.
- **Decorators** — functions that wrap every story:
  `(Story, context) => <Story />`. Ours reads `context.globals.theme` and
  `.mode` and sets `data-theme` / `.dark` before the story renders.
- **`parameters`** — defaults such as layout and a11y settings.
- **`tags: ["autodocs"]`** — every component gets a generated Docs page.

## Anatomy of a story file (CSF — Component Story Format)

A story file is an ES module:

- the **default export** (`meta`) says which component, default `args`
  (props) and controls;
- each **named export** is one story. `{}` means "render with the default
  args"; `{ args: {...} }` overrides some; `render` gives full control.

`satisfies Meta<typeof Button>` (instead of `: Meta`) keeps TypeScript's exact
type of `meta`, so `StoryObj<typeof meta>` knows which args are required.

## Three things that tripped us up, and why

1. **Tailwind classes missing.** Tailwind v4 scans files to decide which
   classes to generate, starting from the project folder. Our components live
   in `packages/ui`, outside `apps/storybook`, so `bg-success` didn't exist
   until we added `@source "../../../packages/ui/src";` to the CSS.
2. **The `@` import alias.** Components import `@/lib/utils`. In a real
   project `@` means "this project's src". In Storybook we point it at the
   registry source, via `viteFinal` (for Vite) and `tsconfig.json` `paths`
   (for TypeScript). Both are needed — they are separate tools.
3. **Version pinning.** Storybook 10.6.2 was released the day before this
   step. We used 10.6.1 instead (two weeks old), following our dependency
   rule, and pinned every Storybook package to the same exact version because
   they must match.

## How we verified it

`pnpm storybook:build` produced a static site; a headless browser opened
stories with `?globals=theme:grove;mode:dark` in the URL and read back
`data-theme`, `.dark` and the computed `--primary` value. Screenshots showed
Grove's green primary, smaller corners and denser spacing. That URL trick is
also handy for sharing a specific theme view with a colleague.

## Enforcing it

`pnpm registry:check` now fails if a `registry:ui` or `registry:block` item
has no story file. Try it: rename `card.stories.tsx` and run the check.

## Try it yourself

```bash
pnpm storybook
```

1. Open **UI → Button → Variants**, switch **Theme** to Grove and **Mode** to Dark.
2. Edit `themes/grove/DESIGN.md` (e.g. `radius: 0rem`) with `pnpm tokens:watch` running in another terminal, and watch Storybook update.
3. Open the **Accessibility** panel on **UI → Button → Sizes** and see the checks for the icon button.
4. Add a story `Loading` to `button.stories.tsx` that renders a disabled button with the text "Saving…".
