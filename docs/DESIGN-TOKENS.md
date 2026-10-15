# Design tokens guide

## The rule

**To re-theme the kit, edit a DESIGN.md file. Nothing else.**

| File | What it is |
|---|---|
| `DESIGN.md` (repo root) | The **default theme**. Defines every token name and value. |
| `themes/<name>/DESIGN.md` | A **tenant / brand theme**. Lists only the values that differ. |

Each file has two parts: a YAML block between the `---` lines (read by
`@dashboard-kit/tokens`) and a Markdown body (read by people).

## Common changes

| I want to… | Edit |
|---|---|
| Change the brand colour | `colors.light.primary`, `colors.dark.primary` and their `-foreground` |
| Make corners sharper or rounder | `radius` |
| Make the UI denser or roomier | `density.spacing` (default `0.25rem`) |
| Change text sizes | `fontSizes.sm` … `fontSizes.3xl` |
| Change the font | `typography.*` — then load the font (see below) |
| Recolour the sidebar | `sidebar`, `sidebar-*` |
| Restyle chart series | `chart-1` … `chart-5` |
| Change animation feel | `motion.duration.*`, `motion.ease.*` |
| Add a colour, e.g. `info` | Add `info` and `info-foreground` to light **and** dark of the root DESIGN.md |
| Add a tenant theme | Create `themes/<name>/DESIGN.md` (see "Tenant themes") |

## Token groups

| Group | YAML | Tailwind utilities | Runtime CSS variables |
|---|---|---|---|
| Colours | `colors.light.*`, `colors.dark.*` | `bg-X`, `text-X`, `border-X`, `ring-X`, `bg-X/50` … | `--X` |
| Radius | `radius` | `rounded-sm/md/lg/xl` | `--radius` |
| Fonts | `typography.sans/heading/mono` | `font-sans`, `font-heading`, `font-mono` | `--dk-font-*` |
| Density | `density.spacing` | every spacing utility (`p-4`, `gap-2`, `h-9`, `size-4`…) | `--dk-spacing` |
| Text sizes | `fontSizes.<size>` | `text-xs` … `text-3xl` | `--dk-text-*`, `--dk-text-*-lh` |
| Shadows | `shadows.xs … xl` | `shadow-xs` … `shadow-xl` | `--dk-shadow-*` |
| Easing | `motion.ease.<name>` | `ease-<name>` | `--dk-ease-<name>` |
| Durations | `motion.duration.<name>` | `duration-(--duration-<name>)` | `--duration-<name>` |

Use the Tailwind utilities in components. Use the runtime variables only when
you need a value in inline styles, canvas or a chart library.

`density.spacing` scales **every** spacing utility at once. Small changes go a
long way: `0.23rem` is about 8% denser than the default.

### Changing fonts

DESIGN.md names the font; the app must load it in
`apps/starter/src/styles/fonts.css`:

```bash
pnpm --filter @dashboard-kit/starter add @fontsource-variable/inter
```
```css
@import "@fontsource-variable/inter";
```
```yaml
typography:
  sans: '"Inter Variable", ui-sans-serif, system-ui, sans-serif'
```

## Tenant themes

A tenant theme lists **only what differs** from the root DESIGN.md:

```yaml
# themes/grove/DESIGN.md
---
meta:
  name: Grove
  version: 1.0.0
radius: 0.375rem
density:
  spacing: 0.23rem
colors:
  light:
    primary: oklch(0.44 0.1 150)
    primary-foreground: oklch(0.98 0.01 150)
  dark:
    primary: oklch(0.76 0.13 140)
---
```

Rules:

1. The folder name is the theme id (kebab-case; `default` is reserved).
2. `meta.name` is required; everything else is inherited from the root file.
3. A theme may change values but **not add token names**. Tailwind utilities
   are generated from the root file's token set, so add new names there first.
4. Merged themes are validated and contrast-checked like the default.

### Switching at runtime

Themes switch by attribute, with no rebuild or reload:

```html
<html data-theme="grove" class="dark">
```

In the starter, use the theme context:

```tsx
const { theme, themes, setTheme, setMode } = useTheme();
setTheme("grove");   // stored per browser
```

For a multi-tenant app, force the tenant's theme instead of the user's choice:

```tsx
<ThemeProvider forcedTheme={tenant.themeName}>…</ThemeProvider>
```

### Loading themes lazily

`theme.css` contains every theme. With many tenants, import only the base and
load the tenant's file when you know who the tenant is:

```css
@import "@dashboard-kit/tokens/base.css";       /* default theme + Tailwind mapping */
```
```ts
import groveTheme from "@dashboard-kit/tokens/themes/grove.css?url";
const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href: groveTheme });
document.head.append(link);
```

## Build outputs

| File | Contents | Import it when |
|---|---|---|
| `dist/theme.css` | Default + every tenant theme + Tailwind mapping | Default — one import, everything works |
| `dist/base.css` | Default theme + Tailwind mapping | You load tenant themes lazily |
| `dist/themes/<name>.css` | One tenant theme's variables | Lazy loading |
| `dist/tokens.json` | All themes' resolved values + theme list | JS needs values (charts, theme picker) |

Generated selectors:

| Theme | Light | Dark |
|---|---|---|
| default | `:root` | `.dark` |
| `<name>` | `:root[data-theme="<name>"]` | `:root[data-theme="<name>"].dark` |

## Quality checks

### Validation

The build stops with the exact location of the problem:

```
✖ tokens: DESIGN.md has 1 problem(s):
  • colors.light.ring: must be oklch(), hsl(), rgb(), hex or var(--token)
```

Checked: required shadcn colours present, same names in light and dark,
valid colour/length/time syntax, kebab-case names, semver `meta.version`,
themes not introducing unknown tokens.

### Contrast (WCAG)

Every theme, in light and dark, is checked for:

- each `X` / `X-foreground` pair (primary, card, sidebar-accent, success…)
- `foreground` and `muted-foreground` on `background`, and `muted-foreground` on `card`
- any extra pairs listed in `checks.contrast.pairs`

```yaml
checks:
  contrast:
    minimum: 4.5           # WCAG AA for normal text; 3 for large text / UI only
    mode: error            # error | warn | off
    pairs:
      - [chart-1, background]
```

```
✖ tokens: theme "default": 1 colour pair(s) below 4.5:1 contrast
  • light: primary-foreground on primary = 1.86:1
```

Translucent colours (e.g. `oklch(1 0 0 / 10%)`) are skipped, because their
contrast depends on what is underneath. In watch mode a failing save is
reported and the last valid theme stays live.

## Importing from Figma

Export variables as **DTCG JSON** (Figma's native export, Tokens Studio, or
any plugin producing `$type` / `$value`), then:

```bash
# one file with top-level "light" and "dark" groups
pnpm tokens:import --file figma-tokens.json

# one file per Figma mode
pnpm tokens:import --light light.json --dark dark.json

# into a tenant theme (created if missing)
pnpm tokens:import --file figma-tokens.json --theme ember

# preview without writing
pnpm tokens:import --file figma-tokens.json --dry-run
```

How names map: nested groups are joined with `-` and camelCase becomes
kebab-case, so `color / sidebar / primaryForeground` becomes
`sidebar-primary-foreground`. A leading `color` group is dropped.

| Figma token | Becomes |
|---|---|
| any `color` | `colors.<mode>.<name>`, converted to `oklch()` |
| `radius` / `border-radius` (dimension) | `radius` |
| `font-sans`, `font-heading`, `font-mono` (fontFamily) | `typography.*` |

Comments and layout in DESIGN.md are preserved — only token lines change. The
result is validated and contrast-checked; if it would be invalid, the file is
restored and the problems are listed. A worked example lives in
`packages/tokens/examples/figma-tokens.json` (it produced `themes/ember`).

Name your Figma variables like shadcn tokens (`primary`, `primary-foreground`,
`sidebar/accent`…) and the import needs no mapping at all.

## Versioning and review

Bump `meta.version` for every change and add a changelog line in the file:

| Change | Bump |
|---|---|
| A value changed | patch |
| A token added | minor |
| A token removed or renamed | major |

`pnpm tokens:diff` shows what changed and checks the bump:

```bash
pnpm tokens:diff                         # vs git HEAD
pnpm tokens:diff --base main             # vs a branch
pnpm tokens:diff --theme grove --strict  # exit 1 if the bump is too small (for CI)
pnpm tokens:diff --base-file old.md      # vs a file
```

```
DESIGN.md: 1.1.0 → 1.1.0
  ~ colors.light.primary: oklch(0.45 0.09 225) → oklch(0.47 0.09 225)

Required version bump: patch (removed → major, added → minor, changed → patch)
⚠ meta.version bump is "none" but these changes need at least "patch".
```

## Using a DESIGN.md outside the monorepo

```bash
DESIGN_FILE=./brand/DESIGN.md THEMES_DIR=./brand/themes pnpm tokens:build
```
