import { describe, expect, it } from "vitest";
import { DesignError, parseDesign, parseTheme } from "../src/parse.ts";
import { baseDesign, baseTree, cloneTree, theme } from "./fixtures.ts";

const parseTree = (tree: unknown) => parseDesign(JSON.stringify(tree));

describe("parseDesign", () => {
  it("accepts the shipped design-tokens.json", () => {
    expect(baseDesign.meta.name).toBe("Harbor");
    expect(baseDesign.typography.sans).toBe('"Public Sans Variable", ui-sans-serif, system-ui, sans-serif');
    expect(baseDesign.motion?.ease?.standard).toBe("cubic-bezier(0.2, 0, 0, 1)");
    expect(baseDesign.fontSizes?.sm).toEqual({ size: "0.875rem", lineHeight: "1.25rem" });
  });

  it("reports JSON syntax errors with line and column", () => {
    // The most common mistake: a missing comma between two tokens.
    expect(() => parseDesign('{\n  "a": 1\n  "b": 2\n}')).toThrowError(/line 3, column 3/);
  });

  it("names the broken token using the JSON path", () => {
    const tree = cloneTree() as any;
    tree.color.light.ring.$value = "bluish";
    expect(() => parseTree(tree)).toThrowError(/color\.light\.ring/);
  });

  it("requires the same colour names in light and dark", () => {
    const tree = cloneTree() as any;
    delete tree.color.dark["warning-foreground"];
    expect(() => parseTree(tree)).toThrowError(/warning-foreground/);
  });

  it("rejects unknown top-level groups and wrong $types", () => {
    const tree = cloneTree() as any;
    tree.colour = {};
    tree.radius.$type = "color";
    expect(() => parseTree(tree)).toThrowError(/unknown top-level group "colour"[\s\S]*radius: \$type must be "dimension"/);
  });

  it("resolves aliases", () => {
    const tree = cloneTree() as any;
    tree.color.light["sidebar-primary"].$value = "{color.light.primary}";
    expect(parseTree(tree).design.colors.light["sidebar-primary"]).toBe(baseDesign.colors.light.primary);
  });

  it("rejects circular and dangling aliases", () => {
    const tree = cloneTree() as any;
    tree.color.light.primary.$value = "{color.light.ring}";
    tree.color.light.ring.$value = "{color.light.primary}";
    expect(() => parseTree(tree)).toThrowError(/circular reference/);
    const dangling = cloneTree() as any;
    dangling.color.light.ring.$value = "{color.light.nope}";
    expect(() => parseTree(dangling)).toThrowError(/does not point to a token/);
  });

  it("accepts DTCG object values", () => {
    const tree = cloneTree() as any;
    tree.radius.$value = { value: 8, unit: "px" };
    tree.color.light.card.$value = { colorSpace: "srgb", components: [1, 1, 1] };
    tree.duration.fast.$value = { value: 100, unit: "ms" };
    const { design } = parseTree(tree);
    expect(design.radius).toBe("8px");
    expect(design.colors.light.card).toBe("oklch(1 0 0)");
    expect(design.motion?.duration?.fast).toBe("100ms");
  });
});

describe("parseTheme", () => {
  it("inherits everything it does not override", () => {
    const t = parseTheme(theme({ color: { light: { primary: { $value: "#ff0000" } } } }), baseTree, "acme").design;
    expect(t.colors.light.primary).toBe("#ff0000");
    expect(t.colors.dark.primary).toBe(baseDesign.colors.dark.primary);
    expect(t.radius).toBe(baseDesign.radius);
    expect(t.meta.name).toBe("Acme");
  });

  it("lets aliases in the default follow a theme's override", () => {
    const base = cloneTree() as any;
    base.color.light["sidebar-primary"].$value = "{color.light.primary}";
    const { tree } = parseDesign(JSON.stringify(base));
    const t = parseTheme(theme({ color: { light: { primary: { $value: "#ff0000" } } } }), tree, "acme").design;
    expect(t.colors.light["sidebar-primary"]).toBe("#ff0000");
  });

  it("rejects token names the default does not define", () => {
    expect(() =>
      parseTheme(theme({ color: { light: { "brand-pop": { $value: "#ff0000" } } } }), baseTree, "acme"),
    ).toThrowError(DesignError);
  });

  it("requires meta.name", () => {
    expect(() => parseTheme(JSON.stringify({ radius: { $value: "0rem" } }), baseTree, "acme")).toThrowError(/meta\.name/);
  });
});
