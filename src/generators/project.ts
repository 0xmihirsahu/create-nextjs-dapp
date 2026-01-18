import * as p from "@clack/prompts";
import pc from "picocolors";
import { cpSync, existsSync, readdirSync, rmSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { copyDir, tryGitInit, install, getRunCommand, getInstallCommand, type PackageManager } from "../helpers";
import type { Chain, WalletProvider } from "../types";
import { CHAINS, WALLET_PROVIDERS } from "../config";
import { updatePackageJson } from "./package-json";
import { updateEnvExample } from "./env";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ProjectGeneratorOptions {
  projectName: string;
  projectPath: string;
  chain: Chain;
  wallet: WalletProvider;
  git: boolean;
  install: boolean;
  packageManager: PackageManager;
}

/**
 * Generate a new project from templates
 */
export async function generateProject(options: ProjectGeneratorOptions): Promise<void> {
  const { projectName, projectPath, chain, wallet, git, install: shouldInstall, packageManager } = options;

  const s = p.spinner();
  s.start(pc.cyan("◌") + " Creating your dApp...");

  // Copy base template
  // Note: After bundling, __dirname is the dist/ folder, so we go up one level to find templates/
  const templatesDir = join(__dirname, "..", "templates");
  const baseTemplate = join(templatesDir, "base");
  const chainTemplate = join(templatesDir, chain);
  const walletTemplate = join(templatesDir, chain, wallet);

  // Validate templates directory exists
  if (!existsSync(templatesDir)) {
    s.stop(pc.red("✗") + " Failed to create project");
    p.log.error(
      `Templates directory not found at ${pc.dim(templatesDir)}\n` +
      `  This is likely a corrupted installation. Try reinstalling:\n` +
      `  ${pc.cyan("npm install -g create-nextjs-dapp")}`
    );
    process.exit(1);
  }

  // Validate base template exists
  if (!existsSync(baseTemplate)) {
    s.stop(pc.red("✗") + " Failed to create project");
    p.log.error(
      `Base template not found at ${pc.dim(baseTemplate)}\n` +
      `  This is likely a corrupted installation. Try reinstalling:\n` +
      `  ${pc.cyan("npm install -g create-nextjs-dapp")}`
    );
    process.exit(1);
  }

  // Validate wallet template exists
  if (!existsSync(walletTemplate)) {
    s.stop(pc.red("✗") + " Failed to create project");
    p.log.error(
      `Template for ${pc.cyan(WALLET_PROVIDERS[wallet].name)} on ${pc.cyan(CHAINS[chain].name)} not found.\n` +
      `  Expected path: ${pc.dim(walletTemplate)}\n` +
      `  This wallet/chain combination may not be supported yet.`
    );
    process.exit(1);
  }

  try {
    // Copy base template first
    copyDir(baseTemplate, projectPath, ["node_modules", ".next", ".git"]);

    // Copy chain-specific base template (overwrite base files)
    if (existsSync(chainTemplate)) {
      // Only copy files directly in chain folder, not subdirectories (which are wallet templates)
      const entries = readdirSync(chainTemplate, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) {
          cpSync(join(chainTemplate, entry.name), join(projectPath, entry.name));
        } else if (
          !Object.keys(WALLET_PROVIDERS).includes(entry.name) &&
          entry.name !== "base"
        ) {
          // Copy non-wallet directories (like 'app', 'components', etc.)
          copyDir(
            join(chainTemplate, entry.name),
            join(projectPath, entry.name)
          );
        }
      }
    }

    // Copy wallet-specific files (overwrite chain files)
    if (existsSync(walletTemplate)) {
      copyDir(walletTemplate, projectPath);
    }

    // Update package.json
    updatePackageJson(projectPath, projectName, chain, wallet);

    // Update .env.example
    updateEnvExample(projectPath, chain, wallet);

    s.stop(pc.green("✓") + " Project created!");

    // Initialize git repository if requested
    if (git) {
      const gitSpinner = p.spinner();
      gitSpinner.start(pc.cyan("◌") + " Initializing git repository...");
      const gitInitialized = tryGitInit(projectPath);
      if (gitInitialized) {
        gitSpinner.stop(pc.green("✓") + " Git repository initialized!");
      } else {
        gitSpinner.stop(pc.yellow("⚠") + " Git initialization failed (git may not be installed)");
      }
    }

    // Install dependencies if requested
    if (shouldInstall) {
      const installSpinner = p.spinner();
      installSpinner.start(pc.cyan("◌") + ` Installing dependencies with ${packageManager}...`);
      const installed = install(projectPath, packageManager);
      if (installed) {
        installSpinner.stop(pc.green("✓") + " Dependencies installed!");
      } else {
        installSpinner.stop(pc.yellow("⚠") + " Failed to install dependencies");
      }
    }
  } catch (err) {
    s.stop(pc.red("✗") + " Failed to create project");

    // Clean up partial project if it exists
    if (existsSync(projectPath)) {
      try {
        rmSync(projectPath, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }

    if (err instanceof Error) {
      if (err.message.includes("EACCES") || err.message.includes("permission")) {
        p.log.error(
          `Permission denied. Unable to write to ${pc.dim(projectPath)}\n` +
          `  Try running with appropriate permissions or choose a different location.`
        );
      } else if (err.message.includes("ENOSPC")) {
        p.log.error(`Not enough disk space to create project.`);
      } else if (err.message.includes("ENOENT")) {
        p.log.error(
          `File or directory not found during project creation.\n` +
          `  ${pc.dim(err.message)}`
        );
      } else {
        p.log.error(
          `An error occurred while creating the project:\n` +
          `  ${pc.dim(err.message)}`
        );
      }
    } else {
      p.log.error(`An unexpected error occurred while creating the project.`);
    }
    process.exit(1);
  }
}

/**
 * Display project summary and next steps
 */
export function showProjectSummary(
  chain: Chain,
  wallet: WalletProvider,
  projectPath: string,
  projectName: string,
  packageManager: PackageManager,
  installed: boolean
): void {
  // Configuration summary
  console.log();
  console.log(pc.dim("  ────────────────────────────────────────"));
  console.log();
  console.log(`  ${pc.bold("Chain:")}    ${pc.cyan(CHAINS[chain].name)}`);
  console.log(`  ${pc.bold("Wallet:")}   ${pc.cyan(WALLET_PROVIDERS[wallet].name)}`);
  console.log(`  ${pc.bold("Path:")}     ${pc.dim(projectPath)}`);
  console.log();
  console.log(pc.dim("  ────────────────────────────────────────"));

  // Next steps with styled box (dynamic based on what was done)
  const nextSteps: string[] = [`${pc.cyan("cd")} ${projectName}`];
  if (!installed) {
    nextSteps.push(pc.cyan(getInstallCommand(packageManager)));
  }
  nextSteps.push(pc.cyan(getRunCommand(packageManager)));

  console.log();
  console.log(`  ${pc.bold(pc.white("Next steps:"))}`);
  console.log();
  nextSteps.forEach((step, i) => {
    console.log(`  ${pc.dim(`${i + 1}.`)} ${step}`);
  });
  console.log();
}
