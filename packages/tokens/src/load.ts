import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import type { ThemeEntry } from "./compile.ts";
import type { Tree } from "./dtcg.ts";
import { DesignError, parseDesign, parseTheme } from "./parse.ts";
import { repoRoot, themesDir, TOKENS_FILENAME, tokensFile } from "./paths.ts";

const THEME_NAME = /^[a-z][a-z0-9-]*$/;

export interface LoadedTheme extends ThemeEntry {
  /** Merged DTCG tree (defaults + overrides), used for docs and diffs. */
  tree: Tree;
  file: string;
}

/** Loads the default design-tokens.json and every themes/<name>/design-tokens.json. */
export async function loadThemes(): Promise<LoadedTheme[]> {
  const label = relative(repoRoot, tokensFile) || TOKENS_FILENAME;
  if (!existsSync(tokensFile)) throw new DesignError(`${label} not found.`);
  const base = parseDesign(await readFile(tokensFile, "utf8"), label);
  const themes: LoadedTheme[] = [{ name: "default", file: tokensFile, ...base }];

  if (!existsSync(themesDir)) return themes;

  const folders = (await readdir(themesDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const name of folders) {
    const file = resolve(themesDir, name, TOKENS_FILENAME);
    if (!existsSync(file)) continue;
    const themeLabel = relative(repoRoot, file);
    if (!THEME_NAME.test(name) || name === "default") {
      throw new DesignError(`${themeLabel}: theme folder names must be kebab-case and not "default".`);
    }
    themes.push({ name, file, ...parseTheme(await readFile(file, "utf8"), base.tree, themeLabel) });
  }
  return themes;
}
