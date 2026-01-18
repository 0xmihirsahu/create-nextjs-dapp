import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { Chain, WalletProvider } from "../types";
import {
  WALLET_PROVIDERS,
  getChainDependencies,
  getWalletDependencies,
  ALL_WALLET_DEPS,
} from "../config";

/**
 * Update package.json with project name, description, and dependencies
 */
export function updatePackageJson(
  projectPath: string,
  projectName: string,
  chain: Chain,
  wallet: WalletProvider
): void {
  const pkgPath = join(projectPath, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

  pkg.name = projectName;

  // Update description based on chain
  if (chain === "evm") {
    pkg.description = "A Next.js dApp built on Ethereum with " + WALLET_PROVIDERS[wallet].name;
  } else if (chain === "solana") {
    pkg.description = "A Next.js dApp built on Solana with " + WALLET_PROVIDERS[wallet].name;
  }

  // Remove all wallet-specific dependencies first
  ALL_WALLET_DEPS.forEach((dep) => {
    delete pkg.dependencies[dep];
  });

  // Add chain-specific base dependencies
  const chainDeps = getChainDependencies(chain);
  Object.assign(pkg.dependencies, chainDeps);

  // Add wallet-specific dependencies
  const walletDeps = getWalletDependencies(chain, wallet);
  Object.assign(pkg.dependencies, walletDeps);

  // Sort dependencies
  pkg.dependencies = Object.fromEntries(
    Object.entries(pkg.dependencies).sort(([a], [b]) => a.localeCompare(b))
  );

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}
