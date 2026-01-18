import { validateNpmName } from "../helpers";
import type { Chain, WalletProvider, CLIOptions } from "../types";
import { CHAINS, WALLET_PROVIDERS } from "../config";
import { exitWithError, showHelp, showVersion } from "./output";

/**
 * Parse command-line arguments into structured options
 */
export function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};
  const validChains = Object.keys(CHAINS);
  const validWallets = Object.keys(WALLET_PROVIDERS);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      showHelp();
      process.exit(0);
    }

    if (arg === "--version" || arg === "-v") {
      showVersion();
      process.exit(0);
    }

    if (arg === "--wallet" || arg === "-w") {
      const value = args[++i]?.toLowerCase();
      if (!value) {
        exitWithError(`Missing value for ${arg}. Expected one of: ${validWallets.join(", ")}`);
      }
      if (!validWallets.includes(value)) {
        exitWithError(
          `Invalid wallet provider "${value}".\n` +
          `  Valid options: ${validWallets.join(", ")}`
        );
      }
      options.wallet = value as WalletProvider;
    } else if (arg.startsWith("--wallet=")) {
      const value = arg.split("=")[1]?.toLowerCase();
      if (!value || !validWallets.includes(value)) {
        exitWithError(
          `Invalid wallet provider "${value || ""}".\n` +
          `  Valid options: ${validWallets.join(", ")}`
        );
      }
      options.wallet = value as WalletProvider;
    } else if (arg === "--chain" || arg === "-c") {
      const value = args[++i]?.toLowerCase();
      if (!value) {
        exitWithError(`Missing value for ${arg}. Expected one of: ${validChains.join(", ")}`);
      }
      if (!validChains.includes(value)) {
        exitWithError(
          `Invalid chain "${value}".\n` +
          `  Valid options: ${validChains.join(", ")}`
        );
      }
      options.chain = value as Chain;
    } else if (arg.startsWith("--chain=")) {
      const value = arg.split("=")[1]?.toLowerCase();
      if (!value || !validChains.includes(value)) {
        exitWithError(
          `Invalid chain "${value || ""}".\n` +
          `  Valid options: ${validChains.join(", ")}`
        );
      }
      options.chain = value as Chain;
    } else if (arg === "--yes" || arg === "-y") {
      options.yes = true;
    } else if (arg === "--git") {
      options.git = true;
    } else if (arg === "--install") {
      options.install = true;
    } else if (arg === "--use-npm") {
      options.packageManager = "npm";
    } else if (arg === "--use-yarn") {
      options.packageManager = "yarn";
    } else if (arg === "--use-pnpm") {
      options.packageManager = "pnpm";
    } else if (arg === "--use-bun") {
      options.packageManager = "bun";
    } else if (arg.startsWith("-")) {
      exitWithError(`Unknown option "${arg}".`);
    } else if (!options.projectName) {
      // Validate project name using npm naming rules
      const validation = validateNpmName(arg);
      if (!validation.valid) {
        exitWithError(
          `Invalid project name "${arg}".\n` +
          `  ${validation.problems?.join("\n  ")}`
        );
      }
      options.projectName = arg;
    }
  }

  return options;
}
