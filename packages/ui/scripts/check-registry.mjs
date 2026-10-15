#!/usr/bin/env node
// Keeps registry.json and the source folder in sync. Run with: pnpm registry:check
//  • every file listed in registry.json exists
//  • every component/lib/hook file in src/ is listed by some item
//  • every registryDependency points to an item in this registry (or a full URL)
//  • every npm import in a file is declared in that item's "dependencies"
//  • every registry:ui / registry:block item has a Storybook story (ADR 0009)
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pkg = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registry = JSON.parse(readFileSync(join(pkg, "registry.json"), "utf8"));
const errors = [];
const NAMESPACE = "@dashboard-kit/";
// Provided by every project (React itself) — never listed as item dependencies.
const ALWAYS_PRESENT = new Set(["react", "react-dom"]);

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const names = new Set(registry.items.map((item) => item.name));
const storiesDir = resolve(pkg, "../../apps/storybook/src/stories");
const NEEDS_STORY = new Set(["registry:ui", "registry:block"]);
const listed = new Set();

for (const item of registry.items) {
  for (const dep of item.registryDependencies ?? []) {
    if (dep.startsWith("http")) continue;
    if (!dep.startsWith(NAMESPACE) || !names.has(dep.slice(NAMESPACE.length))) {
      errors.push(`${item.name}: registryDependency "${dep}" is not an item in this registry`);
    }
  }
  if (NEEDS_STORY.has(item.type)) {
    const folder = item.type === "registry:ui" ? "ui" : "blocks";
    const story = join(storiesDir, folder, `${item.name}.stories.tsx`);
    if (!existsSync(story)) errors.push(`${item.name}: missing story ${relative(resolve(pkg, "../.."), story)}`);
  }
  const declared = new Set(item.dependencies ?? []);
  for (const file of item.files ?? []) {
    listed.add(file.path);
    const full = join(pkg, file.path);
    if (!existsSync(full)) {
      errors.push(`${item.name}: file ${file.path} does not exist`);
      continue;
    }
    const source = readFileSync(full, "utf8");
    for (const [, spec] of source.matchAll(/from\s+["']([^"']+)["']/g)) {
      if (spec.startsWith(".") || spec.startsWith("@/")) continue;
      const name = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
      if (!ALWAYS_PRESENT.has(name) && !declared.has(name)) {
        errors.push(`${item.name}: ${file.path} imports "${name}" but the item does not list it in "dependencies"`);
      }
    }
  }
}

for (const file of walk(join(pkg, "src")).map((f) => relative(pkg, f))) {
  if (!listed.has(file)) errors.push(`${file} is not listed in any registry.json item`);
}

if (errors.length) {
  console.error(`✖ registry:check found ${errors.length} problem(s):\n${errors.map((e) => `  • ${e}`).join("\n")}`);
  process.exit(1);
}
console.log(`✔ registry:check passed (${registry.items.length} items)`);
