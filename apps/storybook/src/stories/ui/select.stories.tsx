import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const meta = {
  title: "UI/Select",
  component: Select,
  args: { defaultValue: "processing", onValueChange: fn() },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Order status" className="w-48">
        <SelectValue placeholder="Choose a status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="processing">Processing</SelectItem>
        <SelectItem value="shipped">Shipped</SelectItem>
        <SelectItem value="delivered">Delivered</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <Select {...args} disabled>
      <SelectTrigger aria-label="Order status" className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent><SelectItem value="processing">Processing</SelectItem></SelectContent>
    </Select>
  ),
};
