import tokens from "@dashboard-kit/tokens/tokens.json";
import type { Meta, StoryObj } from "@storybook/react-vite";

type ThemeTokens = (typeof tokens.themes)["default"];
const themes = tokens.themes as Record<string, ThemeTokens>;

function Swatches({ theme, mode }: { theme: string; mode: "light" | "dark" }) {
  const design = themes[theme] ?? themes[tokens.default];
  if (!design) return null;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {design.meta.name} v{design.meta.version} · {mode}. Change theme and mode in the toolbar.
      </p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Object.entries(design.colors[mode]).map(([name, value]) => (
          <figure key={name} className="flex items-center gap-3">
            {/* Reads the live CSS variable, so it always matches what components render. */}
            <span className="size-10 shrink-0 rounded-md border" style={{ background: `var(--${name})` }} />
            <figcaption className="min-w-0">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate font-mono text-xs text-muted-foreground">{value}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: "Foundations/Colours",
  parameters: { layout: "padded" },
  tags: ["!autodocs"],
} satisfies Meta;

export default meta;

export const Palette: StoryObj = {
  render: (_args, { globals }) => (
    <Swatches theme={String(globals.theme ?? tokens.default)} mode={globals.mode === "dark" ? "dark" : "light"} />
  ),
};
