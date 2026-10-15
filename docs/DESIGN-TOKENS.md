# Design tokens guide

## The rule

**To re-theme the kit, edit a `design-tokens.json` file. Nothing else.**

| File | Role |
|---|---|
| `design-tokens.json` (repo root) | The **default theme**: every token name and value. |
| `themes/<name>/design-tokens.json` | A **tenant theme**: only the values that differ. |
| `DESIGN.md` (repo root) | The **guide**: design intent, rules, agent instructions, changelog, and generated token tables. |
| `themes/<name>/README.md` | Optional notes about a tenant's brand. |

Why JSON and not YAML in DESIGN.md: [ADR 0011](./adr/0011-dtcg-json-tokens.md).

## The file format (DTCG)

The files follow the [W3C Design Tokens Community Group](https://www.designtokens.org/) format — the
same one Figma Variables and Tokens Studio export.

```jsonc
{
  "$schema": "./packages/tokens/schema/design-tokens.schema.json",   // editor autocomplete
  "$description": "Default Dashboard Kit theme. …",
  "$extensions": {
    "dev.dashboard-kit": {
      "meta": { "name": "Harbor", "version": "1.1.0" },
      "checks": { "contrast": { "minimum": 4.5, "mode": "error", "pairs": [] } }
    }
  },
  "color": {
    "$type": "color",                         // inherited by every token in the group
    "light": {
      "primary": { "$value": "oklch(0.45 0.09 225)", "$description": "Main brand / action colour." }
    },
    "dark": { "primary": { "$value": "oklch(0.72 0.1 220)" } }
  },
  "radius": { "$type": "dimension", "$value": "0.625rem" }
}
```

| Concept | Meaning |
|---|---|
| **Token** | Any object with a `$value`. |
| **Group** | An object without `$value` that contains tokens or groups. |
| `$type` | What kind of value it is. Set on a group, it applies to everything inside. |
| `$description` | What the token is for. Shown in the generated tables in DESIGN.md and in editor tooltips. |
| `{path.to.token}` | An **alias**: `"$value": "{color.light.primary}"` reuses another token's value. |
| `$extensions` | Tool-specific data. Ours lives under `"dev.dashboard-kit"`. |

### Groups

| Group | `$type` | Tailwind utilities | Runtime CSS variables |
|---|---|---|---|
| `color.light.*`, `color.dark.*` | `color` | `bg-X`, `text-X`, `border-X`, `ring-X`, `bg-X/50` … | `--X` |
| `radius` | `dimension` | `rounded-sm/md/lg/xl` | `--radius` |
| `spacing` | `dimension` | every spacing utility (`p-4`, `gap-2`, `h-9`, `size-4`…) | `--dk-spacing` |
| `font.sans/heading/mono` | `fontFamily` | `font-sans`, `font-heading`, `font-mono` | `--dk-font-*` |
| `fontSize.<size>` + `lineHeight.<size>` | `dimension` | `text-xs` … `text-3xl` | `--dk-text-*`, `--dk-text-*-lh` |
| `shadow.xs … xl` | `shadow` | `shadow-xs` … `shadow-xl` | `--dk-shadow-*` |
| `duration.<name>` | `duration` | `duration-(--duration-<name>)` | `--duration-<name>` |
| `easing.<name>` | `cubicBezier` | `ease-<name>` | `--dk-ease-<name>` |

Any other top-level group is an error. A token whose `$type` doesn't match its group is an error.

### Value formats

The house style is **readable CSS strings**; DTCG object forms are accepted too (useful when pasting a Figma export).

| `$type` | House style | Also accepted |
|---|---|---|
| `color` | `"oklch(0.45 0.09 225)"` (or hex, `rgb()`, `hsl()`) | `{ "colorSpace": "srgb", "components": [0.1, 0.4, 0.5] }` |
| `dimension` | `"0.625rem"` | `{ "value": 10, "unit": "px" }` |
| `duration` | `"120ms"` | `{ "value": 120, "unit": "ms" }` |
| `fontFamily` | `["Public Sans Variable", "ui-sans-serif", "sans-serif"]` | `"Inter"` |
| `cubicBezier` | `[0.2, 0, 0, 1]` | `"cubic-bezier(0.2, 0, 0, 1)"` |
| `shadow` | `"0 1px 3px 0 oklch(0.21 0.02 240 / 0.08)"` | `{ "color": "#0001", "offsetX": "0px", "offsetY": "1px", "blur": "3px", "spread": "0px" }` |

Font names are quoted automatically when compiled; generic families (`sans-serif`, `ui-monospace`…) aren't.

## Common changes

| I want to… | Edit |
|---|---|
| Change the brand colour | `color.light.primary`, `color.dark.primary` and their `-foreground` |
| Make corners sharper or rounder | `radius` |
| Make the UI denser or roomier | `spacing` (default `0.25rem`; `0.23rem` is ~8% denser) |
| Change text sizes | `fontSize.*` and `lineHeight.*` |
| Change the font | `font.*`, then load the family in the app's fonts CSS (below) |
| Recolour the sidebar | `color.*.sidebar*` |
| Restyle chart series | `color.*.chart-1` … `chart-5` |
| Change animation feel | `duration.*`, `easing.*` |
| Keep two tokens identical | `"$value": "{color.light.primary}"` |
| Add a colour, e.g. `info` | Add `info` and `info-foreground` to `color.light` **and** `color.dark` in the root file, with a `$description` |
| Add a tenant theme | Create `themes/<name>/design-tokens.json` (see below) |

After any change: bump `meta.version`, add a changelog line in DESIGN.md, and
run `pnpm tokens:docs` (automatic while `pnpm dev` runs).

### Changing fonts

```bash
pnpm --filter @dashboard-kit/starter add @fontsource-variable/inter
```
```css
/* apps/starter/src/styles/fonts.css */
@import "@fontsource-variable/inter";
```
```json
"font": { "sans": { "$value": ["Inter Variable", "ui-sans-serif", "system-ui", "sans-serif"] } }
```

## Tenant themes

A tenant theme lists **only what differs** from the root file:

```json
{
  "$schema": "../../packages/tokens/schema/theme-tokens.schema.json",
  "$description": "Forest green, tighter corners, denser layout.",
  "$extensions": { "dev.dashboard-kit": { "meta": { "name": "Grove", "version": "1.0.0" } } },
  "radius": { "$value": "0.375rem" },
  "spacing": { "$value": "0.23rem" },
  "color": {
    "light": { "primary": { "$value": "oklch(0.44 0.1 150)" } },
    "dark": { "primary": { "$value": "oklch(0.76 0.13 140)" } }
  }
}
```

Rules:

1. The folder name is the theme id (kebab-case; `default` is reserved).
2. `meta.name` is required; everything else, including `$type`s and descriptions, is inherited.
3. A theme may change values but **not add token names**. Tailwind utilities come from the root file's token set; add new names there first.
4. Aliases resolve **after** merging: if the root says `sidebar-primary = {color.light.primary}` and a tenant overrides `primary`, its sidebar follows automatically.
5. Merged themes are validated and contrast-checked like the default.

### Switching at runtime

```html
<html data-theme="grove" class="dark">
```

```tsx
const { theme, themes, setTheme, setMode } = useTheme();
setTheme("grove");                                  // stored per browser
<ThemeProvider forcedTheme={tenant.themeName}>…     // multi-tenant: tenant decides
```

### Loading themes lazily

`theme.css` contains every theme. With many tenants, import only the base and
load the tenant's file when you know the tenant:

```css
@import "@dashboard-kit/tokens/base.css";
```
```ts
import groveTheme from "@dashboard-kit/tokens/themes/grove.css?url";
document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href: groveTheme }));
```

## Build outputs

| File | Contents | Import it when |
|---|---|---|
| `dist/theme.css` | Default + every tenant theme + Tailwind mapping | Default — one import, everything works |
| `dist/base.css` | Default theme + Tailwind mapping | You load tenant themes lazily |
| `dist/themes/<name>.css` | One tenant theme's variables | Lazy loading |
| `dist/tokens.json` | All themes' resolved values + theme list | JS needs values (charts, theme picker) |

| Theme | Light selector | Dark selector |
|---|---|---|
| default | `:root` | `.dark` |
| `<name>` | `:root[data-theme="<name>"]` | `:root[data-theme="<name>"].dark` |

## Commands

| Command | Does |
|---|---|
| `pnpm tokens:build` | Validate, contrast-check and compile every theme |
| `pnpm tokens:watch` | Same, on every save; also refreshes DESIGN.md's tables |
| `pnpm tokens:docs` | Regenerate DESIGN.md's token tables (`--check` fails if stale) |
| `pnpm tokens:schema` | Regenerate the JSON Schemas (`--check` fails if stale) |
| `pnpm tokens:import` | Import Figma / Tokens Studio exports |
| `pnpm tokens:diff` | Show token changes and the required version bump |

`pnpm docs:check` runs the `--check` variants, so stale tables or schemas fail CI.

## Quality checks

### Validation

Errors point at the JSON path you edit:

```
✖ tokens: design-tokens.json has 2 problem(s):
  • unknown top-level group "colour" (allowed: color, radius, spacing, font, …)
  • color.light.ring: value "bluish" is not a valid color
```

Syntax errors give the line and column:

```
✖ tokens: design-tokens.json is not valid JSON (line 3, column 3): Expected ',' or '}' after property value
```

Checked: allowed groups and `$type`s, valid values per type, required shadcn
colours, same names in light and dark, aliases that resolve (no cycles),
semver `meta.version`, tenant themes not adding token names.

With the `$schema` line in place, VS Code and other editors show most of these
problems — and autocomplete token names — while you type.

### Contrast (WCAG)

Every theme, in light and dark, is checked for each `X` / `X-foreground`
pair, `foreground` and `muted-foreground` on `background`, `muted-foreground`
on `card`, and any extra pairs in `checks.contrast.pairs`:

```json
"checks": { "contrast": { "minimum": 4.5, "mode": "error", "pairs": [["chart-1", "background"]] } }
```

```
✖ tokens: theme "default": 1 colour pair(s) below 4.5:1 contrast
  • light: primary-foreground on primary = 1.86:1
```

Translucent colours are skipped. In watch mode a failing save is reported and
the last valid theme stays live.

## Importing from Figma

Export variables as DTCG JSON (Figma's native export, Tokens Studio, or a plugin), then:

```bash
pnpm tokens:import --file figma-tokens.json                  # top-level "light" and "dark" groups
pnpm tokens:import --light light.json --dark dark.json       # one file per Figma mode
pnpm tokens:import --file figma-tokens.json --theme ember     # into a tenant theme (created if missing)
pnpm tokens:import --file figma-tokens.json --dry-run         # preview
```

Nested groups are joined with `-` and camelCase becomes kebab-case:
`color / sidebar / primaryForeground` → `sidebar-primary-foreground`.

| Figma token | Becomes |
|---|---|
| any `color` | `color.<mode>.<name>`, converted to an `oklch()` string |
| `radius` / `border-radius` | `radius` |
| `font-sans` / `font-heading` / `font-mono` | `font.*` |

Existing `$description`s are kept. The result is validated and
contrast-checked; if invalid, the file is restored. Example:
`packages/tokens/examples/figma-tokens.json` (it produced `themes/ember`).

Name Figma variables like shadcn tokens and no mapping is needed.

## Versioning and review

| Change | Bump |
|---|---|
| A value changed | patch |
| A token added | minor |
| A token removed or renamed | major |

`$description`-only edits need no bump.

```bash
pnpm tokens:diff                          # vs git HEAD
pnpm tokens:diff --base main              # vs a branch
pnpm tokens:diff --theme grove --strict   # exit 1 if the bump is too small (CI)
pnpm tokens:diff --base-file old.json     # vs a file
```

## Outside the monorepo

```bash
TOKENS_FILE=./brand/design-tokens.json THEMES_DIR=./brand/themes DESIGN_DOC=./brand/DESIGN.md pnpm tokens:build
```
