import type { Meta, StoryObj } from "@storybook/react-vite";

import { Toaster } from "@/components/ui/sonner";

const meta = {
  title: "UI/Sonner",
  component: Toaster,
  args: { position: "top-right", closeButton: true },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const RichColors: Story = { args: { richColors: true, position: "bottom-right" } };
