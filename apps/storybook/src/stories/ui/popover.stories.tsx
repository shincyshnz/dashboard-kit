import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const meta = {
  title: "UI/Popover",
  component: Popover,
  args: { onOpenChange: fn() },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filter: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild><Button variant="outline">Order filters</Button></PopoverTrigger>
      <PopoverContent aria-label="Order filters">
        <p className="font-medium">Filter orders</p>
        <p className="mt-1 text-sm text-muted-foreground">Choose which orders to include.</p>
      </PopoverContent>
    </Popover>
  ),
};
