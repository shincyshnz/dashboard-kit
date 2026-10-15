import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const meta = {
  title: "UI/Table",
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <TableCaption>Recent orders for the Northstar store.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">ORD-1042</TableCell>
          <TableCell>Jordan Lee</TableCell>
          <TableCell>Processing</TableCell>
          <TableCell className="text-right">$184.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">ORD-1041</TableCell>
          <TableCell>Sam Rivera</TableCell>
          <TableCell>Shipped</TableCell>
          <TableCell className="text-right">$92.50</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const Empty: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
      <TableBody><TableRow><TableCell colSpan={2} className="h-24 text-center">No orders found.</TableCell></TableRow></TableBody>
    </Table>
  ),
};
