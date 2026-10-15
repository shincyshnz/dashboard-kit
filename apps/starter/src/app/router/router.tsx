import { createBrowserRouter } from "react-router";

import { RootLayout } from "@/app/router/root-layout";
import { paths } from "@/config/routes";
import { ErrorPage } from "@/pages/error-page";
import { NotFoundPage } from "@/pages/not-found-page";

/**
 * Route tree. Feature pages are lazy-loaded so each feature becomes its own chunk.
 * Phase 3 adds an auth loader on the protected branch.
 */
export const router = createBrowserRouter([
  {
    path: paths.home,
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import("@/features/dashboard")).DashboardPage }),
      },
      {
        path: paths.design,
        lazy: async () => ({ Component: (await import("@/features/design")).DesignTokensPage }),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
