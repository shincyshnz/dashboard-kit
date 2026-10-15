/** Generates the token reference tables inside DESIGN.md from the JSON, so the guide never drifts. */
import { flatten, getAt, type Tree } from "./dtcg.ts";
import type { LoadedTheme } from "./load.ts";
import { toCss } from "./values.ts";

export const START = "<!-- tokens:start — generated from design-tokens.json by `pnpm tokens:docs`; do not edit by hand -->";
export const END = "<!-- tokens:end -->";

const cell = (s: string | undefined) => (s ?? "").replace(/\|/g, "\\|");
const code = (s: string | undefined) => (s ? `\`${cell(s)}\`` : "—");

function colorTable(tree: Tree): string {
  const light = flatten(getAt(tree, ["color", "light"]), [], "color");
  const dark = new Map(flatten(getAt(tree, ["color", "dark"]), [], "color").map((t) => [t.path.join("."), t]));
  const rows = light.map((t) => {
    const name = t.path.join(".");
    const d = dark.get(name);
    return `| \`${name}\` | ${code(toCss("color", t.value))} | ${code(d && toCss("color", d.value))} | ${cell(t.description)} |`;
  });
  return ["| Token | Light | Dark | Use |", "|---|---|---|---|", ...rows].join("\n");
}

function otherTable(tree: Tree): string {
  const rows = flatten(tree)
    .filter((t) => t.path[0] !== "color")
    .map((t) => {
      const parentDescription = t.path.length > 1 ? (getAt(tree, [t.path[0] ?? "", "$description"]) as string | undefined) : undefined;
      return `| \`${t.path.join(".")}\` | ${code(toCss(t.type, t.value))} | ${cell(t.description ?? parentDescription)} |`;
    });
  return ["| Token | Value | Use |", "|---|---|---|", ...rows].join("\n");
}

function themesTable(themes: LoadedTheme[]): string {
  const rows = themes.map(
    ({ name, design }) =>
      `| \`${name}\` | ${cell(design.meta.name)} | ${design.meta.version} | ${cell(design.meta.description)} |`,
  );
  return ["| Theme id | Name | Version | Description |", "|---|---|---|---|", ...rows].join("\n");
}

export function renderTokenDocs(themes: LoadedTheme[]): string {
  const [base] = themes;
  if (!base) return "";
  return [
    START,
    "",
    `### Colours — ${base.design.meta.name} v${base.design.meta.version}`,
    "",
    colorTable(base.tree),
    "",
    "### Shape, type, depth and motion",
    "",
    otherTable(base.tree),
    "",
    "### Themes",
    "",
    themesTable(themes),
    "",
    END,
  ].join("\n");
}

/** Returns the document with the generated block replaced, or null if the markers are missing. */
export function injectTokenDocs(markdown: string, block: string): string | null {
  const start = markdown.indexOf("<!-- tokens:start");
  const end = markdown.indexOf(END);
  if (start === -1 || end === -1 || end < start) return null;
  return markdown.slice(0, start) + block + markdown.slice(end + END.length);
}
