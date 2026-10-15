import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { appConfig } from "@/config/app.config";
import { useTheme } from "@/hooks/use-theme";

export function AppHeader() {
  const { resolvedMode, setMode, theme, themes, setTheme } = useTheme();
  const nextMode = resolvedMode === "dark" ? "light" : "dark";

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-6">
      <p className="truncate text-sm text-muted-foreground">{appConfig.description}</p>
      <div className="flex items-center gap-2">
        {themes.length > 1 && (
          <>
            <label htmlFor="theme-picker" className="sr-only">Theme</label>
            {/* Native select until Phase 2 adds the registry Select component. */}
            <select
              id="theme-picker"
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {themes.map((t) => (
                <option key={t.name} value={t.name}>{t.label}</option>
              ))}
            </select>
          </>
        )}
        <Button variant="ghost" size="icon" onClick={() => setMode(nextMode)} aria-label={`Switch to ${nextMode} mode`}>
          {resolvedMode === "dark" ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  );
}
