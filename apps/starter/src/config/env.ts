import { z } from "zod";

/** Validated environment. Fails fast at startup instead of at the first API call. */
const envSchema = z.object({
  VITE_APP_NAME: z.string().default("Dashboard Kit"),
  VITE_API_BASE_URL: z.url().default("http://localhost:4000/api"),
});

export const env = envSchema.parse(import.meta.env);
