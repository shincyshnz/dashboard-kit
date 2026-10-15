import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseDesign } from "../src/parse.ts";

export const rootDesignText = readFileSync(resolve(import.meta.dirname, "../../../DESIGN.md"), "utf8");
export const baseDesign = parseDesign(rootDesignText);

export const theme = (yaml: string) => `---\n${yaml.trim()}\n---\n\nBody text.\n`;
