import { describe, expect, it } from "vitest";
import { parseTokenColor, toOklchString } from "../src/color.ts";
import { diffTokens, flattenYaml, versionBump } from "../src/commands/diff.ts";
import { flattenDtcg } from "../src/commands/import.ts";

describe("figma import", () => {
  it("flattens DTCG groups into shadcn names", () => {
    const tokens = flattenDtcg({
      color: {
        $type: "color",
        primary: { $value: "#1f5f7a" },
        sidebar: { primaryForeground: { $value: "#ffffff" } },
      },
      radius: { $type: "dimension", $value: { value: 8, unit: "px" } },
    });
    expect(tokens.map((t) => t.name)).toEqual(["primary", "sidebar-primary-foreground", "radius"]);
    expect(tokens[0]?.type).toBe("color");
  });

  it("converts DTCG colour objects and hex to oklch", () => {
    const fromObject = parseTokenColor({ colorSpace: "srgb", components: [1, 1, 1] });
    expect(fromObject && toOklchString(fromObject)).toBe("oklch(1 0 0)");
    const fromHex = parseTokenColor("#000000");
    expect(fromHex && toOklchString(fromHex)).toBe("oklch(0 0 0)");
    const translucent = parseTokenColor({ colorSpace: "srgb", components: [0, 0, 0], alpha: 0.1 });
    expect(translucent && toOklchString(translucent)).toBe("oklch(0 0 0 / 10%)");
  });
});

describe("diff", () => {
  const base = flattenYaml({ meta: { version: "1.0.0" }, radius: "0.5rem", colors: { light: { a: "1", b: "2" } } });

  it("requires a patch for changed values", () => {
    const head = flattenYaml({ meta: { version: "1.0.1" }, radius: "0.6rem", colors: { light: { a: "1", b: "2" } } });
    expect(diffTokens(base, head).required).toBe("patch");
  });

  it("requires a minor for added tokens and a major for removed ones", () => {
    expect(diffTokens(base, flattenYaml({ radius: "0.5rem", colors: { light: { a: "1", b: "2", c: "3" } } })).required).toBe("minor");
    expect(diffTokens(base, flattenYaml({ radius: "0.5rem", colors: { light: { a: "1" } } })).required).toBe("major");
  });

  it("measures the actual version bump", () => {
    expect(versionBump("1.2.3", "1.2.4")).toBe("patch");
    expect(versionBump("1.2.3", "1.3.0")).toBe("minor");
    expect(versionBump("1.2.3", "2.0.0")).toBe("major");
    expect(versionBump("1.2.3", "1.2.3")).toBe("none");
  });
});
