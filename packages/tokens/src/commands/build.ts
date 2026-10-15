import { watch } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { compileAllCss, compileBaseCss, compileJson, compileThemeBlocks } from "../compile.ts";
import { checkContrast, formatFailures } from "../contrast.ts";
import { loadThemes } from "../load.ts";
import { DesignError } from "../parse.ts";
import { designFile, outDir, themesDir } from "../paths.ts";

async function buildOnce(): Promise<boolean> {
  const started = performance.now();
  try {
    const themes = await loadThemes();

    // Contrast is checked on every theme, light and dark.
    let blocked = false;
    for (const { name, design } of themes) {
      const mode = design.checks?.contrast?.mode ?? "error";
      if (mode === "off") continue;
      const results = checkContrast(design);
      if (results.some((r) => !r.ok)) {
        const message = formatFailures(`theme "${name}"`, design, results);
        if (mode === "error") {
          console.error(`✖ tokens: ${message}`);
          blocked = true;
        } else {
          console.warn(`⚠ tokens: ${message}`);
        }
      }
    }
    if (blocked) {
      console.error("  Fix the colours, or set checks.contrast.mode: warn in DESIGN.md while iterating.");
      return false;
    }

    await rm(resolve(outDir, "themes"), { recursive: true, force: true });
    await mkdir(resolve(outDir, "themes"), { recursive: true });
    const [defaultTheme] = themes;
    if (!defaultTheme) throw new DesignError("No default theme found.");

    await Promise.all([
      writeFile(resolve(outDir, "theme.css"), compileAllCss(themes)),
      writeFile(resolve(outDir, "base.css"), compileBaseCss(defaultTheme)),
      writeFile(resolve(outDir, "tokens.json"), compileJson(themes)),
      ...themes
        .filter((t) => t.name !== "default")
        .map((t) => writeFile(resolve(outDir, "themes", `${t.name}.css`), compileThemeBlocks(t) + "\n")),
    ]);

    const ms = Math.round(performance.now() - started);
    const names = themes.map((t) => `${t.design.meta.name} (${t.name})`).join(", ");
    console.log(`✔ tokens: ${themes.length} theme(s) → dist/theme.css in ${ms}ms — ${names}`);
    return true;
  } catch (error) {
    const message = error instanceof DesignError ? error.message : String(error);
    console.error(`✖ tokens: ${message}`);
    return false;
  }
}

export async function build(options: { watch: boolean }) {
  const ok = await buildOnce();
  if (!options.watch) {
    if (!ok) process.exit(1);
    return;
  }

  let timer: NodeJS.Timeout | undefined;
  const rebuild = (file: string | null) => {
    if (file && !file.endsWith(".md")) return;
    clearTimeout(timer);
    timer = setTimeout(() => void buildOnce(), 50);
  };

  // Watch folders, not files: editors often replace files instead of writing in place.
  watch(dirname(designFile), (_event, file) => {
    if (file === "DESIGN.md") rebuild(file);
  });
  try {
    await mkdir(themesDir, { recursive: true });
    watch(themesDir, { recursive: true }, (_event, file) => rebuild(file));
  } catch {
    console.warn(`⚠ tokens: could not watch ${themesDir}`);
  }
  console.log(`… watching ${designFile} and ${themesDir}`);
}
