import type { Meta, StoryObj } from "@storybook/react-vite";
import { LayoutDashboard, PackageSearch } from "lucide-react";
import { fn } from "storybook/test";

import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarInset, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";

const meta = {
  title: "UI/Sidebar",
  component: SidebarProvider,
  args: { defaultOpen: true, onOpenChange: fn() },
} satisfies Meta<typeof SidebarProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <SidebarProvider {...args} className="min-h-96 overflow-hidden rounded-lg border">
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive><LayoutDashboard aria-hidden /><span>Overview</span></SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton><PackageSearch aria-hidden /><span>Orders</span></SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Dashboard</span>
        </header>
        <div className="p-4 text-sm text-muted-foreground">Select a page to view its details.</div>
      </SidebarInset>
    </SidebarProvider>
  ),
};

export const Collapsed: Story = {
  args: { defaultOpen: false },
  render: (args) => (
    <SidebarProvider {...args} className="min-h-96 overflow-hidden rounded-lg border">
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem><SidebarMenuButton aria-label="Overview" isActive><LayoutDashboard aria-hidden /></SidebarMenuButton></SidebarMenuItem>
              <SidebarMenuItem><SidebarMenuButton aria-label="Orders"><PackageSearch aria-hidden /></SidebarMenuButton></SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset><div className="p-4 text-sm">Collapsed navigation</div></SidebarInset>
    </SidebarProvider>
  ),
};
