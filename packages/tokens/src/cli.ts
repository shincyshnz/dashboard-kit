import { build } from "./commands/build.ts";
import { diff } from "./commands/diff.ts";
import { docs } from "./commands/docs.ts";
import { importTokens } from "./commands/import.ts";
import { schema } from "./commands/schema.ts";
import { DesignError } from "./errors.ts";

const [command = "build", ...args] = process.argv.slice(2);

try {
  switch (command) {
    case "build":
      await build({ watch: args.includes("--watch") });
      break;
    case "docs":
      await docs(args);
      break;
    case "schema":
      await schema(args);
      break;
    case "import":
      await importTokens(args);
      break;
    case "diff":
      await diff(args);
      break;
    default:
      console.log("Usage: dashboard-kit-tokens <build [--watch] | docs [--check] | schema [--check] | import | diff> [--help]");
      process.exit(1);
  }
} catch (error) {
  console.error(`✖ tokens: ${error instanceof DesignError ? error.message : String(error)}`);
  process.exit(1);
}
