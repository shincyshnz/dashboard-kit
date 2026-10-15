import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { injectTokenDocs, renderTokenDocs, START, END } from "../src/docs.ts";
import { formatJson } from "../src/dtcg.ts";
import { buildJsonSchema } from "../src/json-schema.ts";
import { baseDesign, baseTree } from "./fixtures.ts";

describe("generated docs", () => {
  const block = renderTokenDocs([{ name: "default", design: baseDesign, tree: baseTree, file: "" }]);

  it("lists every colour with light, dark and description", () => {
    expect(block).toContain("| `primary` | `oklch(0.45 0.09 225)` | `oklch(0.72 0.1 220)` | Main brand");
    expect(block.startsWith(START)).toBe(true);
    expect(block.endsWith(END)).toBe(true);
  });

  it("replaces only the marked block", () => {
    const doc = `# Title\n\n${START}\nold\n${END}\n\n## After\n`;
    const next = injectTokenDocs(doc, block);
    expect(next).toContain("# Title");
    expect(next).toContain("## After");
    expect(next).not.toContain("\nold\n");
    expect(injectTokenDocs("no markers", block)).toBeNull();
  });
});

describe("JSON schemas", () => {
  it("committed schema files match the generator", () => {
    for (const [file, partial] of [["design-tokens.schema.json", false], ["theme-tokens.schema.json", true]] as const) {
      const committed = readFileSync(resolve(import.meta.dirname, "../schema", file), "utf8");
      expect(committed).toBe(formatJson(buildJsonSchema(partial)));
    }
  });
});
