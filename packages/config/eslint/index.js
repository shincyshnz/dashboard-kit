// Shared flat config. Apps use: export default [...dashboardKit];
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", ".turbo"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.strict],
    languageOptions: { ecmaVersion: 2023, globals: globals.browser },
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/consistent-type-imports": "error",
      // Structure rules — see docs/PROJECT-STRUCTURE.md
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/*"],
              message: "Import a feature only through its public index: '@/features/<name>'.",
            },
            {
              group: ["../../*"],
              message: "Deep relative imports are not allowed. Use the '@/' alias.",
            },
          ],
        },
      ],
    },
  },
  {
    // shadcn primitives follow upstream style; story files export meta + stories.
    files: ["**/components/ui/**", "**/*.stories.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
);
