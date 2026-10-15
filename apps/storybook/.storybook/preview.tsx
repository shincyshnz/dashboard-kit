import tokens from "@dashboard-kit/tokens/tokens.json";
import type { Decorator, Preview } from "@storybook/react-vite";

import "../src/styles.css";

/**
 * A decorator wraps every story. This one applies the same two switches the
 * apps use: `data-theme` for the brand/tenant theme and `.dark` for the mode.
 */
const withTheme: Decorator = (Story, context) => {
  const { theme, mode } = context.globals as { theme?: string; mode?: string };
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  if (!theme || theme === tokens.default) root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
  return <Story />;
};

const preview: Preview = {
  // Toolbar menus. Their values live in `context.globals` for every story.
  globalTypes: {
    theme: {
      description: "Brand / tenant theme (themes/<name>/DESIGN.md)",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: tokens.list.map((t) => ({ value: t.name, title: t.label })),
        dynamicTitle: true,
      },
    },
    mode: {
      description: "Colour mode",
      toolbar: {
        title: "Mode",
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: tokens.default, mode: "light" },
  decorators: [withTheme],
  parameters: {
    layout: "centered",
    controls: { expanded: true, sort: "requiredFirst" },
    // Accessibility violations count as failures when stories run as tests (Phase 5).
    a11y: { test: "error" },
  },
  // Every component gets an auto-generated Docs page from its stories and props.
  tags: ["autodocs"],
};

export default preview;
