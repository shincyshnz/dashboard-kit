import type { Meta, StoryObj } from "@storybook/react-vite";

const textSizes = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl"] as const;
const radii = ["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl"] as const;
const shadows = ["shadow-xs", "shadow-sm", "shadow-md", "shadow-lg"] as const;
const spacing = [1, 2, 4, 6, 8, 12] as const;

const meta = {
  title: "Foundations/Shape and type",
  parameters: { layout: "padded" },
  tags: ["!autodocs"],
} satisfies Meta;

export default meta;

export const Typography: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-2">
      {textSizes.map((size) => (
        <p key={size} className={size}>
          <code className="mr-3 font-mono text-xs text-muted-foreground">{size}</code>
          Quarterly revenue grew 12%
        </p>
      ))}
      <p className="mt-4 font-heading text-xl font-semibold">font-heading</p>
      <p className="font-mono text-sm">font-mono 0123456789</p>
    </div>
  ),
};

export const RadiusAndShadow: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-6">
        {radii.map((r) => (
          <div key={r} className="flex flex-col items-center gap-2">
            <div className={`size-16 border-2 border-primary bg-accent ${r}`} />
            <code className="font-mono text-xs text-muted-foreground">{r}</code>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-6">
        {shadows.map((s) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <div className={`size-16 rounded-lg bg-card ${s}`} />
            <code className="font-mono text-xs text-muted-foreground">{s}</code>
          </div>
        ))}
      </div>
    </div>
  ),
};

/** Every spacing utility is a multiple of `spacing` from design-tokens.json. */
export const Density: StoryObj = {
  render: () => (
    <div className="flex items-end gap-3">
      {spacing.map((n) => (
        <div key={n} className="flex flex-col items-center gap-1">
          <div className="w-4 rounded-sm bg-primary" style={{ height: `calc(var(--dk-spacing, 0.25rem) * ${n})` }} />
          <code className="font-mono text-xs text-muted-foreground">{n}</code>
        </div>
      ))}
    </div>
  ),
};
