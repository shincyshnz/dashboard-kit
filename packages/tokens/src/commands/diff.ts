import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { relative } from "node:path";
import { parseArgs } from "node:util";
import { EXTENSION, flatten, getAt, type Tree } from "../dtcg.ts";
import { DesignError } from "../errors.ts";
import { readTokens } from "../parse.ts";
import { fromUser, repoRoot, themeFile } from "../paths.ts";

type Bump = "none" | "patch" | "minor" | "major";
const RANK: Record<Bump, number> = { none: 0, patch: 1, minor: 2, major: 3 };

/** token path → serialised $value */
export function tokenMap(tree: Tree): Map<string, string> {
  return new Map(flatten(tree).map((t) => [t.path.join("."), JSON.stringify(t.value)]));
}

export function diffTokens(base: Map<string, string>, head: Map<string, string>) {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: [string, string, string][] = [];
  for (const [key, value] of head) {
    if (!base.has(key)) added.push(key);
    else if (base.get(key) !== value) changed.push([key, base.get(key) ?? "", value]);
  }
  for (const key of base.keys()) if (!head.has(key)) removed.push(key);
  const required: Bump = removed.length ? "major" : added.length ? "minor" : changed.length ? "patch" : "none";
  return { added, removed, changed, required };
}

export function versionBump(from: string, to: string): Bump {
  const [a = 0, b = 0, c = 0] = from.split(".").map(Number);
  const [x = 0, y = 0, z = 0] = to.split(".").map(Number);
  if (x > a) return "major";
  if (x === a && y > b) return "minor";
  if (x === a && y === b && z > c) return "patch";
  return "none";
}

const versionOf = (tree: Tree) => String(getAt(tree, ["$extensions", EXTENSION, "meta", "version"]) ?? "0.0.0");

function gitShow(ref: string, file: string): string {
  try {
    const top = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: repoRoot, encoding: "utf8" }).trim();
    return execFileSync("git", ["show", `${ref}:${relative(top, file)}`], { cwd: repoRoot, encoding: "utf8" });
  } catch {
    throw new DesignError(`Could not read ${relative(repoRoot, file)} at git ref "${ref}". Use --base-file instead.`);
  }
}

const HELP = `Show which tokens changed and whether the version was bumped enough

  pnpm tokens:diff                          # working copy vs git HEAD
  pnpm tokens:diff --base main              # vs another git ref
  pnpm tokens:diff --base-file old.json     # vs a file
  pnpm tokens:diff --theme grove --strict   # a theme; exit 1 if the bump is too small (CI)`;

export async function diff(argv: string[]) {
  const { values } = parseArgs({
    args: argv,
    options: {
      base: { type: "string", default: "HEAD" },
      "base-file": { type: "string" },
      theme: { type: "string", default: "default" },
      strict: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
  });
  if (values.help) {
    console.log(HELP);
    return;
  }

  const file = themeFile(values.theme);
  const label = relative(repoRoot, file);
  const head = readTokens(await readFile(file, "utf8"), label);
  const baseText = values["base-file"] ? await readFile(fromUser(values["base-file"]), "utf8") : gitShow(values.base, file);
  const base = readTokens(baseText, `${label} (base)`);

  const { added, removed, changed, required } = diffTokens(tokenMap(base), tokenMap(head));
  const from = versionOf(base);
  const to = versionOf(head);
  const actual = versionBump(from, to);

  console.log(`${label}: ${from} → ${to}`);
  if (required === "none") {
    console.log("No token changes.");
    return;
  }
  for (const key of removed) console.log(`  − ${key}`);
  for (const key of added) console.log(`  + ${key}`);
  for (const [key, a, b] of changed) console.log(`  ~ ${key}: ${a} → ${b}`);
  console.log(`\nRequired version bump: ${required} (removed → major, added → minor, changed → patch)`);

  if (RANK[actual] < RANK[required]) {
    console.warn(`⚠ meta.version bump is "${actual}" but these changes need at least "${required}".`);
    if (values.strict) process.exit(1);
  } else {
    console.log(`✔ meta.version bump (${actual}) is sufficient.`);
  }
}
