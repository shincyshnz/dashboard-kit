/** JSON Schema for design-tokens.json files — gives editors autocomplete and inline errors. */
import { FONT_SIZE_KEYS, REQUIRED_COLORS, SHADOW_KEYS } from "./schema.ts";

const tokenOf = (description: string) => ({
  type: "object",
  description,
  required: ["$value"],
  properties: {
    $value: {},
    $type: { type: "string" },
    $description: { type: "string" },
    $extensions: { type: "object" },
  },
  additionalProperties: false,
});

const colorValue = {
  description: "CSS colour (oklch() preferred, also hex/rgb/hsl), a DTCG colour object, or a {alias}.",
  anyOf: [
    { type: "string" },
    { type: "object", properties: { colorSpace: { type: "string" }, components: { type: "array" }, alpha: { type: "number" }, hex: { type: "string" } } },
  ],
};

const groupProps = { $type: { type: "string" }, $description: { type: "string" }, $extensions: { type: "object" } };

export function buildJsonSchema(partial: boolean) {
  const colorToken = { ...tokenOf("Colour token"), properties: { ...tokenOf("").properties, $value: colorValue } };
  const palette = {
    type: "object",
    properties: { ...groupProps, ...Object.fromEntries(REQUIRED_COLORS.map((n) => [n, colorToken])) },
    additionalProperties: colorToken,
    ...(partial ? {} : { required: [...REQUIRED_COLORS] }),
  };
  const groupOf = (keys: readonly string[] | null, description: string) => ({
    type: "object",
    description,
    properties: { ...groupProps, ...(keys ? Object.fromEntries(keys.map((k) => [k, tokenOf(description)])) : {}) },
    additionalProperties: keys ? false : tokenOf(description),
  });

  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: partial ? "Dashboard Kit tenant theme (overrides only)" : "Dashboard Kit design tokens",
    description: "DTCG-format design tokens. See docs/DESIGN-TOKENS.md.",
    type: "object",
    required: partial ? ["$extensions"] : ["$extensions", "color", "radius", "font"],
    properties: {
      $schema: { type: "string" },
      $description: { type: "string", description: "One sentence describing the theme." },
      $extensions: {
        type: "object",
        required: ["dev.dashboard-kit"],
        properties: {
          "dev.dashboard-kit": {
            type: "object",
            required: ["meta"],
            properties: {
              meta: {
                type: "object",
                required: partial ? ["name"] : ["name", "version"],
                properties: { name: { type: "string" }, version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+$" } },
                additionalProperties: false,
              },
              checks: {
                type: "object",
                properties: {
                  contrast: {
                    type: "object",
                    properties: {
                      minimum: { type: "number", minimum: 1, maximum: 21 },
                      mode: { enum: ["error", "warn", "off"] },
                      pairs: { type: "array", items: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 2 } },
                    },
                    additionalProperties: false,
                  },
                },
              },
            },
          },
        },
      },
      color: {
        type: "object",
        properties: { ...groupProps, light: palette, dark: palette },
        additionalProperties: false,
        ...(partial ? {} : { required: ["light", "dark"] }),
      },
      radius: tokenOf("Base corner radius (dimension)."),
      spacing: tokenOf("Spacing unit (dimension). Every spacing utility is a multiple of it."),
      font: groupOf(["sans", "heading", "mono"], "Font family (string or array of family names)."),
      fontSize: groupOf(FONT_SIZE_KEYS, "Font size (dimension)."),
      lineHeight: groupOf(FONT_SIZE_KEYS, "Line height for the fontSize of the same name (dimension)."),
      shadow: groupOf(SHADOW_KEYS, "Box shadow (CSS string or DTCG shadow object)."),
      duration: groupOf(null, "Duration such as 120ms."),
      easing: groupOf(null, "Cubic bézier as [x1, y1, x2, y2]."),
    },
    additionalProperties: false,
  };
}
