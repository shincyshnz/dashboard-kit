import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleCheck, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const variants = ["default", "secondary", "outline", "destructive", "success", "warning"] as const;

const meta = {
  title: "UI/Badge",
  component: Badge,
  args: { children: "Paid" },
  argTypes: { variant: { control: "select", options: variants }, asChild: { control: false } },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `success` and `warning` are kit extensions powered by tokens in design-tokens.json. */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {variants.map((variant) => (
        <Badge key={variant} {...args} variant={variant} className="capitalize">
          {variant}
        </Badge>
      ))}
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="success">
        <CircleCheck aria-hidden /> Synced
      </Badge>
      <Badge variant="warning">
        <TriangleAlert aria-hidden /> Needs review
      </Badge>
    </div>
  ),
};
