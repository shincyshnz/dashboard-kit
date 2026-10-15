import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  args: { onOpenChange: fn() },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithContent: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild><Button variant="outline">Archive order</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive this order?</DialogTitle>
          <DialogDescription>The order will be removed from the active orders list.</DialogDescription>
        </DialogHeader>
        <DialogFooter><Button>Archive order</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
