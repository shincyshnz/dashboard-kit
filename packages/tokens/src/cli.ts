import { build } from "./commands/build.ts";
import { diff } from "./commands/diff.ts";
import { importTokens } from "./commands/import.ts";
import { DesignError } from "./parse.ts";

const [command = "build", ...args] = process.argv.slice(2);

try {
  switch (command) {
    case "build":
      await build({ watch: args.includes("--watch") });
      break;
    case "import":
      await importTokens(args);
      break;
    case "diff":
      await diff(args);
      break;
    default:
      console.log("Usage: dashboard-kit-tokens <build [--watch] | import | diff> [--help]");
      process.exit(1);
  }
} catch (error) {
  console.error(`✖ tokens: ${error instanceof DesignError ? error.message : String(error)}`);
  process.exit(1);
}
