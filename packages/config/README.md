# @dashboard-kit/config

Shared configuration so every package and app follows the same rules.

| Export | Use it in |
|---|---|
| `@dashboard-kit/config/tsconfig/base.json` | Anything TypeScript |
| `@dashboard-kit/config/tsconfig/react-app.json` | Vite + React apps |
| `@dashboard-kit/config/tsconfig/node.json` | Node scripts and CLIs (e.g. tokens) |
| `@dashboard-kit/config/eslint` | `eslint.config.js` of every app/package |

The ESLint config also enforces the folder rules from
[docs/PROJECT-STRUCTURE.md](../../docs/PROJECT-STRUCTURE.md): features are
imported only through their `index.ts`, and deep `../../` imports are banned.
