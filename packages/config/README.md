# @dashboard-kit/config

Shared configuration so every package and app follows the same rules.

| Export | Use it in |
|---|---|
| `@dashboard-kit/config/tsconfig/base.json` | Anything TypeScript |
| `@dashboard-kit/config/tsconfig/react-app.json` | Vite + React apps |
| `@dashboard-kit/config/tsconfig/node.json` | Node scripts and CLIs (e.g. tokens) |
| `@dashboard-kit/config/eslint` | `eslint.config.js` of every app/package |
| `@dashboard-kit/config/eslint/token-audit` | Packages that ship themed UI (today `packages/ui`) |

The ESLint config also enforces the folder rules from
[docs/PROJECT-STRUCTURE.md](../../docs/PROJECT-STRUCTURE.md): features are
imported only through their `index.ts`, and deep `../../` imports are banned.

## Token audit

`token-audit` exports the `dashboard-kit/no-raw-design-values` rule and a
ready-made `tokenAudit` config block. It rejects class names that hard-code a
colour, radius, shadow or font instead of using a theme token.

```js
// eslint.config.js
import dashboardKit from "@dashboard-kit/config/eslint";
import { tokenAudit } from "@dashboard-kit/config/eslint/token-audit";

export default [...dashboardKit, tokenAudit];
```

| Rejected | Use instead |
|---|---|
| `bg-blue-600`, `text-white`, `border-zinc-200/50` | `bg-primary`, `text-primary-foreground`, `border-border` |
| `bg-[#fff]`, `text-[oklch(...)]` | a colour token, or add one to `design-tokens.json` |
| `rounded-[7px]` | `rounded-sm` … `rounded-xl` |
| `shadow-[0_2px_4px_#0003]` | `shadow-xs` … `shadow-lg` |
| `font-[Inter]` | `font-sans`, `font-heading`, `font-mono` |

The full table is in [docs/REGISTRY.md](../../docs/REGISTRY.md#styling-rules-for-registry-components).

```bash
pnpm --filter @dashboard-kit/config test   # RuleTester cases for the rule
```

| Source | What it is |
|---|---|
| `eslint/index.js` | Shared flat config (TypeScript, React hooks, structure rules) |
| `eslint/token-audit.js` | Token audit rule and config block |
| `test/token-audit.test.js` | Valid and invalid cases for the rule |
| `tsconfig/*.json` | Shared TypeScript configs |
