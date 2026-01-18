import * as p from "@clack/prompts";
import pc from "picocolors";
import { existsSync, rmSync } from "fs";
import { resolve, join } from "path";
import {
  validateNpmName,
  getPkgManager,
  isFolderEmpty,
  getConflictingFiles,
  isWriteable,
  type PackageManager,
} from "../helpers";
import type { Chain, WalletProvider, CLIOptions } from "../types";
import { CHAINS, WALLET_PROVIDERS, getProvidersForChain } from "../config";

export interface ResolvedOptions {
  projectName: string;
  chain: Chain;
  wallet: WalletProvider;
  projectPath: string;
  packageManager: PackageManager;
  git: boolean;
  install: boolean;
}

/**
 * Run interactive prompts to gather project configuration
 */
export async function runPrompts(cliOptions: CLIOptions): Promise<ResolvedOptions> {
  const useDefaults = cliOptions.yes;

  // Detect package manager (use flag if specified, otherwise detect from environment)
  const packageManager = cliOptions.packageManager || getPkgManager();

  // Project name
  let projectName = cliOptions.projectName;
  if (!projectName) {
    if (useDefaults) {
      projectName = "my-dapp";
    } else {
      const result = await p.text({
        message: "What is your project named?",
        placeholder: "my-dapp",
        defaultValue: "my-dapp",
        validate: (value) => {
          if (!value) return "Project name is required";
          const validation = validateNpmName(value);
          if (!validation.valid) {
            return validation.problems?.[0] || "Invalid project name";
          }
          return undefined;
        },
      });

      if (p.isCancel(result)) {
        p.cancel(pc.dim("See you next time!"));
        process.exit(0);
      }

      projectName = result;
    }
  }

  // Chain selection
  let chain = cliOptions.chain;
  if (!chain) {
    if (useDefaults) {
      chain = "evm";
    } else {
      const result = await p.select({
        message: "Which blockchain do you want to build on?",
        options: Object.entries(CHAINS).map(([value, { name, description }]) => ({
          value: value as Chain,
          label: name,
          hint: description,
        })),
        initialValue: "evm" as Chain,
      });

      if (p.isCancel(result)) {
        p.cancel(pc.dim("See you next time!"));
        process.exit(0);
      }

      chain = result;
    }
  }

  // Get available providers for selected chain
  const availableProviders = getProvidersForChain(chain);

  // Wallet provider
  let wallet = cliOptions.wallet;

  // Validate wallet is compatible with chain
  if (wallet && !availableProviders.includes(wallet)) {
    if (useDefaults) {
      // In non-interactive mode, exit with error
      p.log.error(
        `${pc.red(WALLET_PROVIDERS[wallet].name)} doesn't support ${pc.cyan(CHAINS[chain].name)}.`
      );
      p.log.info(
        `Available providers for ${CHAINS[chain].name}: ${availableProviders.map(w => pc.cyan(w)).join(", ")}`
      );
      process.exit(1);
    }
    p.log.warn(
      `${WALLET_PROVIDERS[wallet].name} doesn't support ${CHAINS[chain].name}. Please choose another provider.`
    );
    wallet = undefined;
  }

  if (!wallet) {
    if (useDefaults) {
      wallet = availableProviders[0];
    } else {
      const result = await p.select({
        message: "Which wallet provider do you want to use?",
        options: availableProviders.map((key) => ({
          value: key,
          label: WALLET_PROVIDERS[key].name,
          hint: WALLET_PROVIDERS[key].description,
        })),
        initialValue: availableProviders[0],
      });

      if (p.isCancel(result)) {
        p.cancel(pc.dim("See you next time!"));
        process.exit(0);
      }

      wallet = result;
    }
  }

  const projectPath = resolve(process.cwd(), projectName);

  // Check if directory is writeable
  const root = resolve(projectPath, "..");
  if (!isWriteable(root)) {
    p.log.error(
      `The directory ${pc.dim(root)} is not writable.\n` +
      `  Please check your permissions and try again.`
    );
    process.exit(1);
  }

  // Check if directory exists and handle conflicts
  if (existsSync(projectPath)) {
    if (!isFolderEmpty(projectPath, projectName)) {
      const conflicts = getConflictingFiles(projectPath);

      if (useDefaults) {
        p.log.error(
          `Directory ${pc.red(projectName)} contains files that could conflict:\n` +
          `  ${conflicts.slice(0, 5).join(", ")}${conflicts.length > 5 ? `, and ${conflicts.length - 5} more` : ""}`
        );
        process.exit(1);
      }

      p.log.warn(
        `Directory ${pc.yellow(projectName)} contains files that could conflict:\n` +
        `  ${conflicts.slice(0, 5).join(", ")}${conflicts.length > 5 ? `, and ${conflicts.length - 5} more` : ""}`
      );

      const overwrite = await p.confirm({
        message: "Would you like to overwrite these files?",
        initialValue: false,
      });

      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel(pc.dim("Operation cancelled."));
        process.exit(0);
      }

      // Remove conflicting files
      for (const file of conflicts) {
        rmSync(join(projectPath, file), { recursive: true, force: true });
      }
    }
  }

  return {
    projectName,
    chain,
    wallet,
    projectPath,
    packageManager,
    git: cliOptions.git ?? false,
    install: cliOptions.install ?? false,
  };
}
