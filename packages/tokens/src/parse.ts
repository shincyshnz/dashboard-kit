import { parse as parseYaml } from "yaml";
import { designSchema, themeOverrideSchema, type Design } from "./schema.ts";

export class DesignError extends Error {}

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/;

/** Returns the YAML front matter text and its offsets in the file. */
export function extractFrontMatter(markdown: string, label = "DESIGN.md") {
  const match = FRONT_MATTER.exec(markdown);
  if (!match) throw new DesignError(`${label} must start with a YAML block between two --- lines.`);
  return { yaml: match[1] ?? "", end: match[0].length };
}

export function readYaml(markdown: string, label = "DESIGN.md"): Record<string, unknown> {
  const { yaml } = extractFrontMatter(markdown, label);
  let raw: unknown;
  try {
    raw = parseYaml(yaml);
  } catch (error) {
    throw new DesignError(`${label} YAML is invalid: ${(error as Error).message}`);
  }
  if (!isPlainObject(raw)) throw new DesignError(`${label} front matter must be a YAML mapping.`);
  return raw;
}

export function validateDesign(raw: unknown, label = "DESIGN.md"): Design {
  const result = designSchema.safeParse(raw);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  • ${i.path.join(".") || "(root)"}: ${i.message}`);
    throw new DesignError(`${label} has ${lines.length} problem(s):\n${lines.join("\n")}`);
  }
  return result.data;
}

/** Parses and validates a complete (default) DESIGN.md. */
export function parseDesign(markdown: string, label = "DESIGN.md"): Design {
  return validateDesign(readYaml(markdown, label), label);
}

/**
 * Parses a tenant theme. It only lists what differs from the default; the result
 * is the default deep-merged with the overrides, then fully validated.
 * Themes may change values but not introduce token names the default lacks,
 * because Tailwind utilities are generated from the default's token set.
 */
export function parseTheme(markdown: string, base: Design, label: string): Design {
  const raw = readYaml(markdown, label);
  const shape = themeOverrideSchema.safeParse(raw);
  if (!shape.success) throw new DesignError(`${label}: meta.name is required.`);

  const unknown = findUnknownKeys(raw, base as unknown as Record<string, unknown>, ["meta", "checks"]);
  if (unknown.length > 0) {
    throw new DesignError(
      `${label} defines tokens that the default DESIGN.md does not have:\n${unknown
        .map((p) => `  • ${p}`)
        .join("\n")}\n  Add them to the default DESIGN.md first so every theme provides them.`,
    );
  }
  return validateDesign(deepMerge(base, raw), label);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) return (override ?? base) as T;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    out[key] = key in out ? deepMerge(out[key], value) : value;
  }
  return out as T;
}

/** Dot-paths present in `override` but absent from `base` (ignoring free-form groups). */
function findUnknownKeys(override: Record<string, unknown>, base: Record<string, unknown>, free: string[], prefix = ""): string[] {
  const found: string[] = [];
  for (const [key, value] of Object.entries(override)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (!prefix && free.includes(key)) continue;
    if (!(key in base)) {
      found.push(path);
    } else if (isPlainObject(value) && isPlainObject(base[key])) {
      found.push(...findUnknownKeys(value, base[key], free, path));
    }
  }
  return found;
}
