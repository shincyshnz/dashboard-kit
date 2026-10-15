import { watch } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { compileAllCss, compileBaseCss, compileJson, compileThemeBlocks } from "../compile.ts";
import { checkContrast, formatFailures } from "../contrast.ts";
import { injectTokenDocs, renderTokenDocs } from "../docs.ts";
import { DesignError } from "../errors.ts";
import { loadThemes, type LoadedTheme } from "../load.ts";
import { designDoc, outDir, repoRoot, themesDir, TOKENS_FILENAME, tokensFile } from "../paths.ts";

function contrastBlocks(themes: LoadedTheme[]): boolean {
  let blocked = false;
  for (const { name, design } of themes) {
    const mode = design.checks?.contrast?.mode ?? "error";
    if (mode === "off") continue;
    const results = checkContrast(design);
    if (!results.some((r) => !r.ok)) continue;
    const message = formatFailures(`theme "${name}"`, design, results);
    if (mode === "error") {
      console.error(`✖ tokens: ${message}`);
      blocked = true;
    } else {
      console.warn(`⚠ tokens: ${message}`);
    }
  }
  if (blocked) console.error('  Fix the colours, or set checks.contrast.mode to "warn" while iterating.');
  return blocked;
}

async function writeOutputs(themes: LoadedTheme[]) {
  const [defaultTheme] = themes;
  if (!defaultTheme) throw new DesignError("No default theme found.");
  await rm(resolve(outDir, "themes"), { recursive: true, force: true });
  await mkdir(resolve(outDir, "themes"), { recursive: true });
  await Promise.all([
    writeFile(resolve(outDir, "theme.css"), compileAllCss(themes)),
    writeFile(resolve(outDir, "base.css"), compileBaseCss(defaultTheme)),
    writeFile(resolve(outDir, "tokens.json"), compileJson(themes)),
    ...themes
      .filter((t) => t.name !== "default")
      .map((t) => writeFile(resolve(outDir, "themes", `${t.name}.css`), compileThemeBlocks(t) + "\n")),
  ]);
}

/** Keeps DESIGN.md's generated tables current while developing. */
async function refreshDocs(themes: LoadedTheme[]) {
  try {
    const current = await readFile(designDoc, "utf8");
    const next = injectTokenDocs(current, renderTokenDocs(themes));
    if (next !== null && next !== current) {
      await writeFile(designDoc, next);
      console.log(`  ↻ updated token tables in ${relative(repoRoot, designDoc)}`);
    }
  } catch {
    /* no DESIGN.md — nothing to refresh */
  }
}

async function buildOnce(options: { refreshDocs: boolean }): Promise<boolean> {
  const started = performance.now();
  try {
    const themes = await loadThemes();
    if (contrastBlocks(themes)) return false;
    await writeOutputs(themes);
    if (options.refreshDocs) await refreshDocs(themes);
    const ms = Math.round(performance.now() - started);
    const names = themes.map((t) => `${t.design.meta.name} (${t.name})`).join(", ");
    console.log(`✔ tokens: ${themes.length} theme(s) → dist/theme.css in ${ms}ms — ${names}`);
    return true;
  } catch (error) {
    console.error(`✖ tokens: ${error instanceof DesignError ? error.message : String(error)}`);
    return false;
  }
}

export async function build(options: { watch: boolean }) {
  const ok = await buildOnce({ refreshDocs: options.watch });
  if (!options.watch) {
    if (!ok) process.exit(1);
    return;
  }

  let timer: NodeJS.Timeout | undefined;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(() => void buildOnce({ refreshDocs: true }), 50);
  };

  // Watch folders, not files: editors often replace files instead of writing in place.
  watch(dirname(tokensFile), (_event, file) => {
    if (file === TOKENS_FILENAME) rebuild();
  });
  try {
    await mkdir(themesDir, { recursive: true });
    watch(themesDir, { recursive: true }, (_event, file) => {
      if (file?.endsWith(TOKENS_FILENAME)) rebuild();
    });
  } catch {
    console.warn(`⚠ tokens: could not watch ${themesDir}`);
  }
  console.log(`… watching ${relative(repoRoot, tokensFile)} and ${relative(repoRoot, themesDir)}/*/${TOKENS_FILENAME}`);
}
