import tokens from "@dashboard-kit/tokens/tokens.json";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { ThemeContext, type ColorMode } from "@/app/providers/theme-context";

// Keep these keys in sync with the pre-paint script in index.html.
const MODE_KEY = "dk-theme";
const THEME_KEY = "dk-brand";

const themeNames = new Set(tokens.list.map((t) => t.name));
const media = () => window.matchMedia("(prefers-color-scheme: dark)");

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — the choice still applies for this session */
  }
}

interface ThemeProviderProps {
  children: ReactNode;
  /**
   * Force a theme, e.g. from the tenant's config in a multi-tenant app.
   * When set, the user's stored choice is ignored.
   */
  forcedTheme?: string;
}

/**
 * Applies the two theme switches DESIGN.md compiles to:
 * `.dark` on <html> for colour mode, `data-theme` on <html> for the brand/tenant theme.
 */
export function ThemeProvider({ children, forcedTheme }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ColorMode>(() => {
    const stored = read(MODE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  });
  const [storedTheme, setStoredTheme] = useState(() => {
    const stored = read(THEME_KEY);
    return stored && themeNames.has(stored) ? stored : tokens.default;
  });
  const [systemDark, setSystemDark] = useState(() => media().matches);

  useEffect(() => {
    const query = media();
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const resolvedMode = mode === "system" ? (systemDark ? "dark" : "light") : mode;
  const theme = forcedTheme && themeNames.has(forcedTheme) ? forcedTheme : storedTheme;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedMode === "dark");
  }, [resolvedMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === tokens.default) root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      mode,
      resolvedMode,
      setMode: (next: ColorMode) => {
        setModeState(next);
        write(MODE_KEY, next);
      },
      theme,
      themes: tokens.list,
      setTheme: (name: string) => {
        if (!themeNames.has(name)) return;
        setStoredTheme(name);
        write(THEME_KEY, name);
      },
    }),
    [mode, resolvedMode, theme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
