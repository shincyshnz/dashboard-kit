import { parseDocument } from "yaml";
import { resolveAliases, type Tree } from "./dtcg.ts";
import { treeToRaw } from "./convert.ts";
import { DesignError, isPlainObject } from "./errors.ts";
import { designSchema, type Design } from "./schema.ts";

export { DesignError, isPlainObject };

/** Parses a tokens JSON file, reporting syntax errors with line and column. */
export function readTokens(text: string, label: string): Tree {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    const message = (error as Error).message.split("\n")[0] ?? "";
    const where = locate(text, message);
    throw new DesignError(`${label} is not valid JSON${where}: ${message.replace(/ in JSON at position \d+ \(line \d+ column \d+\)/, "")}`);
  }
  if (!isPlainObject(data)) throw new DesignError(`${label} must contain a JSON object.`);
  return data;
}

/**
 * Node reports "(line N column M)" for most JSON syntax errors. When it doesn't,
 * fall back to the YAML parser (JSON is a subset of YAML), which reports
 * positions for many of the remaining cases.
 */
function locate(text: string, message: string): string {
  const node = /\(line (\d+) column (\d+)\)/.exec(message);
  if (node) return ` (line ${node[1]}, column ${node[2]})`;
  const linePos = parseDocument(text).errors[0]?.linePos?.[0];
  return linePos ? ` (line ${linePos.line}, column ${linePos.col})` : "";
}

export function validateDesign(raw: unknown, label: string): Design {
  const result = designSchema.safeParse(raw);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  • ${describePath(i.path)}: ${i.message}`);
    throw new DesignError(`${label} has ${lines.length} problem(s):\n${lines.join("\n")}`);
  }
  return result.data;
}

/** Translates internal paths back to the JSON paths people edit. */
function describePath(path: PropertyKey[]): string {
  const p = path.map(String);
  const map: Record<string, string> = {
    colors: "color", typography: "font", shadows: "shadow", density: "spacing",
  };
  if (p[0] === "meta" || p[0] === "checks") return `$extensions["dev.dashboard-kit"].${p.join(".")}`;
  if (p[0] === "motion") return [p[1] === "ease" ? "easing" : "duration", ...p.slice(2)].join(".");
  if (p[0] === "fontSizes") return ["fontSize", ...p.slice(1)].join(".");
  if (p[0] === "density") return "spacing";
  return [map[p[0] ?? ""] ?? p[0], ...p.slice(1)].join(".") || "(root)";
}

/** Tree → validated design (aliases resolved). */
export function treeToDesign(tree: Tree, label: string): Design {
  return validateDesign(treeToRaw(resolveAliases(tree, label), label), label);
}

/** Parses the default design-tokens.json. */
export function parseDesign(text: string, label = "design-tokens.json"): { design: Design; tree: Tree } {
  const tree = readTokens(text, label);
  return { design: treeToDesign(tree, label), tree };
}

/**
 * Parses a tenant theme. It lists only what differs from the default; the trees
 * are deep-merged first (so `$type`s and descriptions are inherited and aliases
 * see the tenant's values), then converted and fully validated.
 * Themes may change values but not add token names: Tailwind utilities are
 * generated from the default's token set.
 */
export function parseTheme(text: string, baseTree: Tree, label: string): { design: Design; tree: Tree } {
  const override = readTokens(text, label);
  const name = (override.$extensions as Record<string, { meta?: { name?: unknown } }> | undefined)?.["dev.dashboard-kit"]?.meta?.name;
  if (typeof name !== "string" || !name) {
    throw new DesignError(`${label}: $extensions["dev.dashboard-kit"].meta.name is required.`);
  }
  const unknown = findUnknownTokens(override, baseTree);
  if (unknown.length > 0) {
    throw new DesignError(
      `${label} defines tokens that the default design-tokens.json does not have:\n${unknown
        .map((p) => `  • ${p}`)
        .join("\n")}\n  Add them to the default design-tokens.json first so every theme provides them.`,
    );
  }
  // A theme inherits the default's version only if it doesn't declare its own.
  const tree = deepMerge(baseTree, override);
  return { design: treeToDesign(tree, label), tree };
}

export function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) return (override ?? base) as T;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    // Token values replace wholesale (an array or object $value must not be merged).
    out[key] = key in out && key !== "$value" ? deepMerge(out[key], value) : value;
  }
  return out as T;
}

/** Token/group paths present in `override` but absent from `base`; `$`-keys are free. */
function findUnknownTokens(override: Record<string, unknown>, base: Record<string, unknown>, prefix = ""): string[] {
  const found: string[] = [];
  for (const [key, value] of Object.entries(override)) {
    if (key.startsWith("$")) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (!(key in base)) found.push(path);
    else if (isPlainObject(value) && isPlainObject(base[key])) found.push(...findUnknownTokens(value, base[key], path));
  }
  return found;
}
