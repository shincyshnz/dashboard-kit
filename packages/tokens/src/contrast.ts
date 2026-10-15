import { parse, wcagContrast } from "culori";
import type { Design } from "./schema.ts";

export interface ContrastResult {
  mode: "light" | "dark";
  background: string;
  foreground: string;
  ratio: number | null;
  ok: boolean;
  note?: string;
}

/** Pairs checked in addition to every `X` / `X-foreground` pair. */
const BUILT_IN_PAIRS: [string, string][] = [
  ["background", "foreground"],
  ["background", "muted-foreground"],
  ["card", "muted-foreground"],
];

function resolve(palette: Record<string, string>, value: string, depth = 0): string {
  const ref = /^var\(--([\w-]+)\)$/.exec(value);
  if (!ref || depth > 5) return value;
  const target = palette[ref[1] ?? ""];
  return target ? resolve(palette, target, depth + 1) : value;
}

export function collectPairs(design: Design): [string, string][] {
  const names = Object.keys(design.colors.light);
  const pairs = new Map<string, [string, string]>();
  const add = (bg: string, fg: string) => {
    if (names.includes(bg) && names.includes(fg)) pairs.set(`${bg}|${fg}`, [bg, fg]);
  };
  for (const name of names) add(name, `${name}-foreground`);
  for (const [bg, fg] of BUILT_IN_PAIRS) add(bg, fg);
  for (const [bg, fg] of design.checks?.contrast?.pairs ?? []) add(bg, fg);
  return [...pairs.values()];
}

/** WCAG 2.x contrast for every text/surface pair, in light and dark. */
export function checkContrast(design: Design): ContrastResult[] {
  const minimum = design.checks?.contrast?.minimum ?? 4.5;
  const results: ContrastResult[] = [];

  for (const mode of ["light", "dark"] as const) {
    const palette = design.colors[mode];
    for (const [bgName, fgName] of collectPairs(design)) {
      const bg = parse(resolve(palette, palette[bgName] ?? ""));
      const fg = parse(resolve(palette, palette[fgName] ?? ""));
      const base = { mode, background: bgName, foreground: fgName };

      if (!bg || !fg) {
        results.push({ ...base, ratio: null, ok: true, note: "skipped: colour could not be parsed" });
      } else if ((bg.alpha ?? 1) < 1 || (fg.alpha ?? 1) < 1) {
        results.push({ ...base, ratio: null, ok: true, note: "skipped: translucent colour" });
      } else {
        const ratio = Math.round(wcagContrast(bg, fg) * 100) / 100;
        results.push({ ...base, ratio, ok: ratio >= minimum });
      }
    }
  }
  return results;
}

export function formatFailures(label: string, design: Design, results: ContrastResult[]): string {
  const minimum = design.checks?.contrast?.minimum ?? 4.5;
  const failures = results.filter((r) => !r.ok);
  return `${label}: ${failures.length} colour pair(s) below ${minimum}:1 contrast\n${failures
    .map((f) => `  • ${f.mode}: ${f.foreground} on ${f.background} = ${f.ratio}:1`)
    .join("\n")}`;
}
