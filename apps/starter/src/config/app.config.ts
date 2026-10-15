import { env } from "@/config/env";

/**
 * Per-project settings. A new project edits this file, navigation.ts
 * and design-tokens.json — not component code.
 */
export const appConfig = {
  name: env.VITE_APP_NAME,
  description: "Operations overview",
  apiBaseUrl: env.VITE_API_BASE_URL,
} as const;
