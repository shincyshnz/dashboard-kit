import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

/**
 * Stories render the registry SOURCE (packages/ui/src), so the catalogue
 * always shows exactly what `shadcn add @dashboard-kit/<name>` would install.
 */
const registrySource = fileURLToPath(new URL("../../../packages/ui/src", import.meta.url));

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  core: { disableTelemetry: true },
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import("vite");
    return mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
      // Registry components import "@/lib/utils"; point "@" at the registry source.
      resolve: { alias: { "@": registrySource } },
    });
  },
};

export default config;
