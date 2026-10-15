import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from "@/components/ui/textarea";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  args: { placeholder: "Add an internal note about this order.", "aria-label": "Order note" },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true, value: "Customer contacted support." } };
export const Invalid: Story = { args: { "aria-invalid": true, value: "" } };
