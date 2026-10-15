import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, Download, Trash2 } from "lucide-react";
import { fn } from "storybook/test";

import { Button } from "@/components/ui/button";

const variants = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const;
const sizes = ["sm", "default", "lg"] as const;

/** Every story file starts with a `meta` object: which component, defaults, controls. */
const meta = {
  title: "UI/Button",
  component: Button,
  args: { children: "Save changes", onClick: fn() },
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "select", options: [...sizes, "icon"] },
    asChild: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Each named export is one story. With no extra settings it renders `meta.args`. */
export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant} className="capitalize">
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {sizes.map((size) => (
        <Button key={size} {...args} size={size}>
          Size {size}
        </Button>
      ))}
      <Button {...args} size="icon" aria-label="Download report">
        <Download />
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button {...args}>
        Continue <ArrowRight />
      </Button>
      <Button {...args} variant="destructive">
        <Trash2 /> Delete order
      </Button>
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };

/** `asChild` renders the child element (here a link) with button styling. */
export const AsLink: Story = {
  render: (args) => (
    <Button {...args} asChild>
      <a href="#report">Open report</a>
    </Button>
  ),
};
