import { describe, expect, it } from "vitest";
import { compileAllCss, compileBaseCss, selectorsFor, themeInlineVars } from "../src/compile.ts";
import { parseTheme } from "../src/parse.ts";
import { baseDesign, baseTree, theme } from "./fixtures.ts";

describe("compile", () => {
  it("scopes the default theme to :root and .dark", () => {
    const css = compileBaseCss({ name: "default", design: baseDesign });
    expect(css).toMatch(/^:root \{/m);
    expect(css).toMatch(/^\.dark \{/m);
    expect(css).toContain("@theme inline {");
    expect(css).toContain("--color-primary: var(--primary);");
  });

  it("scopes tenant themes by data-theme", () => {
    expect(selectorsFor("acme")).toEqual({
      light: ':root[data-theme="acme"]',
      dark: ':root[data-theme="acme"].dark',
    });
    const acme = parseTheme(theme({ radius: { $value: "0rem" } }), baseTree, "acme").design;
    const css = compileAllCss([
      { name: "default", design: baseDesign },
      { name: "acme", design: acme },
    ]);
    expect(css).toContain(':root[data-theme="acme"] {');
    expect(css).toContain("--radius: 0rem;");
    expect(css.match(/@theme inline/g)).toHaveLength(1);
  });

  it("routes fonts, spacing, shadows, text sizes and easing through runtime variables", () => {
    const vars = themeInlineVars(baseDesign);
    expect(vars["font-sans"]).toBe("var(--dk-font-sans)");
    expect(vars["spacing"]).toBe("var(--dk-spacing)");
    expect(vars["shadow-sm"]).toBe("var(--dk-shadow-sm)");
    expect(vars["text-sm--line-height"]).toBe("var(--dk-text-sm-lh)");
    expect(vars["ease-standard"]).toBe("var(--dk-ease-standard)");
  });
});
