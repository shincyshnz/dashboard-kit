import { describe, expect, it } from "vitest";
import { checkContrast, collectPairs } from "../src/contrast.ts";
import { deepMerge } from "../src/parse.ts";
import { baseDesign } from "./fixtures.ts";

describe("contrast", () => {
  it("passes for the shipped theme", () => {
    expect(checkContrast(baseDesign).filter((r) => !r.ok)).toEqual([]);
  });

  it("checks X / X-foreground pairs and text on surfaces", () => {
    const pairs = collectPairs(baseDesign).map((p) => p.join("|"));
    expect(pairs).toContain("primary|primary-foreground");
    expect(pairs).toContain("background|foreground");
    expect(pairs).toContain("card|muted-foreground");
  });

  it("fails a low-contrast pair", () => {
    const low = deepMerge(baseDesign, { colors: { light: { "primary-foreground": "oklch(0.5 0.09 225)" } } });
    const failures = checkContrast(low).filter((r) => !r.ok);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatchObject({ mode: "light", background: "primary", foreground: "primary-foreground" });
  });

  it("skips translucent colours instead of guessing", () => {
    const glass = deepMerge(baseDesign, { colors: { light: { card: "oklch(1 0 0 / 50%)" } } });
    const card = checkContrast(glass).find((r) => r.mode === "light" && r.background === "card");
    expect(card?.note).toMatch(/translucent/);
  });
});
