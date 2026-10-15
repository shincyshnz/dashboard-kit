import { createContext } from "react";

export type ColorMode = "light" | "dark" | "system";

export interface ThemeContextValue {
  /** Light/dark preference. */
  mode: ColorMode;
  resolvedMode: "light" | "dark";
  setMode: (mode: ColorMode) => void;
  /** Brand / tenant theme name from themes/<name>/DESIGN.md ("default" = root DESIGN.md). */
  theme: string;
  themes: readonly { name: string; label: string }[];
  setTheme: (name: string) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
