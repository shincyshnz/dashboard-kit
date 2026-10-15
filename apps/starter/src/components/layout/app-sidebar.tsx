import { NavLink } from "react-router";

import { appConfig } from "@/config/app.config";
import { navigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-14 items-center gap-2 px-5 font-heading font-semibold">
        <span className="grid size-7 place-items-center rounded-md bg-sidebar-primary text-xs text-sidebar-primary-foreground">
          {appConfig.name.slice(0, 2).toUpperCase()}
        </span>
        {appConfig.name}
      </div>
      <nav aria-label="Main" className="flex flex-col gap-1 px-3 py-2">
        {navigation.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm outline-none transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
              )
            }
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
