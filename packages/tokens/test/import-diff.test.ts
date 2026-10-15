import { describe, expect, it } from "vitest";
import { parseTokenColor, toOklchString } from "../src/color.ts";
import { diffTokens, tokenMap, versionBump } from "../src/commands/diff.ts";
import { flattenDtcg } from "../src/commands/import.ts";
import { formatJson } from "../src/dtcg.ts";
import { toCss } from "../src/values.ts";

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
    const translucent = parseTokenColor({ colorSpace: "srgb", components: [0, 0, 0], alpha: 0.1 });
    expect(translucent && toOklchString(translucent)).toBe("oklch(0 0 0 / 10%)");
  });
});

describe("values", () => {
  it("converts DTCG shadow objects and font arrays", () => {
    expect(
      toCss("shadow", { color: "#000000", offsetX: "0px", offsetY: { value: 1, unit: "px" }, blur: "2px", spread: "0px" }),
    ).toBe("0px 1px 2px 0px #000000");
    expect(toCss("fontFamily", ["Inter Variable", "system-ui", "sans-serif"])).toBe('"Inter Variable", system-ui, sans-serif');
    expect(toCss("cubicBezier", [0.2, 0, 0, 1])).toBe("cubic-bezier(0.2, 0, 0, 1)");
  });
});

describe("diff", () => {
  const base = tokenMap({ radius: { $value: "0.5rem" }, color: { light: { a: { $value: "1" }, b: { $value: "2" } } } });

  it("requires a patch for changed values", () => {
    const head = tokenMap({ radius: { $value: "0.6rem" }, color: { light: { a: { $value: "1" }, b: { $value: "2" } } } });
    expect(diffTokens(base, head).required).toBe("patch");
  });

  it("requires a minor for added tokens and a major for removed ones", () => {
    const added = tokenMap({ radius: { $value: "0.5rem" }, color: { light: { a: { $value: "1" }, b: { $value: "2" }, c: { $value: "3" } } } });
    const removed = tokenMap({ radius: { $value: "0.5rem" }, color: { light: { a: { $value: "1" } } } });
    expect(diffTokens(base, added).required).toBe("minor");
    expect(diffTokens(base, removed).required).toBe("major");
  });

  it("ignores $description-only edits", () => {
    const described = tokenMap({ radius: { $value: "0.5rem", $description: "new" }, color: { light: { a: { $value: "1" }, b: { $value: "2" } } } });
    expect(diffTokens(base, described).required).toBe("none");
  });

  it("measures the actual version bump", () => {
    expect(versionBump("1.2.3", "1.2.4")).toBe("patch");
    expect(versionBump("1.2.3", "1.3.0")).toBe("minor");
    expect(versionBump("1.2.3", "2.0.0")).toBe("major");
    expect(versionBump("1.2.3", "1.2.3")).toBe("none");
  });
});

describe("formatJson", () => {
  it("keeps short arrays on one line", () => {
    expect(formatJson({ a: [0.2, 0, 0, 1] })).toBe('{\n  "a": [0.2, 0, 0, 1]\n}\n');
  });
});
