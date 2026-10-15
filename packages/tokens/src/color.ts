import { oklch, parse, type Color } from "culori";

const round = (n: number | undefined, digits: number) => {
  const f = 10 ** digits;
  return Math.round((n ?? 0) * f) / f;
};

/** Formats any culori colour as a compact oklch() string, the format shadcn uses. */
export function toOklchString(color: Color): string {
  const c = oklch(color);
  const l = round(c.l, 3);
  const chroma = round(c.c, 3);
  const h = chroma === 0 ? 0 : round(c.h, 1);
  const alpha = c.alpha ?? 1;
  return alpha < 1 ? `oklch(${l} ${chroma} ${h} / ${round(alpha * 100, 1)}%)` : `oklch(${l} ${chroma} ${h})`;
}

interface DtcgColor {
  colorSpace?: string;
  components?: (number | "none")[];
  alpha?: number;
  hex?: string;
}

/** Accepts a CSS colour string or a DTCG colour object (Figma / Tokens Studio exports). */
export function parseTokenColor(value: unknown): Color | undefined {
  if (typeof value === "string") return parse(value);
  if (typeof value !== "object" || value === null) return undefined;

  const { colorSpace, components, alpha, hex } = value as DtcgColor;
  const [a, b, c] = (components ?? []).map((n) => (n === "none" ? 0 : n));
  const withAlpha = <T extends Color>(color: T): T => (alpha !== undefined && alpha < 1 ? { ...color, alpha } : color);

  switch (colorSpace) {
    case "srgb":
      return withAlpha({ mode: "rgb", r: a ?? 0, g: b ?? 0, b: c ?? 0 });
    case "display-p3":
      return withAlpha({ mode: "p3", r: a ?? 0, g: b ?? 0, b: c ?? 0 });
    case "oklch":
      return withAlpha({ mode: "oklch", l: a ?? 0, c: b ?? 0, h: c ?? 0 });
    case "hsl":
      return withAlpha({ mode: "hsl", h: a ?? 0, s: (b ?? 0) / 100, l: (c ?? 0) / 100 });
    default: {
      const parsed = hex ? parse(hex) : undefined;
      return parsed ? withAlpha(parsed) : undefined;
    }
  }
}
