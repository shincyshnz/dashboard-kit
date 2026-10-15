import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "@/components/ui/input";

const meta = {
  title: "UI/Input",
  component: Input,
  args: { placeholder: "Search orders", "aria-label": "Search orders" },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true, value: "ORD-1042" } };
export const Invalid: Story = { args: { "aria-invalid": true, value: "not-an-email", type: "email" } };
