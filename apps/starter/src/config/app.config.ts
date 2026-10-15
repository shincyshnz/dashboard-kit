import { env } from "@/config/env";

/**
 * Per-project settings. A new project edits this file, navigation.ts
 * and DESIGN.md — not component code.
 */
export const appConfig = {
  name: env.VITE_APP_NAME,
  description: "Operations overview",
  apiBaseUrl: env.VITE_API_BASE_URL,
} as const;
