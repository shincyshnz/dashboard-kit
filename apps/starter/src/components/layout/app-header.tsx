import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger aria-label="Theme" className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {themes.map((t) => (
                <SelectItem key={t.name} value={t.name}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button variant="ghost" size="icon" onClick={() => setMode(nextMode)} aria-label={`Switch to ${nextMode} mode`}>
          {resolvedMode === "dark" ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  );
}
