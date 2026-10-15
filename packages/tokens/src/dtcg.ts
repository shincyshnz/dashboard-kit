/**
 * Minimal DTCG (W3C Design Tokens Community Group) helpers.
 * A token is any object with a `$value`. Groups are objects without one.
 * `$type` on a group applies to every token inside it.
 */
import { DesignError, isPlainObject } from "./errors.ts";

export const EXTENSION = "dev.dashboard-kit";

export type Tree = Record<string, unknown>;

export interface FlatToken {
  path: string[];
  type: string | undefined;
  value: unknown;
  description: string | undefined;
}

export const isToken = (node: unknown): node is Tree => isPlainObject(node) && "$value" in node;

/** Every token in the tree, depth-first, with inherited `$type`. */
export function flatten(tree: unknown, path: string[] = [], inheritedType?: string): FlatToken[] {
  if (!isPlainObject(tree)) return [];
  const type = typeof tree.$type === "string" ? tree.$type : inheritedType;
  if (isToken(tree)) {
    return [{ path, type, value: tree.$value, description: typeof tree.$description === "string" ? tree.$description : undefined }];
  }
  return Object.entries(tree)
    .filter(([key]) => !key.startsWith("$"))
    .flatMap(([key, child]) => flatten(child, [...path, key], type));
}

export function getAt(tree: unknown, path: readonly string[]): unknown {
  let node: unknown = tree;
  for (const key of path) {
    if (!isPlainObject(node)) return undefined;
    node = node[key];
  }
  return node;
}

/** Sets `$value` of the token at `path`, creating groups as needed and keeping other token fields. */
export function setTokenValue(tree: Tree, path: readonly string[], value: unknown) {
  let node: Tree = tree;
  for (const key of path) {
    if (!isPlainObject(node[key])) node[key] = {};
    node = node[key] as Tree;
  }
  node.$value = value;
}

/** Replaces `"{color.light.primary}"` references with the referenced value (after theme merging). */
export function resolveAliases(tree: Tree, label: string): Tree {
  const resolveValue = (value: unknown, seen: string[]): unknown => {
    const ref = typeof value === "string" ? /^\{([^{}]+)\}$/.exec(value) : null;
    if (!ref) return value;
    const target = ref[1] ?? "";
    if (seen.includes(target)) throw new DesignError(`${label}: circular reference ${[...seen, target].join(" → ")}`);
    const token = getAt(tree, target.split("."));
    if (!isToken(token)) throw new DesignError(`${label}: reference {${target}} does not point to a token`);
    return resolveValue(token.$value, [...seen, target]);
  };
  const walk = (node: unknown): unknown => {
    if (!isPlainObject(node)) return node;
    if (isToken(node)) return { ...node, $value: resolveValue(node.$value, []) };
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, k.startsWith("$") ? v : walk(v)]));
  };
  return walk(tree) as Tree;
}

/** JSON with 2-space indent, but short arrays of numbers/strings kept on one line. */
export function formatJson(value: unknown): string {
  return (
    JSON.stringify(value, null, 2).replace(/\[\s+([^[\]{}]*?)\s+\]/g, (match, inner: string) => {
      const items = inner.split(/,\s*\n\s*/);
      const oneLine = `[${items.join(", ")}]`;
      return oneLine.length <= 100 ? oneLine : match;
    }) + "\n"
  );
}
