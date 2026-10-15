/** Converts DTCG token values (CSS strings or DTCG object forms) into CSS text. */
import { parseTokenColor, toOklchString } from "./color.ts";
import { isPlainObject } from "./errors.ts";

type Converter = (value: unknown) => string | undefined;

const unitValue = (value: unknown, units: RegExp): string | undefined => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (isPlainObject(value) && typeof value.value === "number" && typeof value.unit === "string" && units.test(value.unit)) {
    return `${value.value}${value.unit}`;
  }
  return undefined;
};

const color: Converter = (value) => {
  if (typeof value === "string") return value.trim();
  const parsed = parseTokenColor(value);
  return parsed ? toOklchString(parsed) : undefined;
};

const dimension: Converter = (value) => unitValue(value, /^(px|rem|em)$/);
const duration: Converter = (value) => unitValue(value, /^(ms|s)$/);

const fontFamily: Converter = (value) => {
  const list = Array.isArray(value) ? value : typeof value === "string" ? [value] : null;
  if (!list?.every((f) => typeof f === "string")) return undefined;
  const generic = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-[a-z-]+|emoji|math|fangsong)$/;
  return list.map((f) => (generic.test(f) || /^["']/.test(f) || !/[\s\d]/.test(f) ? f : `"${f}"`)).join(", ");
};

const cubicBezier: Converter = (value) => {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value) && value.length === 4 && value.every((n) => typeof n === "number")) {
    return `cubic-bezier(${value.join(", ")})`;
  }
  return undefined;
};

const shadowLayer = (layer: unknown): string | undefined => {
  if (!isPlainObject(layer)) return undefined;
  const parts = [layer.offsetX, layer.offsetY, layer.blur, layer.spread].map((p) => dimension(p ?? "0px"));
  const c = color(layer.color);
  if (parts.some((p) => p === undefined) || !c) return undefined;
  return `${layer.inset === true ? "inset " : ""}${parts.join(" ")} ${c}`;
};

const shadow: Converter = (value) => {
  if (typeof value === "string") return value.trim();
  const layers = (Array.isArray(value) ? value : [value]).map(shadowLayer);
  return layers.every((l) => l !== undefined) ? layers.join(", ") : undefined;
};

export const converters: Record<string, Converter> = { color, dimension, duration, fontFamily, cubicBezier, shadow };

export function toCss(type: string | undefined, value: unknown): string | undefined {
  const convert = type ? converters[type] : undefined;
  return convert ? convert(value) : typeof value === "string" ? value : undefined;
}
