import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const repoRoot = resolve(packageDir, "../..");

/** Where the user ran the command (pnpm runs scripts inside the package folder). */
export const userCwd = process.env.INIT_CWD ?? process.cwd();

export const fromUser = (path: string) => (isAbsolute(path) ? path : resolve(userCwd, path));

export const designFile = resolve(process.env.DESIGN_FILE ? fromUser(process.env.DESIGN_FILE) : resolve(repoRoot, "DESIGN.md"));
export const themesDir = resolve(process.env.THEMES_DIR ? fromUser(process.env.THEMES_DIR) : resolve(dirname(designFile), "themes"));
export const outDir = resolve(packageDir, "dist");

export const themeFile = (name: string) => (name === "default" ? designFile : resolve(themesDir, name, "DESIGN.md"));
