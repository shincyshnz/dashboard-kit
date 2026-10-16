#!/usr/bin/env node
// Assembles the GitHub Pages site (ADR 0010) from outputs that are already built.
// Run with: pnpm pages:build   (builds the registry and Storybook first)
//
//   site/              Storybook (apps/storybook/storybook-static)
//   site/r/*.json      shadcn registry (packages/ui/public/r)
import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const storybook = join(root, "apps/storybook/storybook-static");
const registry = join(root, "packages/ui/public/r");
const site = join(root, "site");

const missing = [
  [storybook, "pnpm storybook:build"],
  [registry, "pnpm registry:build"],
].filter(([dir]) => !existsSync(dir));
if (missing.length) {
  console.error(`✖ pages:build: missing build output:\n${missing.map(([dir, cmd]) => `  • ${dir} — run \`${cmd}\``).join("\n")}`);
  process.exit(1);
}
// Storybook owns the site root; a top-level r/ from Storybook would be silently overwritten.
if (existsSync(join(storybook, "r"))) {
  console.error("✖ pages:build: storybook-static/r already exists and would clash with the registry path /r/");
  process.exit(1);
}

rmSync(site, { recursive: true, force: true });
cpSync(storybook, site, { recursive: true });
cpSync(registry, join(site, "r"), { recursive: true });

const items = readdirSync(join(site, "r")).filter((file) => file.endsWith(".json")).length;
console.log(`✔ pages:build: site/ ready (Storybook at /, ${items} registry files at /r/)`);
