# DESIGN.md — Harbor, the Dashboard Kit design

This file **explains** the design. The values live in
[`design-tokens.json`](./design-tokens.json) (DTCG format); tenant themes live
in `themes/<name>/design-tokens.json`. The token tables near the end are
**generated** from the JSON and must not be edited by hand.

> **To change the look, edit `design-tokens.json`** (or a tenant theme's file).
> Never put colours, radii, fonts, shadows or spacing units anywhere else.

## Design intent

Harbor is built for long working sessions on data-dense screens.

- **Quiet surfaces, one strong colour.** Neutrals are slightly cool (hue ≈ 230). Petrol blue (`primary`) marks actions and the current location; nothing else competes with it.
- **Status is semantic, not decorative.** `success`, `warning` and `destructive` appear only for states (paid, pending, failed), never as accent colours.
- **Readable first.** Every text/surface pair meets WCAG AA (4.5:1) in light and dark; the build enforces it.
- **Calm geometry.** A 10px base radius (`0.625rem`), soft low shadows, and the default 4px spacing unit.
- **Two typefaces.** Public Sans for interface text, JetBrains Mono for IDs, codes and figures that need alignment.

## How a value reaches the screen

```
design-tokens.json  ──► @dashboard-kit/tokens (validate, contrast-check, compile)
                    ──► packages/tokens/dist/theme.css  (:root, .dark, [data-theme], @theme inline)
                    ──► Tailwind utilities (bg-primary, rounded-lg, p-4, font-heading…)
                    ──► shadcn components → every screen
```

While `pnpm dev` runs, saving the JSON updates every component in about a
second — and refreshes the tables in this file.

## Changing tokens: rules

1. **Edit the JSON, not this file's tables.** Run `pnpm tokens:docs` (or keep `pnpm dev` running) to refresh them.
2. **Keep pairs readable.** Every `X` / `X-foreground` pair must reach 4.5:1 in light and dark. The build fails otherwise and names the pair.
3. **Light and dark list the same colour names.**
4. **New token names start here.** Add a new colour (e.g. `info` + `info-foreground`) to the default `design-tokens.json`, in both modes, with a `$description`. Tenant themes may only change values of existing tokens.
5. **Prefer `oklch()`** for colours; it keeps lightness predictable across hues.
6. **Use aliases for "same as".** `"$value": "{color.light.primary}"` keeps two tokens in step.
7. **Bump the version** in `$extensions["dev.dashboard-kit"].meta.version` (patch: value change · minor: new token · major: removed/renamed token) and add a changelog line below. `pnpm tokens:diff` tells you which bump is required.
8. **Load new fonts.** If you change `font.*`, load the family in each app's fonts CSS.

## For AI agents

When asked to change the design:

- MUST edit `design-tokens.json` or `themes/<name>/design-tokens.json` only. MUST NOT hard-code design values in components, CSS or stories, and MUST NOT edit the generated block in this file or anything in `packages/tokens/dist/`.
- MUST keep the file valid against its `$schema` and follow rules 1–8 above.
- MUST run, and report the results of:
  ```bash
  pnpm tokens:build          # validation + contrast check
  pnpm tokens:docs           # refresh the tables in this file
  pnpm tokens:diff           # confirm the version bump
  pnpm docs:check
  ```
- If the contrast check fails, adjust lightness of the colour pair; MUST NOT lower `checks.contrast.minimum` or switch the mode to `warn`/`off` unless a person asked for it.

Full reference: [docs/DESIGN-TOKENS.md](./docs/DESIGN-TOKENS.md).

## Token reference

<!-- tokens:start — generated from design-tokens.json by `pnpm tokens:docs`; do not edit by hand -->

### Colours — Harbor v1.1.0

| Token | Light | Dark | Use |
|---|---|---|---|
| `background` | `oklch(0.985 0.003 230)` | `oklch(0.18 0.015 240)` | Page background. |
| `foreground` | `oklch(0.21 0.02 240)` | `oklch(0.95 0.005 230)` | Default text on background. |
| `card` | `oklch(1 0 0)` | `oklch(0.22 0.017 240)` | Card surface. |
| `card-foreground` | `oklch(0.21 0.02 240)` | `oklch(0.95 0.005 230)` | Text on cards. |
| `popover` | `oklch(1 0 0)` | `oklch(0.22 0.017 240)` | Menus, popovers and dropdowns. |
| `popover-foreground` | `oklch(0.21 0.02 240)` | `oklch(0.95 0.005 230)` | Text in popovers. |
| `primary` | `oklch(0.45 0.09 225)` | `oklch(0.72 0.1 220)` | Main brand / action colour (primary buttons, links, active states). |
| `primary-foreground` | `oklch(0.98 0.005 225)` | `oklch(0.18 0.03 230)` | Text and icons on primary. |
| `secondary` | `oklch(0.95 0.008 230)` | `oklch(0.27 0.018 240)` | Secondary buttons and quiet surfaces. |
| `secondary-foreground` | `oklch(0.27 0.03 235)` | `oklch(0.93 0.006 230)` | Text on secondary. |
| `muted` | `oklch(0.955 0.006 230)` | `oklch(0.26 0.016 240)` | Subdued surfaces (table headers, disabled fields). |
| `muted-foreground` | `oklch(0.52 0.02 235)` | `oklch(0.7 0.015 235)` | Secondary text: hints, captions, descriptions. |
| `accent` | `oklch(0.94 0.02 210)` | `oklch(0.3 0.03 225)` | Hover and highlight surfaces. |
| `accent-foreground` | `oklch(0.27 0.04 225)` | `oklch(0.95 0.005 230)` | Text on accent. |
| `destructive` | `oklch(0.56 0.2 27)` | `oklch(0.66 0.19 25)` | Danger and delete actions, error states. |
| `destructive-foreground` | `oklch(0.98 0.01 27)` | `oklch(0.18 0.02 25)` | Text on destructive. |
| `border` | `oklch(0.9 0.008 230)` | `oklch(1 0 0 / 10%)` | Dividers and component borders. |
| `input` | `oklch(0.9 0.008 230)` | `oklch(1 0 0 / 14%)` | Form field borders. |
| `ring` | `oklch(0.55 0.09 225)` | `oklch(0.65 0.09 220)` | Focus rings. |
| `chart-1` | `oklch(0.5 0.09 225)` | `oklch(0.72 0.1 220)` | Chart series 1. |
| `chart-2` | `oklch(0.74 0.14 75)` | `oklch(0.8 0.14 78)` | Chart series 2. |
| `chart-3` | `oklch(0.62 0.08 150)` | `oklch(0.72 0.09 150)` | Chart series 3. |
| `chart-4` | `oklch(0.5 0.1 320)` | `oklch(0.68 0.12 320)` | Chart series 4. |
| `chart-5` | `oklch(0.65 0.03 240)` | `oklch(0.7 0.02 240)` | Chart series 5. |
| `sidebar` | `oklch(0.97 0.005 230)` | `oklch(0.2 0.016 240)` | Sidebar background. |
| `sidebar-foreground` | `oklch(0.25 0.02 240)` | `oklch(0.93 0.006 230)` | Sidebar text. |
| `sidebar-primary` | `oklch(0.45 0.09 225)` | `oklch(0.72 0.1 220)` | Sidebar brand mark and active highlight. |
| `sidebar-primary-foreground` | `oklch(0.98 0.005 225)` | `oklch(0.18 0.03 230)` | Text on sidebar-primary. |
| `sidebar-accent` | `oklch(0.93 0.012 225)` | `oklch(0.27 0.02 235)` | Sidebar item hover / active background. |
| `sidebar-accent-foreground` | `oklch(0.25 0.03 230)` | `oklch(0.95 0.005 230)` | Text on sidebar-accent. |
| `sidebar-border` | `oklch(0.9 0.008 230)` | `oklch(1 0 0 / 10%)` | Sidebar dividers. |
| `sidebar-ring` | `oklch(0.55 0.09 225)` | `oklch(0.65 0.09 220)` | Focus rings inside the sidebar. |
| `success` | `oklch(0.52 0.12 155)` | `oklch(0.68 0.13 155)` | Kit extension: success states, positive deltas. |
| `success-foreground` | `oklch(0.98 0.01 155)` | `oklch(0.18 0.03 155)` | Text on success. |
| `warning` | `oklch(0.75 0.15 75)` | `oklch(0.8 0.14 78)` | Kit extension: warnings, pending states. |
| `warning-foreground` | `oklch(0.25 0.05 60)` | `oklch(0.2 0.04 60)` | Text on warning. |

### Shape, type, depth and motion

| Token | Value | Use |
|---|---|---|
| `radius` | `0.625rem` | Base corner radius; rounded-sm/md/lg/xl derive from it. |
| `spacing` | `0.25rem` | Spacing unit: every spacing utility is a multiple of it (p-4 = 4 × spacing). |
| `font.sans` | `"Public Sans Variable", ui-sans-serif, system-ui, sans-serif` | Font stacks. Load every family in the app's fonts.css. |
| `font.heading` | `"Public Sans Variable", ui-sans-serif, system-ui, sans-serif` | Font stacks. Load every family in the app's fonts.css. |
| `font.mono` | `"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace` | Font stacks. Load every family in the app's fonts.css. |
| `fontSize.xs` | `0.75rem` | Overrides Tailwind's text-* sizes. |
| `fontSize.sm` | `0.875rem` | Overrides Tailwind's text-* sizes. |
| `fontSize.base` | `1rem` | Overrides Tailwind's text-* sizes. |
| `fontSize.lg` | `1.125rem` | Overrides Tailwind's text-* sizes. |
| `fontSize.xl` | `1.25rem` | Overrides Tailwind's text-* sizes. |
| `fontSize.2xl` | `1.5rem` | Overrides Tailwind's text-* sizes. |
| `fontSize.3xl` | `1.875rem` | Overrides Tailwind's text-* sizes. |
| `lineHeight.xs` | `1rem` | Line height paired with the fontSize of the same name. |
| `lineHeight.sm` | `1.25rem` | Line height paired with the fontSize of the same name. |
| `lineHeight.base` | `1.5rem` | Line height paired with the fontSize of the same name. |
| `lineHeight.lg` | `1.75rem` | Line height paired with the fontSize of the same name. |
| `lineHeight.xl` | `1.75rem` | Line height paired with the fontSize of the same name. |
| `lineHeight.2xl` | `2rem` | Line height paired with the fontSize of the same name. |
| `lineHeight.3xl` | `2.25rem` | Line height paired with the fontSize of the same name. |
| `shadow.xs` | `0 1px 2px 0 oklch(0.21 0.02 240 / 0.05)` | Elevation: shadow-xs … shadow-xl. |
| `shadow.sm` | `0 1px 3px 0 oklch(0.21 0.02 240 / 0.08), 0 1px 2px -1px oklch(0.21 0.02 240 / 0.08)` | Elevation: shadow-xs … shadow-xl. |
| `shadow.md` | `0 4px 10px -2px oklch(0.21 0.02 240 / 0.10), 0 2px 4px -2px oklch(0.21 0.02 240 / 0.06)` | Elevation: shadow-xs … shadow-xl. |
| `shadow.lg` | `0 12px 24px -6px oklch(0.21 0.02 240 / 0.14), 0 4px 8px -4px oklch(0.21 0.02 240 / 0.08)` | Elevation: shadow-xs … shadow-xl. |
| `duration.fast` | `120ms` | Use as duration-(--duration-<name>). |
| `duration.normal` | `200ms` | Use as duration-(--duration-<name>). |
| `duration.slow` | `320ms` | Use as duration-(--duration-<name>). |
| `easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Become ease-<name> utilities. |
| `easing.emphasized` | `cubic-bezier(0.3, 0, 0, 1.3)` | Become ease-<name> utilities. |

### Themes

| Theme id | Name | Version | Description |
|---|---|---|---|
| `default` | Harbor | 1.1.0 | Default Dashboard Kit theme. Cool petrol-blue primary, amber highlight, quiet neutrals. |
| `ember` | Ember | 1.0.0 | Example imported from packages/tokens/examples/figma-tokens.json. Brick red, square corners. |
| `grove` | Grove | 1.0.0 | Example tenant theme. Forest green, tighter corners, denser layout. |

<!-- tokens:end -->

## Changelog

- **1.1.0** — Added density, font sizes, motion and contrast checks; darkened light `success` to pass AA. Tokens moved from YAML in this file to `design-tokens.json` (no value changes).
- **1.0.0** — Initial Harbor theme.
