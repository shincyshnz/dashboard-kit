import { LayoutDashboard, Palette, type LucideIcon } from "lucide-react";

import { paths } from "@/config/routes";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

/** Sidebar menu, as data. Add an entry here when you add a route. */
export const navigation: NavItem[] = [
  { label: "Overview", to: paths.home, icon: LayoutDashboard },
  { label: "Design tokens", to: paths.design, icon: Palette },
];
