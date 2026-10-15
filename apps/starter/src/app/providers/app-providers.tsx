import { RouterProvider } from "react-router";

import { ThemeProvider } from "@/app/providers/theme-provider";
import { router } from "@/app/router/router";

/**
 * Global providers, outermost first. Providers that need the router
 * (e.g. nuqs) live in RootLayout instead.
 * Phase 3 adds: AuthProvider, server-state client provider.
 */
export function AppProviders() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
