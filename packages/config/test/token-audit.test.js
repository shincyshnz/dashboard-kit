import { RuleTester } from "eslint";
import { afterAll, describe, it } from "vitest";

import { plugin } from "../eslint/token-audit.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2023, sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } } },
});

const code = (cls) => `const c = "${cls}";`;
const error = (messageId) => ({ errors: [{ messageId }] });

ruleTester.run("no-raw-design-values", plugin.rules["no-raw-design-values"], {
  valid: [
    // Token classes, including opacity modifiers and variants
    code("bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-input/30"),
    code("border-input ring-ring/50 focus-visible:ring-destructive/30 bg-success"),
    code("rounded-md rounded-xl shadow-sm shadow-xs font-heading font-mono font-semibold"),
    // Layout and arbitrary values that are not design tokens
    code("ring-[3px] grid-rows-[auto_auto] has-[>svg]:px-3 [&_svg:not([class*='size-'])]:size-4"),
    code("transition-[color,box-shadow] has-data-[slot=card-action]:grid-cols-[1fr_auto]"),
    code("bg-(--chart-1) bg-[var(--sidebar)] font-[500] border-transparent text-current"),
    // Non-class strings that merely contain palette words
    code("The red-500 hex #fff appears in prose"),
    `<div className="text-muted-foreground">gray-500 text</div>`,
  ],
  invalid: [
    { code: code("bg-blue-600"), ...error("palette") },
    { code: code("hover:text-gray-500"), ...error("palette") },
    { code: code("border-zinc-200/50"), ...error("palette") },
    { code: code("!bg-red-500"), ...error("palette") },
    { code: code("text-white"), ...error("palette") },
    { code: code("bg-black/50"), ...error("palette") },
    { code: code("bg-[#fff]"), ...error("colour") },
    { code: code("text-[oklch(0.5_0.1_200)]"), ...error("colour") },
    { code: code("border-[color:var(--x)]"), ...error("colour") },
    { code: code("[color:rgb(0,0,0)]"), ...error("colour") },
    { code: code("rounded-[7px]"), ...error("radius") },
    { code: code("rounded-tl-[4px]"), ...error("radius") },
    { code: code("[border-radius:6px]"), ...error("radius") },
    { code: code("shadow-[0_2px_4px_#0003]"), ...error("shadow") },
    { code: code("font-[Inter]"), ...error("font") },
    { code: "const c = `flex ${x} bg-sky-100`;", ...error("palette") },
    {
      code: `<div className="bg-card bg-slate-50 rounded-[3px]" />`,
      errors: [{ messageId: "palette" }, { messageId: "radius" }],
    },
  ],
});
