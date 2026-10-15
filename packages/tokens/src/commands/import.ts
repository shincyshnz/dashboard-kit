import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative } from "node:path";
import { parseArgs } from "node:util";
import { parseDocument } from "yaml";
import { parseTokenColor, toOklchString } from "../color.ts";
import { loadThemes } from "../load.ts";
import { DesignError, extractFrontMatter, isPlainObject, readYaml } from "../parse.ts";
import { designFile, fromUser, repoRoot, themeFile } from "../paths.ts";

interface FlatToken {
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

/** Flattens DTCG JSON ({ $type, $value } leaves) into kebab-case token names. */
export function flattenDtcg(node: unknown, path: string[] = [], inheritedType?: string): FlatToken[] {
  if (!isPlainObject(node)) return [];
  const type = typeof node.$type === "string" ? node.$type : inheritedType;
  if ("$value" in node) {
    const segments = path.map(kebab);
    if (segments.length > 1 && GROUP_PREFIXES.has(segments[0] ?? "")) segments.shift();
    return [{ name: segments.join("-"), type, value: node.$value }];
  }
  return Object.entries(node)
    .filter(([key]) => !key.startsWith("$"))
    .flatMap(([key, child]) => flattenDtcg(child, [...path, key], type));
}

function dimension(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (isPlainObject(value) && typeof value.value === "number" && typeof value.unit === "string") {
    return `${value.value}${value.unit}`;
  }
  return undefined;
}

function fontFamily(value: unknown): string | undefined {
  const list = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  const quoted = list.map((f) => String(f)).map((f) => (/\s/.test(f) && !/^["']/.test(f) ? `"${f}"` : f));
  return quoted.length ? quoted.join(", ") : undefined;
}

async function readJson(path: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(fromUser(path), "utf8"));
  } catch (error) {
    throw new DesignError(`Could not read ${path}: ${(error as Error).message}`);
  }
}

const HELP = `Import Figma Variables / Tokens Studio (DTCG JSON) into DESIGN.md

  pnpm tokens:import --light light.json --dark dark.json [--theme <name>] [--dry-run]
  pnpm tokens:import --file tokens.json                  # file with top-level "light" and "dark" groups

Colours become oklch(). Recognised extras: "radius" (dimension) and
font families named sans / heading / mono. Comments in DESIGN.md are kept.`;

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

  const modes: Partial<Record<"light" | "dark", FlatToken[]>> = {};
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
  const knownColors = new Set(Object.keys(
    ((readYaml(await readFile(designFile, "utf8")).colors as Record<string, Record<string, string>> | undefined)?.light) ?? {},
  ));

  if (!existsSync(target)) {
    if (theme === "default") throw new DesignError(`${label} not found.`);
    const title = theme.replace(/(^|-)(\w)/g, (_m, sep: string, c: string) => `${sep ? " " : ""}${c.toUpperCase()}`);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(
      target,
      `---\nmeta:\n  name: ${title}\n  version: 1.0.0\n---\n\n# ${title} theme\n\nOnly values that differ from the default DESIGN.md are listed above.\n`,
    );
    console.log(`+ created ${label}`);
  }

  const text = await readFile(target, "utf8");
  const { yaml, end } = extractFrontMatter(text, label);
  const doc = parseDocument(yaml);
  const changes: string[] = [];
  const skipped: string[] = [];

  const set = (path: (string | number)[], value: string) => {
    const before = doc.getIn(path);
    if (before === value) return;
    doc.setIn(path, value);
    changes.push(`${before === undefined ? "+" : "~"} ${path.join(".")}: ${before === undefined ? "" : `${String(before)} → `}${value}`);
  };

  for (const mode of ["light", "dark"] as const) {
    for (const token of modes[mode] ?? []) {
      const { name, type, value } = token;
      if (name === "radius" || name === "border-radius") {
        const v = dimension(value);
        if (v) set(["radius"], v);
        continue;
      }
      if (type === "fontFamily" || /^font-(sans|heading|mono)$/.test(name)) {
        const key = name.replace(/^font(-family)?-/, "");
        const v = fontFamily(value);
        if (v && ["sans", "heading", "mono"].includes(key)) set(["typography", key], v);
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
        skipped.push(`${mode}.${name} (not in the default DESIGN.md — add it there first)`);
        continue;
      }
      set(["colors", mode, name], toOklchString(color));
    }
  }

  console.log(changes.length ? changes.join("\n") : "No token values changed.");
  if (skipped.length) console.warn(`⚠ skipped ${skipped.length}:\n${skipped.map((s) => `  • ${s}`).join("\n")}`);

  if (values["dry-run"] || changes.length === 0) {
    if (values["dry-run"]) console.log("(dry run — nothing written)");
    return;
  }

  const original = text;
  await writeFile(target, `---\n${doc.toString({ lineWidth: 0 }).trimEnd()}\n---\n${text.slice(end)}`);
  try {
    await loadThemes();
    console.log(`✔ ${label} updated (${changes.length} change(s)). Bump meta.version and run pnpm tokens:build.`);
  } catch (error) {
    await writeFile(target, original);
    throw new DesignError(`Import rolled back — the result would be invalid:\n${(error as Error).message}`);
  }
}
