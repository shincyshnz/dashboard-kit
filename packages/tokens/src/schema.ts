import { z } from "zod";

/** Colour names every shadcn/ui component expects. Extra names are allowed. */
export const REQUIRED_COLORS = [
  "background", "foreground",
  "card", "card-foreground",
  "popover", "popover-foreground",
  "primary", "primary-foreground",
  "secondary", "secondary-foreground",
  "muted", "muted-foreground",
  "accent", "accent-foreground",
  "destructive",
  "border", "input", "ring",
  "chart-1", "chart-2", "chart-3", "chart-4", "chart-5",
  "sidebar", "sidebar-foreground",
  "sidebar-primary", "sidebar-primary-foreground",
  "sidebar-accent", "sidebar-accent-foreground",
  "sidebar-border", "sidebar-ring",
] as const;

export const FONT_SIZE_KEYS = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"] as const;
export const SHADOW_KEYS = ["xs", "sm", "md", "lg", "xl"] as const;

const COLOR_PATTERN =
  /^(#[0-9a-f]{3,8}|(oklch|oklab|hsl|hsla|rgb|rgba|lab|lch|color)\(.+\)|var\(--[\w-]+\))$/i;

const kebab = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "names must be kebab-case (e.g. card-foreground)");

const colorValue = z
  .string()
  .trim()
  .regex(COLOR_PATTERN, "must be oklch(), hsl(), rgb(), hex or var(--token)");

const colorMap = z.record(kebab, colorValue).superRefine((map, ctx) => {
  for (const name of REQUIRED_COLORS) {
    if (!(name in map)) ctx.addIssue({ code: "custom", message: `missing required colour "${name}"` });
  }
});

const cssLength = z
  .string()
  .trim()
  .regex(/^\d*\.?\d+(rem|px|em)$/, "must be a CSS length such as 0.625rem or 8px");

const cssTime = z
  .string()
  .trim()
  .regex(/^\d*\.?\d+(ms|s)$/, "must be a CSS time such as 150ms or 0.2s");

const fontSize = z.union([
  cssLength,
  z.object({ size: cssLength, lineHeight: z.union([cssLength, z.string().regex(/^\d*\.?\d+$/)]) }),
]);

export const designSchema = z
  .object({
    meta: z.object({
      name: z.string().min(1),
      version: z.string().regex(/^\d+\.\d+\.\d+$/, "must be semver, e.g. 1.0.0"),
      description: z.string().optional(),
    }),
    radius: cssLength,
    typography: z.object({
      sans: z.string().min(1),
      heading: z.string().min(1),
      mono: z.string().min(1),
    }),
    fontSizes: z.partialRecord(z.enum(FONT_SIZE_KEYS), fontSize).optional(),
    density: z.object({ spacing: cssLength }).optional(),
    shadows: z.partialRecord(z.enum(SHADOW_KEYS), z.string().min(1)).optional(),
    motion: z
      .object({
        duration: z.record(kebab, cssTime).optional(),
        ease: z.record(kebab, z.string().min(1)).optional(),
      })
      .optional(),
    checks: z
      .object({
        contrast: z
          .object({
            minimum: z.number().min(1).max(21).default(4.5),
            mode: z.enum(["error", "warn", "off"]).default("error"),
            pairs: z.array(z.tuple([kebab, kebab])).default([]),
          })
          .optional(),
      })
      .optional(),
    colors: z.object({ light: colorMap, dark: colorMap }),
  })
  .superRefine((design, ctx) => {
    const dark = new Set(Object.keys(design.colors.dark));
    for (const name of Object.keys(design.colors.light)) {
      if (!dark.delete(name)) {
        ctx.addIssue({ code: "custom", path: ["colors", "dark"], message: `"${name}" is in light but missing from dark` });
      }
    }
    for (const name of dark) {
      ctx.addIssue({ code: "custom", path: ["colors", "light"], message: `"${name}" is in dark but missing from light` });
    }
  });

export type Design = z.infer<typeof designSchema>;

/** A tenant theme: only `meta.name` is required; everything else overrides the default. */
export const themeOverrideSchema = z
  .object({ meta: z.object({ name: z.string().min(1) }).loose() })
  .loose();
