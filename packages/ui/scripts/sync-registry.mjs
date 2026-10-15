#!/usr/bin/env node
// Copies registry source into apps/starter, the way `shadcn add` would, but from
// the local source instead of the deployed JSON. Run with: pnpm registry:sync
//
//   pnpm registry:sync                 re-copy every item the starter already has
//   pnpm registry:sync select dialog   add these items (and their registry dependencies)
//   pnpm registry:sync --check         change nothing; fail if a starter copy drifted
//                                      or a needed npm package is missing (part of registry:check)
//
// Missing npm packages are added with `pnpm --filter @dashboard-kit/starter add`,
// using the version range packages/ui already depends on, so both stay aligned.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pkg = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(pkg, "../..");
const app = join(root, "apps/starter");
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

const registry = readJson(join(pkg, "registry.json"));
const sourceAliases = readJson(join(pkg, "components.json")).aliases;
const targetAliases = readJson(join(app, "components.json")).aliases;
const sourceVersions = readJson(join(pkg, "package.json")).dependencies;
const appManifest = readJson(join(app, "package.json"));
const appPackages = { ...appManifest.dependencies, ...appManifest.devDependencies };

const NAMESPACE = "@dashboard-kit/";
const ALWAYS_PRESENT = new Set(["react", "react-dom"]);
// Same mapping as `shadcn add`: an item's type decides which alias folder it lands in.
const ALIAS_FOR_TYPE = { "registry:ui": "ui", "registry:lib": "lib", "registry:hook": "hooks", "registry:block": "components" };

const args = process.argv.slice(2);
const check = args.includes("--check");
const requested = args.filter((arg) => !arg.startsWith("--"));
const items = new Map(registry.items.map((item) => [item.name, item]));

// Both projects map "@/*" to "./src/*" (tsconfig paths), so an alias resolves to a folder under src/.
const aliasDir = (alias) => alias.replace(/^@\//, "src/");

const targetPath = (item, file) => {
  const key = ALIAS_FOR_TYPE[file.type ?? item.type];
  if (!key) throw new Error(`${item.name}: unsupported file type "${file.type ?? item.type}"`);
  return join(aliasDir(targetAliases[key]), relative(aliasDir(sourceAliases[key]), file.path));
};

// Rewrite imports when the starter's aliases differ from the registry's (today they match).
const rewriteImports = (source) =>
  Object.keys(sourceAliases).reduce(
    (text, key) =>
      sourceAliases[key] === targetAliases[key] || !targetAliases[key]
        ? text
        : text.replaceAll(`from "${sourceAliases[key]}`, `from "${targetAliases[key]}`),
    source,
  );

const unknown = requested.filter((name) => !items.has(name));
if (unknown.length) {
  console.error(`✖ registry:sync: no registry item named ${unknown.map((n) => `"${n}"`).join(", ")}`);
  process.exit(1);
}

// Without names: every item that already has at least one file in the starter.
const roots = requested.length
  ? requested
  : registry.items.filter((item) => item.files.some((file) => existsSync(join(app, targetPath(item, file))))).map((item) => item.name);

const selected = new Set();
const collect = (name) => {
  if (selected.has(name)) return;
  selected.add(name);
  for (const dep of items.get(name).registryDependencies ?? []) {
    if (dep.startsWith(NAMESPACE)) collect(dep.slice(NAMESPACE.length));
  }
};
roots.forEach(collect);

const changed = [];
const missingPackages = new Set();
for (const name of selected) {
  const item = items.get(name);
  for (const file of item.files) {
    const target = join(app, targetPath(item, file));
    const content = rewriteImports(readFileSync(join(pkg, file.path), "utf8"));
    if (existsSync(target) && readFileSync(target, "utf8") === content) continue;
    changed.push(relative(root, target));
    if (!check) {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, content);
    }
  }
  for (const dep of item.dependencies ?? []) {
    if (!ALWAYS_PRESENT.has(dep) && !appPackages[dep]) missingPackages.add(dep);
  }
}

if (check) {
  const problems = [
    ...changed.map((file) => `${file} differs from packages/ui (or is missing)`),
    ...[...missingPackages].map((dep) => `apps/starter/package.json is missing "${dep}"`),
  ];
  if (problems.length) {
    console.error(
      `✖ registry:sync --check found ${problems.length} problem(s):\n${problems.map((p) => `  • ${p}`).join("\n")}\n` +
        "  Edit the component in packages/ui, then run `pnpm registry:sync`.",
    );
    process.exit(1);
  }
  console.log(`✔ registry:sync --check passed (${selected.size} items in apps/starter)`);
  process.exit(0);
}

if (missingPackages.size) {
  const specs = [...missingPackages].map((dep) => (sourceVersions[dep] ? `${dep}@${sourceVersions[dep]}` : dep));
  console.log(`Adding to apps/starter: ${specs.join(" ")}`);
  execFileSync("pnpm", ["--filter", "@dashboard-kit/starter", "add", ...specs], { cwd: root, stdio: "inherit" });
}
console.log(
  changed.length
    ? `✔ registry:sync updated ${changed.length} file(s):\n${changed.map((f) => `  • ${f}`).join("\n")}`
    : `✔ registry:sync: apps/starter is up to date (${selected.size} items)`,
);
