import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  args: { defaultValue: "overview", onValueChange: fn() },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tabs {...args} className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="pt-2 text-sm">Order placed on October 12.</TabsContent>
      <TabsContent value="activity" className="pt-2 text-sm">The order is being prepared.</TabsContent>
      <TabsContent value="invoices" className="pt-2 text-sm">Invoice INV-1042 is ready.</TabsContent>
    </Tabs>
  ),
};
