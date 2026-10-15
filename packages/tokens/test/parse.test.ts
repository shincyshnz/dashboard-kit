import { describe, expect, it } from "vitest";
import { DesignError, parseDesign, parseTheme } from "../src/parse.ts";
import { baseDesign, rootDesignText, theme } from "./fixtures.ts";

describe("parseDesign", () => {
  it("accepts the shipped DESIGN.md", () => {
    expect(baseDesign.meta.name).toBe("Harbor");
  });

  it("names the broken token", () => {
    const broken = rootDesignText.replace(/^    ring: .*$/m, "    ring: bluish");
    expect(() => parseDesign(broken)).toThrowError(/colors\.light\.ring/);
  });

  it("requires the same colour names in light and dark", () => {
    const broken = rootDesignText.replace(/^    warning-foreground: .*$/m, "");
    expect(() => parseDesign(broken)).toThrowError(/warning-foreground/);
  });
});

describe("parseTheme", () => {
  it("inherits everything it does not override", () => {
    const t = parseTheme(theme("meta: { name: Acme }\ncolors: { light: { primary: '#ff0000' } }"), baseDesign, "acme");
    expect(t.colors.light.primary).toBe("#ff0000");
    expect(t.colors.dark.primary).toBe(baseDesign.colors.dark.primary);
    expect(t.radius).toBe(baseDesign.radius);
    expect(t.meta.version).toBe(baseDesign.meta.version);
  });

  it("rejects token names the default does not define", () => {
    expect(() =>
      parseTheme(theme("meta: { name: Acme }\ncolors: { light: { brand-pop: '#ff0000' } }"), baseDesign, "acme"),
    ).toThrowError(DesignError);
  });

  it("requires meta.name", () => {
    expect(() => parseTheme(theme("radius: 0rem"), baseDesign, "acme")).toThrowError(/meta\.name/);
  });
});
