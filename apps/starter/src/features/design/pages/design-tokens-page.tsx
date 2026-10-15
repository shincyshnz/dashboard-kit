import tokens from "@dashboard-kit/tokens/tokens.json";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";
import { ColorSwatch } from "../components/color-swatch";

type ThemeTokens = (typeof tokens.themes)["default"];
const themes = tokens.themes as Record<string, ThemeTokens>;

const shadowSizes = ["shadow-xs", "shadow-sm", "shadow-md", "shadow-lg"] as const;
const radiusSizes = ["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl"] as const;
const textSizes = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl"] as const;

/** Live preview of the active design-tokens.json — the quickest way to review a theme change. */
export function DesignTokensPage() {
  const { resolvedMode, theme } = useTheme();
  const design = themes[theme] ?? themes[tokens.default];
  if (!design) return null;
  const palette = design.colors[resolvedMode];
  const source = theme === tokens.default ? "design-tokens.json" : `themes/${theme}/design-tokens.json`;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">
          {design.meta.name} <span className="text-muted-foreground">v{design.meta.version}</span>
        </h1>
        <p className="max-w-prose text-muted-foreground">
          Everything on this page comes from <code className="font-mono text-sm">{source}</code>. Edit it while the dev
          server runs and the page updates on save.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Colours ({resolvedMode})</CardTitle>
          <CardDescription>Switch theme or mode in the header to compare palettes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(palette).map(([name, value]) => (
            <ColorSwatch key={name} name={name} value={value} />
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Components</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Delete</Button>
            <Badge>Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Failed</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>{design.typography.sans.split(",")[0]} · {design.typography.mono.split(",")[0]}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            {textSizes.map((size) => (
              <p key={size} className={`${size} truncate`}>
                <code className="mr-3 font-mono text-xs text-muted-foreground">{size}</code>
                Quarterly revenue
              </p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shape and depth</CardTitle>
            <CardDescription>Radius {design.radius}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-4">
              {radiusSizes.map((size) => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <div className={`size-14 border-2 border-primary bg-accent ${size}`} />
                  <code className="font-mono text-xs text-muted-foreground">{size}</code>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              {shadowSizes.map((size) => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <div className={`size-14 rounded-lg bg-card ${size}`} />
                  <code className="font-mono text-xs text-muted-foreground">{size}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Density and motion</CardTitle>
            <CardDescription>Spacing unit {design.density?.spacing ?? "0.25rem (Tailwind default)"}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-end gap-2" aria-label="Spacing scale">
              {[1, 2, 4, 6, 8, 12].map((n) => (
                <div key={n} className="flex flex-col items-center gap-1">
                  <div className="w-4 rounded-sm bg-primary" style={{ height: `calc(var(--dk-spacing, 0.25rem) * ${n})` }} />
                  <code className="font-mono text-xs text-muted-foreground">{n}</code>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.keys(design.motion?.ease ?? {}).map((ease) => (
                <button
                  key={ease}
                  type="button"
                  className="group rounded-md border px-3 py-2 text-left text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <span className="mb-2 block font-mono text-xs text-muted-foreground">ease-{ease}</span>
                  <span
                    className="block h-2 w-8 rounded-full bg-primary transition-transform duration-(--duration-slow) group-hover:translate-x-24 group-focus-visible:translate-x-24 motion-reduce:transition-none"
                    style={{ transitionTimingFunction: `var(--dk-ease-${ease})` }}
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
