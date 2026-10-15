import { mkdir, readFile, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { formatJson } from "../dtcg.ts";
import { DesignError } from "../errors.ts";
import { buildJsonSchema } from "../json-schema.ts";
import { repoRoot, schemaDir } from "../paths.ts";

const FILES = [
  { file: "design-tokens.schema.json", partial: false },
  { file: "theme-tokens.schema.json", partial: true },
];

/** `tokens schema` writes the JSON Schemas editors use; `--check` fails if they are stale. */
export async function schema(argv: string[]) {
  const check = argv.includes("--check");
  await mkdir(schemaDir, { recursive: true });
  const stale: string[] = [];
  for (const { file, partial } of FILES) {
    const path = resolve(schemaDir, file);
    const next = formatJson(buildJsonSchema(partial));
    const current = await readFile(path, "utf8").catch(() => "");
    if (current === next) continue;
    if (check) stale.push(relative(repoRoot, path));
    else await writeFile(path, next);
  }
  if (stale.length) throw new DesignError(`Out-of-date schema(s): ${stale.join(", ")}. Run: pnpm tokens:schema`);
  console.log(`✔ tokens: JSON schemas ${check ? "are up to date" : "written"}`);
}
