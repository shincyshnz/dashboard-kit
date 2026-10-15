# Phase 2 · Step 3 — A lint rule that guards the tokens

## The idea in one sentence

An ESLint rule reads every string in `packages/ui` and rejects class names
that hard-code a colour, radius, shadow or font, so registry components can
only use the theme's token classes.

## Why a rule, not just a guideline

Tailwind makes it easy to write `bg-blue-600` or `rounded-[7px]`. Both work
today and look right in the default theme, but the moment a project switches
to `grove` or dark mode they stay blue and 7px. Nobody notices until a tenant
complains. [docs/REGISTRY.md](../REGISTRY.md) always had an "allowed / not
allowed" table; the rule turns that table into an error you see in your editor
and in `pnpm lint`.

## How an ESLint rule works

ESLint parses a file into a tree of nodes (the AST). A rule is an object with a
`create(context)` function that returns *visitors*: functions named after node
types, called for every node of that type.

```js
create(context) {
  return {
    Literal(node) { /* every "string" and 'string' */ },
    TemplateElement(node) { /* the fixed parts of `template ${strings}` */ },
  };
}
```

The rule doesn't try to work out which strings are class names. Class names
reach components through `cva(...)`, `cn(...)` and `className="..."`, and
following all of those is fragile. Instead it splits **every** string on
whitespace and checks each word. That's safe because the patterns are narrow:
`red-500` in a sentence doesn't match, only `bg-red-500` does.

## What one class goes through

1. **Strip variants.** `md:hover:bg-red-500` → `bg-red-500`. The split ignores
   `:` inside `[...]`, so `[&_svg:not(...)]:size-4` keeps working. A leading or
   trailing `!` (important) is removed too.
2. **Palette check.** A colour utility (`bg`, `text`, `border`, `ring`, `fill`,
   …) followed by a palette name and shade, or `black` / `white`, is rejected.
   Opacity modifiers don't help: `bg-black/50` is still a raw colour.
3. **Arbitrary value check.** For `prefix-[value]` and `[property:value]`:
   - any `rounded-*` / `border-radius` → radius error
   - any `shadow-*` / `box-shadow` → shadow error
   - `font-[...]` with a non-number → font error (`font-[500]` is a weight)
   - a hex, colour function (`oklch(`, `rgb(` …) or `color:` hint in the value → colour error

Everything else passes: `ring-[3px]`, `grid-rows-[auto_auto]`,
`bg-(--chart-1)` and `bg-[var(--sidebar)]` don't hard-code a design value.

## Testing a rule

ESLint ships `RuleTester`: you give it code that must pass and code that must
fail with a specific message. It runs under Vitest once you hand it Vitest's
`describe` and `it`:

```js
RuleTester.describe = describe;
RuleTester.it = it;
ruleTester.run("no-raw-design-values", rule, { valid: [...], invalid: [...] });
```

The cases live in `packages/config/test/token-audit.test.js`. Add one there
whenever you find a class the rule gets wrong.

## Limitations

- Dynamically built names (`` `bg-${colour}-500` ``) can't be checked, because
  the colour is only known at run time. Tailwind can't generate those classes
  either, so they're already a bug.
- Layout values (`gap-4`, `px-6`) aren't checked; they scale with
  `density.spacing` automatically.
- The rule runs only in `packages/ui`. The starter and Storybook will get it
  when their copies are synced from the registry (Step 5).
