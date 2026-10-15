# Moving tokens from YAML to DTCG JSON

## What changed and why

Token values moved from a YAML block inside `DESIGN.md` to `design-tokens.json`,
in the format of the W3C Design Tokens Community Group (DTCG). DESIGN.md stayed,
but now only *explains*. The decision and trade-offs are in
[ADR 0011](../adr/0011-dtcg-json-tokens.md).

The short version: DTCG is what Figma and Tokens Studio speak, JSON is stricter
than YAML, and a JSON Schema gives autocomplete. The price is a longer file
without comments.

## The DTCG model in five ideas

1. **A token is an object with `$value`.** Anything else is a group.
2. **`$type` cascades.** Put `"$type": "color"` on the `color` group once; every token inside inherits it.
3. **`$description` replaces comments.** It shows in editor tooltips and in DESIGN.md's generated tables.
4. **Aliases.** `"$value": "{color.light.primary}"` means "same as that token". We resolve aliases *after* merging a tenant theme, so a tenant that changes `primary` automatically changes everything aliased to it.
5. **`$extensions` for tool data.** Our name, version and contrast settings live under `"dev.dashboard-kit"`, a reverse-domain key so other tools ignore them.

## How the migration was done safely

The most useful technique here applies to any refactor:

1. **Convert data with a script, not by hand.** A one-off script read the old
   YAML with the old parser and wrote the JSON. No value was retyped.
2. **Keep the downstream code untouched.** The new reader (`convert.ts`) produces
   *exactly the same internal object* the old YAML reader did, so the compiler,
   contrast check and theming didn't change.
3. **Compare outputs byte for byte.** The old version was built from the previous
   zip and every generated file (`theme.css`, `base.css`, `tokens.json`, theme
   files) was diffed against the new build. All identical. That's proof the
   migration changed the format and nothing else.

## Keeping two files from drifting

Two files (JSON + DESIGN.md) risk the explanation going stale. Two defences:

- **Generated section.** DESIGN.md has a block between
  `<!-- tokens:start -->` and `<!-- tokens:end -->` that `pnpm tokens:docs`
  rewrites from the JSON. Watch mode refreshes it on every save.
- **Freshness check.** `pnpm docs:check` runs `tokens:docs --check`, which fails
  if the block doesn't match what would be generated. CI can't merge stale docs.

The JSON Schemas use the same trick: generated from the same lists the
validator uses (`REQUIRED_COLORS`, size keys), committed so editors find them,
and a test fails if they drift.

## Things we learned along the way

- **Node's JSON errors don't always include a position.** For most mistakes Node
  says "(line 3 column 3)"; for some it doesn't. Since every JSON file is valid
  YAML input, the YAML parser — already a dependency — is used as a fallback to
  find the line.
- **Mixed value styles hurt readability.** DTCG allows `{ "value": 4, "unit": "px" }`
  and `"4px"`. The importer now normalises to strings so the file stays consistent.
- **A schema is worth validating too.** Our generated schema was checked with a
  real validator (ajv) against all token files, and against a deliberately broken
  one, to be sure editors won't show false errors.

## Try it yourself

1. Open `design-tokens.json` in VS Code, type a new key inside `color.light` and
   watch the autocomplete; misspell `$value` and see the warning.
2. Make `color.light.sidebar-primary` an alias: `"$value": "{color.light.primary}"`.
   Run `pnpm tokens:build`, then change `primary` in `themes/grove/design-tokens.json`
   and see Grove's sidebar follow.
3. Edit a value, run `pnpm docs:check` (fails: stale tables), then `pnpm tokens:docs`.
