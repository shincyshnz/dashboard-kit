import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Tree } from "../src/dtcg.ts";
import { parseDesign } from "../src/parse.ts";

export const rootTokensText = readFileSync(resolve(import.meta.dirname, "../../../design-tokens.json"), "utf8");
export const { design: baseDesign, tree: baseTree } = parseDesign(rootTokensText);

/** A fresh, mutable copy of the root token tree. */
export const cloneTree = (): Tree => JSON.parse(rootTokensText) as Tree;

/** A tenant theme file body. */
export const theme = (body: Record<string, unknown>, name = "Acme") =>
  JSON.stringify({ $extensions: { "dev.dashboard-kit": { meta: { name } } }, ...body });
