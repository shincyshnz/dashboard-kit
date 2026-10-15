import dashboardKit from "@dashboard-kit/config/eslint";
import { tokenAudit } from "@dashboard-kit/config/eslint/token-audit";

export default [{ ignores: ["public"] }, ...dashboardKit, tokenAudit];
