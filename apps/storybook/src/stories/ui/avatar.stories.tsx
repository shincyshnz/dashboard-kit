import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  args: { "aria-label": "Avery Morgan" },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>AM</AvatarFallback>
    </Avatar>
  ),
};

export const Fallback: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Avatar {...args}><AvatarFallback>AM</AvatarFallback></Avatar>
      <div>
        <p className="text-sm font-medium">Avery Morgan</p>
        <p className="text-sm text-muted-foreground">Operations</p>
      </div>
    </div>
  ),
};
