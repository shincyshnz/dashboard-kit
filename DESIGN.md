---
# ╔══════════════════════════════════════════════════════════════════════╗
# ║  DESIGN.md — the ONLY file you edit to re-theme the Dashboard Kit.  ║
# ║  The YAML block between the two `---` lines is machine-read by      ║
# ║  @dashboard-kit/tokens and compiled to a Tailwind v4 / shadcn theme. ║
# ║  Everything below the second `---` is human documentation.          ║
# ╚══════════════════════════════════════════════════════════════════════╝

meta:
  name: Harbor
  version: 1.1.0
  description: Default Dashboard Kit theme. Cool petrol-blue primary, amber highlight, quiet neutrals.

# Base corner radius. Tailwind's rounded-sm / md / lg / xl are derived from it.
radius: 0.625rem

typography:
  sans: '"Public Sans Variable", ui-sans-serif, system-ui, sans-serif'
  heading: '"Public Sans Variable", ui-sans-serif, system-ui, sans-serif'
  mono: '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace'

# Optional. Base unit for every spacing utility (p-4 = 4 × spacing).
# Lower it for a denser UI, raise it for a roomier one. Tailwind default: 0.25rem.
density:
  spacing: 0.25rem

# Optional. Overrides Tailwind's text-* sizes. Value or { size, lineHeight }.
fontSizes:
  xs: { size: 0.75rem, lineHeight: 1rem }
  sm: { size: 0.875rem, lineHeight: 1.25rem }
  base: { size: 1rem, lineHeight: 1.5rem }
  lg: { size: 1.125rem, lineHeight: 1.75rem }
  xl: { size: 1.25rem, lineHeight: 1.75rem }
  2xl: { size: 1.5rem, lineHeight: 2rem }
  3xl: { size: 1.875rem, lineHeight: 2.25rem }

# Optional. Motion tokens: ease-* become Tailwind utilities (ease-standard);
# durations are CSS variables, used as duration-(--duration-fast).
motion:
  duration:
    fast: 120ms
    normal: 200ms
    slow: 320ms
  ease:
    standard: cubic-bezier(0.2, 0, 0, 1)
    emphasized: cubic-bezier(0.3, 0, 0, 1.3)

# Build-time quality checks. Every X / X-foreground pair (plus foreground and
# muted-foreground on background/card) must reach `minimum` WCAG contrast.
# mode: error (fail the build) | warn | off. Add extra [surface, text] pairs if needed.
checks:
  contrast:
    minimum: 4.5
    mode: error
    pairs: []

# Optional. Omit a key to keep Tailwind's default for that size.
shadows:
  xs: 0 1px 2px 0 oklch(0.21 0.02 240 / 0.05)
  sm: 0 1px 3px 0 oklch(0.21 0.02 240 / 0.08), 0 1px 2px -1px oklch(0.21 0.02 240 / 0.08)
  md: 0 4px 10px -2px oklch(0.21 0.02 240 / 0.10), 0 2px 4px -2px oklch(0.21 0.02 240 / 0.06)
  lg: 0 12px 24px -6px oklch(0.21 0.02 240 / 0.14), 0 4px 8px -4px oklch(0.21 0.02 240 / 0.08)

# Colour tokens. Names match shadcn/ui exactly, so every shadcn component
# picks them up with no changes. You may ADD extra names (see success/warning);
# light and dark must always contain the same names.
colors:
  light:
    background: oklch(0.985 0.003 230)
    foreground: oklch(0.21 0.02 240)
    card: oklch(1 0 0)
    card-foreground: oklch(0.21 0.02 240)
    popover: oklch(1 0 0)
    popover-foreground: oklch(0.21 0.02 240)
    primary: oklch(0.45 0.09 225)
    primary-foreground: oklch(0.98 0.005 225)
    secondary: oklch(0.95 0.008 230)
    secondary-foreground: oklch(0.27 0.03 235)
    muted: oklch(0.955 0.006 230)
    muted-foreground: oklch(0.52 0.02 235)
    accent: oklch(0.94 0.02 210)
    accent-foreground: oklch(0.27 0.04 225)
    destructive: oklch(0.56 0.2 27)
    destructive-foreground: oklch(0.98 0.01 27)
    border: oklch(0.9 0.008 230)
    input: oklch(0.9 0.008 230)
    ring: oklch(0.55 0.09 225)
    chart-1: oklch(0.5 0.09 225)
    chart-2: oklch(0.74 0.14 75)
    chart-3: oklch(0.62 0.08 150)
    chart-4: oklch(0.5 0.1 320)
    chart-5: oklch(0.65 0.03 240)
    sidebar: oklch(0.97 0.005 230)
    sidebar-foreground: oklch(0.25 0.02 240)
    sidebar-primary: oklch(0.45 0.09 225)
    sidebar-primary-foreground: oklch(0.98 0.005 225)
    sidebar-accent: oklch(0.93 0.012 225)
    sidebar-accent-foreground: oklch(0.25 0.03 230)
    sidebar-border: oklch(0.9 0.008 230)
    sidebar-ring: oklch(0.55 0.09 225)
    success: oklch(0.52 0.12 155)
    success-foreground: oklch(0.98 0.01 155)
    warning: oklch(0.75 0.15 75)
    warning-foreground: oklch(0.25 0.05 60)
  dark:
    background: oklch(0.18 0.015 240)
    foreground: oklch(0.95 0.005 230)
    card: oklch(0.22 0.017 240)
    card-foreground: oklch(0.95 0.005 230)
    popover: oklch(0.22 0.017 240)
    popover-foreground: oklch(0.95 0.005 230)
    primary: oklch(0.72 0.1 220)
    primary-foreground: oklch(0.18 0.03 230)
    secondary: oklch(0.27 0.018 240)
    secondary-foreground: oklch(0.93 0.006 230)
    muted: oklch(0.26 0.016 240)
    muted-foreground: oklch(0.7 0.015 235)
    accent: oklch(0.3 0.03 225)
    accent-foreground: oklch(0.95 0.005 230)
    destructive: oklch(0.66 0.19 25)
    destructive-foreground: oklch(0.18 0.02 25)
    border: oklch(1 0 0 / 10%)
    input: oklch(1 0 0 / 14%)
    ring: oklch(0.65 0.09 220)
    chart-1: oklch(0.72 0.1 220)
    chart-2: oklch(0.8 0.14 78)
    chart-3: oklch(0.72 0.09 150)
    chart-4: oklch(0.68 0.12 320)
    chart-5: oklch(0.7 0.02 240)
    sidebar: oklch(0.2 0.016 240)
    sidebar-foreground: oklch(0.93 0.006 230)
    sidebar-primary: oklch(0.72 0.1 220)
    sidebar-primary-foreground: oklch(0.18 0.03 230)
    sidebar-accent: oklch(0.27 0.02 235)
    sidebar-accent-foreground: oklch(0.95 0.005 230)
    sidebar-border: oklch(1 0 0 / 10%)
    sidebar-ring: oklch(0.65 0.09 220)
    success: oklch(0.68 0.13 155)
    success-foreground: oklch(0.18 0.03 155)
    warning: oklch(0.8 0.14 78)
    warning-foreground: oklch(0.2 0.04 60)
---

# Harbor — Dashboard Kit design

This file is the single source of truth for the kit's look. Change a value in
the YAML block above, save, and every component updates:

- **While `pnpm dev` is running:** the token watcher regenerates the theme and
  Vite hot-reloads the page within about a second.
- **In CI / production builds:** `pnpm build` regenerates the theme first.

Never edit `packages/tokens/dist/theme.css` by hand — it is overwritten on
every build.

## How a value travels to a component

```
DESIGN.md  ──►  @dashboard-kit/tokens (validate + compile)
           ──►  dist/theme.css  (:root, .dark, @theme inline)
           ──►  Tailwind v4 utilities (bg-primary, rounded-lg, font-heading…)
           ──►  shadcn components
```

## Token reference

| Group | Tokens | Used for |
|---|---|---|
| Surfaces | `background`, `card`, `popover`, `sidebar` | Page, cards, menus, navigation |
| Text | `foreground`, `*-foreground`, `muted-foreground` | Text on the matching surface |
| Actions | `primary`, `secondary`, `accent`, `destructive` | Buttons, highlights, danger |
| Status | `success`, `warning` (kit extensions) | Badges, alerts, KPI deltas |
| Lines | `border`, `input`, `ring` | Dividers, field borders, focus |
| Data | `chart-1` … `chart-5` | Chart series, in order |
| Shape | `radius` | All corner rounding |
| Type | `sans`, `heading`, `mono` | `font-sans`, `font-heading`, `font-mono` |
| Depth | `shadows.xs` … `shadows.lg` | `shadow-xs` … `shadow-lg` |
| Density | `density.spacing` | Every spacing utility (`p-4`, `gap-2`, `h-9`…) |
| Text sizes | `fontSizes.xs` … `fontSizes.3xl` | `text-xs` … `text-3xl` |
| Motion | `motion.duration.*`, `motion.ease.*` | `duration-(--duration-fast)`, `ease-standard` |

## Rules

1. Every `*-foreground` must be readable on its partner colour (WCAG AA,
   4.5:1 for text). The build checks this for light and dark and fails if not.
2. Light and dark must list the same colour names — the build fails otherwise.
3. Accepted colour formats: `oklch()`, `hsl()`, `rgb()`, hex. Prefer `oklch()`
   (what shadcn uses); it keeps lightness predictable across hues.
4. Adding a colour (e.g. `info`) automatically creates `bg-info`, `text-info`,
   `border-info` … in Tailwind. Document new names in the table above.
5. If you change `typography`, make sure the font is actually loaded by the
   app (see `apps/starter/src/styles/fonts.css`).

## Tenant themes

Extra themes live in `themes/<name>/DESIGN.md` and list **only what differs**
from this file. They are switched at runtime with `<html data-theme="<name>">`.
This file defines the token *names*; themes may change values but not add names.

## Changelog

- **1.1.0** — Added density, font sizes, motion and contrast checks; darkened light `success` to pass AA.
- **1.0.0** — Initial Harbor theme.
