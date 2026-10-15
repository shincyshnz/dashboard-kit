import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative } from "node:path";
import { parseArgs } from "node:util";
import { parseTokenColor, toOklchString } from "../color.ts";
import { EXTENSION, flatten, formatJson, getAt, setTokenValue, type Tree } from "../dtcg.ts";
import { DesignError, isPlainObject } from "../errors.ts";
import { loadThemes } from "../load.ts";
import { readTokens } from "../parse.ts";
import { fromUser, repoRoot, themeFile, tokensFile } from "../paths.ts";
import { toCss } from "../values.ts";

export interface ImportedToken {
  name: string;
  type: string | undefined;
  value: unknown;
}

const kebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_/.]+/g, "-")
    .toLowerCase();

const GROUP_PREFIXES = new Set(["color", "colors", "colour", "colours"]);

/** Flattens a Figma / Tokens Studio DTCG export into kebab-case names. */
export function flattenDtcg(node: unknown): ImportedToken[] {
  return flatten(node).map(({ path, type, value }) => {
    const segments = path.map(kebab);
    if (segments.length > 1 && GROUP_PREFIXES.has(segments[0] ?? "")) segments.shift();
    return { name: segments.join("-"), type, value };
  });
}

async function readJson(path: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(fromUser(path), "utf8"));
  } catch (error) {
    throw new DesignError(`Could not read ${path}: ${(error as Error).message}`);
  }
}

const HELP = `Import Figma Variables / Tokens Studio (DTCG JSON) into design-tokens.json

  pnpm tokens:import --light light.json --dark dark.json [--theme <name>] [--dry-run]
  pnpm tokens:import --file tokens.json        # one file with top-level "light" and "dark" groups

Colours become oklch() strings. Also recognised: "radius" (dimension) and
font families named sans / heading / mono. Existing $description fields are kept.`;

export async function importTokens(argv: string[]) {
  const { values } = parseArgs({
    args: argv,
    options: {
      light: { type: "string" },
      dark: { type: "string" },
      file: { type: "string" },
      theme: { type: "string", default: "default" },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
  });
  if (values.help || (!values.file && !values.light && !values.dark)) {
    console.log(HELP);
    return;
  }

  const modes: Partial<Record<"light" | "dark", ImportedToken[]>> = {};
  if (values.file) {
    const json = await readJson(values.file);
    if (!isPlainObject(json)) throw new DesignError(`${values.file} must contain a JSON object.`);
    for (const [key, group] of Object.entries(json)) {
      const mode = key.toLowerCase();
      if (mode === "light" || mode === "dark") modes[mode] = flattenDtcg(group);
    }
    if (!modes.light && !modes.dark) throw new DesignError(`${values.file} needs top-level "light" and/or "dark" groups.`);
  }
  if (values.light) modes.light = flattenDtcg(await readJson(values.light));
  if (values.dark) modes.dark = flattenDtcg(await readJson(values.dark));

  const theme = values.theme;
  const target = themeFile(theme);
  const label = relative(repoRoot, target);
  const baseTree = readTokens(await readFile(tokensFile, "utf8"), relative(repoRoot, tokensFile));
  const knownColors = new Set(Object.keys((getAt(baseTree, ["color", "light"]) as Tree | undefined) ?? {}).filter((k) => !k.startsWith("$")));

  if (!existsSync(target)) {
    if (theme === "default") throw new DesignError(`${label} not found.`);
    const title = theme.replace(/(^|-)(\w)/g, (_m, sep: string, c: string) => `${sep ? " " : ""}${c.toUpperCase()}`);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(
      target,
      formatJson({
        $schema: "../../packages/tokens/schema/theme-tokens.schema.json",
        $extensions: { [EXTENSION]: { meta: { name: title, version: "1.0.0" } } },
      }),
    );
    console.log(`+ created ${label}`);
  }

  const original = await readFile(target, "utf8");
  const tree = readTokens(original, label);
  const changes: string[] = [];
  const skipped: string[] = [];

  const set = (path: string[], value: unknown, type: string) => {
    const before = (getAt(tree, path) as Tree | undefined)?.$value;
    if (JSON.stringify(before) === JSON.stringify(value)) return;
    setTokenValue(tree, path, value);
    const show = (v: unknown) => toCss(type, v) ?? JSON.stringify(v);
    changes.push(`${before === undefined ? "+" : "~"} ${path.join(".")}: ${before === undefined ? "" : `${show(before)} → `}${show(value)}`);
  };

  for (const mode of ["light", "dark"] as const) {
    for (const { name, type, value } of modes[mode] ?? []) {
      if (name === "radius" || name === "border-radius") {
        set(["radius"], toCss("dimension", value) ?? value, "dimension");
        continue;
      }
      if (type === "fontFamily" || /^font-(family-)?(sans|heading|mono)$/.test(name)) {
        const role = name.replace(/^font-(family-)?/, "");
        if (["sans", "heading", "mono"].includes(role)) set(["font", role], value, "fontFamily");
        else skipped.push(`${mode}.${name} (unknown font role)`);
        continue;
      }
      if (type !== undefined && type !== "color") {
        skipped.push(`${mode}.${name} ($type ${type} is not imported)`);
        continue;
      }
      const color = parseTokenColor(value);
      if (!color) {
        skipped.push(`${mode}.${name} (unreadable colour)`);
        continue;
      }
      if (theme !== "default" && !knownColors.has(name)) {
        skipped.push(`${mode}.${name} (not in the default design-tokens.json — add it there first)`);
        continue;
      }
      set(["color", mode, name], toOklchString(color), "color");
    }
  }

  console.log(changes.length ? changes.join("\n") : "No token values changed.");
  if (skipped.length) console.warn(`⚠ skipped ${skipped.length}:\n${skipped.map((s) => `  • ${s}`).join("\n")}`);
  if (values["dry-run"] || changes.length === 0) {
    if (values["dry-run"]) console.log("(dry run — nothing written)");
    return;
  }

  await writeFile(target, formatJson(tree));
  try {
    await loadThemes();
    console.log(`✔ ${label} updated (${changes.length} change(s)). Bump meta.version, then run pnpm tokens:build.`);
  } catch (error) {
    await writeFile(target, original);
    throw new DesignError(`Import rolled back — the result would be invalid:\n${(error as Error).message}`);
  }
}
