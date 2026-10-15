/**
 * Maps a DTCG token tree onto the kit's internal design object
 * (the shape `designSchema` validates and `compile.ts` consumes).
 */
import { EXTENSION, flatten, getAt, type FlatToken, type Tree } from "./dtcg.ts";
import { DesignError, isPlainObject } from "./errors.ts";
import { toCss } from "./values.ts";

/** Top-level groups and the `$type` their tokens must have. */
export const GROUP_TYPES: Record<string, string> = {
  color: "color",
  radius: "dimension",
  spacing: "dimension",
  font: "fontFamily",
  fontSize: "dimension",
  lineHeight: "dimension",
  shadow: "shadow",
  duration: "duration",
  easing: "cubicBezier",
};

export function treeToRaw(tree: Tree, label: string): Record<string, unknown> {
  const problems: string[] = [];

  for (const key of Object.keys(tree)) {
    if (!key.startsWith("$") && !(key in GROUP_TYPES)) {
      problems.push(`unknown top-level group "${key}" (allowed: ${Object.keys(GROUP_TYPES).join(", ")})`);
    }
  }

  const css = (token: FlatToken): string | undefined => {
    const where = token.path.join(".");
    const expected = GROUP_TYPES[token.path[0] ?? ""];
    if (expected && token.type !== expected) {
      problems.push(`${where}: $type must be "${expected}" (found ${token.type ? `"${token.type}"` : "none"})`);
      return undefined;
    }
    const value = toCss(token.type, token.value);
    if (value === undefined) problems.push(`${where}: value ${JSON.stringify(token.value)} is not a valid ${token.type}`);
    return value;
  };

  const group = (name: string): Record<string, string> | undefined => {
    if (!(name in tree)) return undefined;
    const out: Record<string, string> = {};
    for (const token of flatten(tree[name], [name])) {
      if (token.path.length !== 2) {
        problems.push(`${token.path.join(".")}: "${name}" tokens must sit directly in the group`);
        continue;
      }
      const value = css(token);
      if (value !== undefined) out[token.path[1] ?? ""] = value;
    }
    return out;
  };

  const single = (name: string): string | undefined => {
    const node = tree[name];
    if (node === undefined) return undefined;
    const [token] = flatten(node, [name]);
    if (!token || token.path.length !== 1) {
      problems.push(`${name}: must be a single token with a $value`);
      return undefined;
    }
    return css(token);
  };

  const raw: Record<string, unknown> = {};
  const ext = getAt(tree, ["$extensions", EXTENSION]);
  if (isPlainObject(ext)) {
    raw.meta = { ...(isPlainObject(ext.meta) ? ext.meta : {}), description: tree.$description };
    if (ext.checks !== undefined) raw.checks = ext.checks;
  } else {
    raw.meta = { description: tree.$description };
  }

  if (isPlainObject(tree.color)) {
    const colors: Record<string, Record<string, string>> = {};
    for (const mode of Object.keys(tree.color).filter((k) => !k.startsWith("$"))) {
      if (mode !== "light" && mode !== "dark") {
        problems.push(`color.${mode}: colour tokens must be grouped under "light" and "dark"`);
        continue;
      }
      colors[mode] = {};
      for (const token of flatten(tree.color[mode], ["color", mode], typeof tree.color.$type === "string" ? tree.color.$type : undefined)) {
        if (token.path.length !== 3) {
          problems.push(`${token.path.join(".")}: colour tokens must sit directly in color.${mode}`);
          continue;
        }
        const value = css(token);
        if (value !== undefined) colors[mode][token.path[2] ?? ""] = value;
      }
    }
    raw.colors = colors;
  }

  const radius = single("radius");
  if (radius !== undefined) raw.radius = radius;
  const spacing = single("spacing");
  if (spacing !== undefined) raw.density = { spacing };
  const font = group("font");
  if (font) raw.typography = font;
  const shadows = group("shadow");
  if (shadows) raw.shadows = shadows;

  const sizes = group("fontSize");
  const lineHeights = group("lineHeight") ?? {};
  if (sizes) {
    raw.fontSizes = Object.fromEntries(
      Object.entries(sizes).map(([k, size]) => [k, lineHeights[k] ? { size, lineHeight: lineHeights[k] } : size]),
    );
  }
  for (const k of Object.keys(lineHeights)) {
    if (!sizes || !(k in sizes)) problems.push(`lineHeight.${k}: has no matching fontSize.${k}`);
  }

  const duration = group("duration");
  const ease = group("easing");
  if (duration || ease) raw.motion = { ...(duration ? { duration } : {}), ...(ease ? { ease } : {}) };

  if (problems.length) {
    throw new DesignError(`${label} has ${problems.length} problem(s):\n${problems.map((p) => `  • ${p}`).join("\n")}`);
  }
  return raw;
}
