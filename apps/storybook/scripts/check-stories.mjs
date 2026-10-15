#!/usr/bin/env node
// Enforces the story rules in apps/storybook/AGENTS.md. Run with: pnpm stories:check
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(app, "../..");
const ui = resolve(root, "packages/ui");
const storiesDir = join(app, "src/stories");
const registry = JSON.parse(readFileSync(join(ui, "registry.json"), "utf8"));
const errors = [];
const fail = (file, message) => errors.push(`${relative(root, file)}: ${message}`);

const FOLDERS = { ui: { type: "registry:ui", prefix: "UI" }, blocks: { type: "registry:block", prefix: "Blocks" } };
const ALLOWED_FOLDERS = new Set([...Object.keys(FOLDERS), "foundations"]);

/** Reads `{ … }` starting at `start` (an opening brace), skipping strings. Returns the inner text. */
function readBraces(text, start) {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      const close = text.indexOf(ch, i + 1);
      i = close === -1 ? text.length : close;
    } else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return text.slice(start + 1, i);
  }
  return "";
}

/** Top-level keys of an object literal body, with the body of each key that is itself an object. */
function topLevelEntries(body) {
  const entries = [];
  let depth = 0;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      const close = body.indexOf(ch, i + 1);
      if (depth === 0) {
        const after = body.slice(close + 1).match(/^\s*:/);
        if (after) entries.push({ key: body.slice(i + 1, close), at: close + 1 + after[0].length });
      }
      i = close === -1 ? body.length : close;
    } else if (ch === "{") depth++;
    else if (ch === "}") depth--;
    else if (depth === 0) {
      const m = body.slice(i).match(/^([A-Za-z_$][\w$-]*)\s*:/);
      if (m && (i === 0 || /[\s,{]/.test(body[i - 1]))) {
        entries.push({ key: m[1], at: i + m[0].length });
        i += m[0].length - 1;
      }
    }
  }
  return entries.map(({ key, at }) => {
    const brace = body.slice(at).match(/^\s*\{/);
    return { key, object: brace ? readBraces(body, at + brace[0].length - 1) : null };
  });
}

/** cva variant groups in a component file, e.g. { variant: [...], size: [...] }. */
function variantGroups(source) {
  const at = source.search(/\bvariants\s*:\s*\{/);
  if (at === -1) return {};
  const body = readBraces(source, source.indexOf("{", at));
  return Object.fromEntries(
    topLevelEntries(body)
      .filter((e) => e.object !== null)
      .map((e) => [e.key, topLevelEntries(e.object).map((o) => o.key)]),
  );
}

const HARD_CODED = [
  [/#[0-9a-fA-F]{3,8}\b/, "hex colour"],
  [/\b(oklch|oklab|rgba?|hsla?)\(/, "colour function"],
  [/\b(bg|text|border|ring|fill|stroke|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/, "Tailwind palette class"],
  [/\b(bg|text|border|rounded|shadow|font)-\[[^\]]+\]/, "arbitrary value class"],
  [/lorem ipsum/i, "placeholder text"],
];

const itemsByName = new Map(registry.items.map((item) => [item.name, item]));

for (const folder of readdirSync(storiesDir)) {
  const dir = join(storiesDir, folder);
  if (!ALLOWED_FOLDERS.has(folder)) {
    fail(dir, `unknown stories folder; use one of: ${[...ALLOWED_FOLDERS].join(", ")}`);
    continue;
  }
  for (const file of readdirSync(dir)) {
    const path = join(dir, file);
    if (!file.endsWith(".stories.tsx")) {
      fail(path, "only *.stories.tsx files belong in src/stories");
      continue;
    }
    const text = readFileSync(path, "utf8");
    const code = text.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");

    for (const [pattern, label] of HARD_CODED) {
      if (pattern.test(code)) fail(path, `contains a ${label}; use theme tokens / real content (rule S7)`);
    }
    if (!/^export default meta;?$/m.test(text)) fail(path, "must end the meta block with `export default meta;` (rule S3)");

    if (folder === "foundations") {
      if (!/title:\s*"Foundations\//.test(text)) fail(path, 'title must start with "Foundations/" (rule S2)');
      continue;
    }

    const { type, prefix } = FOLDERS[folder];
    const name = file.replace(/\.stories\.tsx$/, "");
    const item = itemsByName.get(name);
    if (!item || item.type !== type) {
      fail(path, `no ${type} item named "${name}" in packages/ui/registry.json (rule S1)`);
      continue;
    }

    const expectedTitle = `${prefix}/${item.title}`;
    if (!text.includes(`title: "${expectedTitle}"`)) fail(path, `title must be "${expectedTitle}" (rule S2)`);

    if (!/\}\s*satisfies Meta<typeof \w+>/.test(text)) fail(path, "meta must use `satisfies Meta<typeof Component>` (rule S3)");
    if (!/^export const Default: Story\b/m.test(text)) fail(path, "must export a `Default` story (rule S4)");

    for (const file of item.files) {
      const source = join(ui, file.path);
      if (!existsSync(source)) continue;
      for (const [group, options] of Object.entries(variantGroups(readFileSync(source, "utf8")))) {
        for (const option of options) {
          if (!new RegExp(`["'\`]${option}["'\`]`).test(code)) {
            fail(path, `does not show ${group} "${option}" from ${file.path} (rule S5)`);
          }
        }
      }
    }
  }
}

// Every component must have a story (also checked by registry:check, repeated here for agents).
for (const item of registry.items) {
  const folder = Object.keys(FOLDERS).find((f) => FOLDERS[f].type === item.type);
  if (folder && !existsSync(join(storiesDir, folder, `${item.name}.stories.tsx`))) {
    fail(join(storiesDir, folder), `missing ${item.name}.stories.tsx for registry item "${item.name}" (rule S1)`);
  }
}

if (errors.length) {
  console.error(`✖ stories:check found ${errors.length} problem(s):\n${errors.map((e) => `  • ${e}`).join("\n")}`);
  console.error("  Rules: apps/storybook/AGENTS.md");
  process.exit(1);
}
console.log("✔ stories:check passed");
