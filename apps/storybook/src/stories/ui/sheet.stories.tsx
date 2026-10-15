import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const sides = ["top", "right", "bottom", "left"] as const;
const meta = {
  title: "UI/Sheet",
  component: Sheet,
  args: { onOpenChange: fn() },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Sides: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {sides.map((side) => (
        <Sheet key={side} {...args}>
          <SheetTrigger asChild><Button variant="outline" className="capitalize">Open {side}</Button></SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Order details</SheetTitle>
              <SheetDescription>Review fulfillment details for order ORD-1042.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
};
