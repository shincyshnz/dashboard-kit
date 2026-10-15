import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const repoRoot = resolve(packageDir, "../..");

/** Where the user ran the command (pnpm runs scripts inside the package folder). */
export const userCwd = process.env.INIT_CWD ?? process.cwd();

export const fromUser = (path: string) => (isAbsolute(path) ? path : resolve(userCwd, path));

export const TOKENS_FILENAME = "design-tokens.json";

export const tokensFile = resolve(
  process.env.TOKENS_FILE ? fromUser(process.env.TOKENS_FILE) : resolve(repoRoot, TOKENS_FILENAME),
);
export const themesDir = resolve(
  process.env.THEMES_DIR ? fromUser(process.env.THEMES_DIR) : resolve(dirname(tokensFile), "themes"),
);
/** The human/agent guide whose token tables are generated. */
export const designDoc = resolve(process.env.DESIGN_DOC ? fromUser(process.env.DESIGN_DOC) : resolve(dirname(tokensFile), "DESIGN.md"));
export const outDir = resolve(packageDir, "dist");
export const schemaDir = resolve(packageDir, "schema");

export const themeFile = (name: string) => (name === "default" ? tokensFile : resolve(themesDir, name, TOKENS_FILENAME));
