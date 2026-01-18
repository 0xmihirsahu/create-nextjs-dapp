import pc from "picocolors";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Read package.json for version and update notifier
 */
export function getPackageJson(): { name: string; version: string } {
  try {
    // Go up from dist/cli to find package.json
    const pkgPath = join(__dirname, "..", "..", "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    return { name: pkg.name || "create-nextjs-dapp", version: pkg.version || "0.0.0" };
  } catch {
    return { name: "create-nextjs-dapp", version: "0.0.0" };
  }
}

const pkg = getPackageJson();
export const VERSION = pkg.version;
export const PACKAGE_NAME = pkg.name;

/**
 * Display help message
 */
export function showHelp(): void {
  console.log(`
${pc.bold(pc.cyan("create-nextjs-dapp"))} ${pc.dim(`v${VERSION}`)}

Create a Next.js dApp with your preferred wallet provider.

${pc.bold("Usage:")}
  ${pc.cyan("npx create-nextjs-dapp")} ${pc.dim("[project-name] [options]")}

${pc.bold("Options:")}
  ${pc.cyan("-c, --chain <chain>")}     Blockchain to use (evm, solana)
  ${pc.cyan("-w, --wallet <provider>")} Wallet provider to use
  ${pc.cyan("-y, --yes")}               Skip prompts and use defaults
  ${pc.cyan("--git")}                   Initialize a git repository
  ${pc.cyan("--install")}               Install dependencies after creation
  ${pc.cyan("--use-npm")}               Use npm as the package manager
  ${pc.cyan("--use-yarn")}              Use yarn as the package manager
  ${pc.cyan("--use-pnpm")}              Use pnpm as the package manager
  ${pc.cyan("--use-bun")}               Use bun as the package manager
  ${pc.cyan("-h, --help")}              Show this help message
  ${pc.cyan("-v, --version")}           Show version number

${pc.bold("Wallet Providers:")}
  ${pc.bold("EVM:")}
    ${pc.cyan("rainbowkit")}  Best UX for connecting wallets ${pc.dim("(recommended)")}
    ${pc.cyan("connectkit")}  Beautiful, customizable wallet connection UI
    ${pc.cyan("privy")}       Email, social, and wallet login with embedded wallets
    ${pc.cyan("dynamic")}     Multi-chain auth with embedded wallets and onramps
    ${pc.cyan("reown")}       WalletConnect's official SDK (formerly Web3Modal)
    ${pc.cyan("thirdweb")}    Full-stack web3 development platform
    ${pc.cyan("getpara")}     Embedded wallets with MPC key management

  ${pc.bold("Solana:")}
    ${pc.cyan("wallet-adapter")}  Standard Solana wallet connection ${pc.dim("(recommended)")}
    ${pc.cyan("privy")}           Email, social, and wallet login
    ${pc.cyan("dynamic")}         Multi-chain auth with embedded wallets
    ${pc.cyan("reown")}           WalletConnect's official SDK
    ${pc.cyan("thirdweb")}        Full-stack web3 development platform

${pc.bold("Examples:")}
  ${pc.dim("# Interactive mode")}
  ${pc.cyan("npx create-nextjs-dapp")}

  ${pc.dim("# Create with project name")}
  ${pc.cyan("npx create-nextjs-dapp my-dapp")}

  ${pc.dim("# Create with all options")}
  ${pc.cyan("npx create-nextjs-dapp my-dapp --chain evm --wallet rainbowkit")}

  ${pc.dim("# Solana project")}
  ${pc.cyan("npx create-nextjs-dapp my-solana-app -c solana -w dynamic")}

  ${pc.dim("# Non-interactive with defaults")}
  ${pc.cyan("npx create-nextjs-dapp my-dapp --yes")}

  ${pc.dim("# Create with git and install dependencies")}
  ${pc.cyan("npx create-nextjs-dapp my-dapp --git --install")}

${pc.bold("Learn more:")}
  ${pc.dim("GitHub:")} ${pc.cyan("https://github.com/0xmihirsahu/create-nextjs-dapp")}
`);
}

/**
 * Display version number
 */
export function showVersion(): void {
  console.log(`create-nextjs-dapp v${VERSION}`);
}

/**
 * Exit with a formatted error message
 */
export function exitWithError(message: string): never {
  console.error(`\n${pc.red("Error:")} ${message}\n`);
  console.error(`Run ${pc.cyan("create-nextjs-dapp --help")} for usage information.\n`);
  process.exit(1);
}
