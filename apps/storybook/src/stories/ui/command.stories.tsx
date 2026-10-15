import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from "@/components/ui/command";

const meta = {
  title: "UI/Command",
  component: Command,
  args: { onValueChange: fn() },
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Command {...args} className="max-w-sm rounded-lg border">
      <CommandInput aria-label="Search orders and pages" placeholder="Search orders and pages..." />
      <CommandList>
        <CommandEmpty>No matching orders or pages.</CommandEmpty>
        <CommandGroup heading="Pages">
          <CommandItem value="overview">Overview<CommandShortcut>⌘1</CommandShortcut></CommandItem>
          <CommandItem value="orders">Orders<CommandShortcut>⌘2</CommandShortcut></CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Recent orders">
          <CommandItem value="ord-1042">ORD-1042 · Avery Morgan</CommandItem>
          <CommandItem value="ord-1041">ORD-1041 · Jordan Lee</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const Empty: Story = {
  render: (args) => (
    <Command {...args} className="max-w-sm rounded-lg border">
      <CommandInput aria-label="Search orders" placeholder="Search orders..." value="invoice-9999" />
      <CommandList><CommandEmpty>No matching orders found.</CommandEmpty></CommandList>
    </Command>
  ),
};

export const SearchDialog: Story = {
  render: (args) => (
    <CommandDialog defaultOpen>
      <Command {...args}>
        <CommandInput aria-label="Search available commands" placeholder="Search pages and orders..." />
        <CommandList>
          <CommandEmpty>No matching pages or orders.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem value="overview">Overview</CommandItem>
            <CommandItem value="orders">Orders</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  ),
};
