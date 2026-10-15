import { NuqsAdapter } from "nuqs/adapters/react-router/v8";
import { Outlet } from "react-router";

import { AppShell } from "@/components/layout/app-shell";

/** Root route element. nuqs needs the router context, so it is mounted here. */
export function RootLayout() {
  return (
    <NuqsAdapter>
      <AppShell>
        <Outlet />
      </AppShell>
    </NuqsAdapter>
  );
}
