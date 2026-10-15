import { readFile, writeFile } from "node:fs/promises";
import { relative } from "node:path";
import { injectTokenDocs, renderTokenDocs, START, END } from "../docs.ts";
import { DesignError } from "../errors.ts";
import { loadThemes } from "../load.ts";
import { designDoc, repoRoot } from "../paths.ts";

/** `tokens docs` regenerates DESIGN.md's token tables; `--check` fails if they are stale (CI). */
export async function docs(argv: string[]) {
  const check = argv.includes("--check");
  const label = relative(repoRoot, designDoc);
  const current = await readFile(designDoc, "utf8").catch(() => {
    throw new DesignError(`${label} not found.`);
  });
  const next = injectTokenDocs(current, renderTokenDocs(await loadThemes()));
  if (next === null) {
    throw new DesignError(`${label} is missing the generated block markers:\n  ${START}\n  ${END}`);
  }
  if (next === current) {
    console.log(`✔ tokens: ${label} token tables are up to date`);
  } else if (check) {
    throw new DesignError(`${label} token tables are out of date. Run: pnpm tokens:docs`);
  } else {
    await writeFile(designDoc, next);
    console.log(`✔ tokens: updated token tables in ${label}`);
  }
}
