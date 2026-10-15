import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import type { ThemeEntry } from "./compile.ts";
import { DesignError, parseDesign, parseTheme } from "./parse.ts";
import { designFile, repoRoot, themesDir } from "./paths.ts";

const THEME_NAME = /^[a-z][a-z0-9-]*$/;

/** Loads the default DESIGN.md and every themes/<name>/DESIGN.md (merged onto the default). */
export async function loadThemes(): Promise<ThemeEntry[]> {
  const base = parseDesign(await readFile(designFile, "utf8"), relative(repoRoot, designFile) || "DESIGN.md");
  const themes: ThemeEntry[] = [{ name: "default", design: base }];

  if (!existsSync(themesDir)) return themes;

  const folders = (await readdir(themesDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const name of folders) {
    const file = resolve(themesDir, name, "DESIGN.md");
    if (!existsSync(file)) continue;
    const label = relative(repoRoot, file);
    if (!THEME_NAME.test(name) || name === "default") {
      throw new DesignError(`${label}: theme folder names must be kebab-case and not "default".`);
    }
    themes.push({ name, design: parseTheme(await readFile(file, "utf8"), base, label) });
  }
  return themes;
}
