import type { Meta, StoryObj } from "@storybook/react-vite";

import { Separator } from "@/components/ui/separator";

const meta = {
  title: "UI/Separator",
  component: Separator,
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const InContent: Story = {
  render: () => (
    <div className="max-w-sm space-y-3">
      <div>
        <h3 className="font-medium">Shipping address</h3>
        <p className="text-sm text-muted-foreground">42 Market Street, Portland</p>
      </div>
      <Separator />
      <p className="text-sm">Delivery estimate: October 18</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: (args) => (
    <div className="flex h-5 items-center gap-3 text-sm">
      <span>Orders</span>
      <Separator {...args} orientation="vertical" />
      <span>Returns</span>
    </div>
  ),
};
