import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="max-w-sm">
      <CardHeader>
        <CardTitle>Team members</CardTitle>
        <CardDescription>Invite people to collaborate on this workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">3 of 10 seats used.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button>Invite member</Button>
        <Button variant="ghost">Manage seats</Button>
      </CardFooter>
    </Card>
  ),
};

/** A KPI card — the pattern Phase 2 Step 4 turns into a registry block. */
export const Metric: Story = {
  render: (args) => (
    <Card {...args} className="max-w-xs gap-3">
      <CardHeader>
        <CardDescription>Revenue (30 days)</CardDescription>
        <CardTitle className="text-3xl tabular-nums">$48,210</CardTitle>
        <CardAction>
          <Badge variant="success">+12.4%</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Compared with the previous 30 days.</p>
      </CardContent>
    </Card>
  ),
};
