#!/usr/bin/env node
// Enforces docs/DOCUMENTATION-STANDARD.md. Run with: pnpm docs:check
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rel = (p) => relative(root, p);
const read = (p) => readFileSync(p, "utf8");
const errors = [];
const fail = (file, message) => errors.push(`${rel(file)}: ${message}`);

const IGNORED_DIRS = new Set(["node_modules", "dist", ".turbo", ".git"]);
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (IGNORED_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

// 1. Every package and app has a meaningful README.
const workspaces = ["apps", "packages"].flatMap((group) =>
  readdirSync(join(root, group))
    .map((name) => join(root, group, name))
    .filter((dir) => statSync(dir).isDirectory()),
);
for (const dir of workspaces) {
  const readme = join(dir, "README.md");
  if (!existsSync(readme)) {
    fail(dir, "missing README.md");
    continue;
  }
  const text = read(readme);
  if (!/^# .+/m.test(text)) fail(readme, "needs a '# Title' heading");
  if (text.trim().split("\n").length < 5) fail(readme, "is too short to be useful (fewer than 5 lines)");
}

// 2. ADRs: naming, status line, sections, listed in the index.
const adrDir = join(root, "docs/adr");
const adrIndex = read(join(adrDir, "README.md"));
for (const file of readdirSync(adrDir)) {
  if (file === "README.md" || file === "_template.md") continue;
  const path = join(adrDir, file);
  if (!/^\d{4}-[a-z0-9-]+\.md$/.test(file)) {
    fail(path, "ADR file names must be NNNN-kebab-title.md");
    continue;
  }
  const text = read(path);
  const number = file.slice(0, 4);
  if (!new RegExp(`^# ADR ${number} — .+`, "m").test(text)) fail(path, `title must be '# ADR ${number} — …'`);
  if (!/^\*\*Status:\*\* (Proposed|Accepted|Superseded by \d{4}) · \d{4}-\d{2}-\d{2}/m.test(text)) {
    fail(path, "needs '**Status:** Proposed|Accepted|Superseded by NNNN · YYYY-MM-DD'");
  }
  for (const section of ["Context", "Decision", "Consequences"]) {
    if (!new RegExp(`^## ${section}\\s*$`, "m").test(text)) fail(path, `missing '## ${section}' section`);
  }
  if (!adrIndex.includes(`./${file}`)) fail(join(adrDir, "README.md"), `does not list ${file}`);
}

// 3. Every completed phase has a report with all required sections.
const plan = read(join(root, "docs/PLAN.md"));
const REPORT_SECTIONS = ["Summary", "Delivered", "Decisions", "Verification", "Documentation updated", "Known limitations", "Next"];
for (const match of plan.matchAll(/^### Phase (\d+) — .*✅/gm)) {
  const report = join(root, `docs/phases/phase-${match[1]}.md`);
  if (!existsSync(report)) {
    fail(report, `missing — Phase ${match[1]} is marked complete in PLAN.md`);
    continue;
  }
  const text = read(report);
  for (const section of REPORT_SECTIONS) {
    if (!new RegExp(`^## ${section}\\s*$`, "m").test(text)) fail(report, `missing '## ${section}' section`);
  }
}

// 4. Every workspace package version is mentioned in the changelog.
const changelog = read(join(root, "CHANGELOG.md"));
for (const dir of workspaces) {
  const pkgFile = join(dir, "package.json");
  if (!existsSync(pkgFile)) continue;
  const { name, version } = JSON.parse(read(pkgFile));
  if (version && !changelog.includes(version)) fail(join(root, "CHANGELOG.md"), `no entry for ${name}@${version}`);
}

// 5. Relative Markdown links resolve.
for (const file of walk(root).filter((f) => f.endsWith(".md"))) {
  const text = read(file).replace(/```[\s\S]*?```/g, "");
  for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const path = resolve(dirname(file), decodeURI(target.split("#")[0]));
    if (!existsSync(path)) fail(file, `broken link → ${target}`);
  }
}

if (errors.length) {
  console.error(`✖ docs:check found ${errors.length} problem(s):\n${errors.map((e) => `  • ${e}`).join("\n")}`);
  console.error("  See docs/DOCUMENTATION-STANDARD.md");
  process.exit(1);
}
console.log(`✔ docs:check passed (${workspaces.length} workspaces, ADRs, phase reports, changelog, links)`);
