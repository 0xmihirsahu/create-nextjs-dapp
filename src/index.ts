#!/usr/bin/env node

import * as p from "@clack/prompts";
import pc from "picocolors";
import { cpSync, existsSync, readFileSync, writeFileSync, readdirSync, rmSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import updateNotifier from "update-notifier";
import {
  getPkgManager,
  validateNpmName,
  isFolderEmpty,
  getConflictingFiles,
  isWriteable,
  tryGitInit,
  install,
  getRunCommand,
  getInstallCommand,
  copyDir,
  type PackageManager,
} from "./helpers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version and update notifier
function getPackageJson(): { name: string; version: string } {
  try {
    const pkgPath = join(__dirname, "..", "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    return { name: pkg.name || "create-nextjs-dapp", version: pkg.version || "0.0.0" };
  } catch {
    return { name: "create-nextjs-dapp", version: "0.0.0" };
  }
}

const pkg = getPackageJson();
const VERSION = pkg.version;

// Check for updates (non-blocking, cached for 1 day)
const notifier = updateNotifier({ pkg, updateCheckInterval: 1000 * 60 * 60 * 24 });

function showHelp(): void {
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

function showVersion(): void {
  console.log(`create-nextjs-dapp v${VERSION}`);
}

type Chain = "evm" | "solana";
type WalletProvider =
  | "rainbowkit"
  | "connectkit"
  | "privy"
  | "dynamic"
  | "reown"
  | "thirdweb"
  | "getpara"
  | "wallet-adapter";

interface CLIOptions {
  projectName?: string;
  chain?: Chain;
  wallet?: WalletProvider;
  yes?: boolean;
  git?: boolean;
  install?: boolean;
  packageManager?: PackageManager;
}

interface ProviderInfo {
  name: string;
  description: string;
  chains: Chain[];
}

const WALLET_PROVIDERS: Record<WalletProvider, ProviderInfo> = {
  rainbowkit: {
    name: "RainbowKit",
    description: "Best UX for connecting wallets (recommended)",
    chains: ["evm"],
  },
  connectkit: {
    name: "ConnectKit",
    description: "Beautiful, customizable wallet connection UI",
    chains: ["evm"],
  },
  privy: {
    name: "Privy",
    description: "Email, social, and wallet login with embedded wallets",
    chains: ["evm", "solana"],
  },
  dynamic: {
    name: "Dynamic",
    description: "Multi-chain auth with embedded wallets and onramps",
    chains: ["evm", "solana"],
  },
  reown: {
    name: "Reown (AppKit)",
    description: "WalletConnect's official SDK (formerly Web3Modal)",
    chains: ["evm", "solana"],
  },
  thirdweb: {
    name: "Thirdweb",
    description: "Full-stack web3 development platform with embedded wallets",
    chains: ["evm", "solana"],
  },
  getpara: {
    name: "GetPara (Capsule)",
    description: "Embedded wallets with MPC key management",
    chains: ["evm"],
  },
  "wallet-adapter": {
    name: "Solana Wallet Adapter",
    description: "Standard Solana wallet connection (recommended)",
    chains: ["solana"],
  },
};

const CHAINS: Record<Chain, { name: string; description: string }> = {
  evm: {
    name: "Ethereum (EVM)",
    description: "Ethereum, Polygon, Base, Arbitrum, etc.",
  },
  solana: {
    name: "Solana",
    description: "Solana blockchain",
  },
};

function exitWithError(message: string): never {
  console.error(`\n${pc.red("Error:")} ${message}\n`);
  console.error(`Run ${pc.cyan("create-nextjs-dapp --help")} for usage information.\n`);
  process.exit(1);
}

function parseArgs(): CLIOptions {
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


function getProvidersForChain(chain: Chain): WalletProvider[] {
  return (Object.entries(WALLET_PROVIDERS) as [WalletProvider, ProviderInfo][])
    .filter(([, info]) => info.chains.includes(chain))
    .map(([key]) => key);
}

function updatePackageJson(
  projectPath: string,
  projectName: string,
  chain: Chain,
  wallet: WalletProvider
) {
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
  const walletDeps = [
    // EVM
    "@rainbow-me/rainbowkit",
    "@privy-io/react-auth",
    "@privy-io/wagmi",
    "@dynamic-labs/ethereum",
    "@dynamic-labs/sdk-react-core",
    "@dynamic-labs/wagmi-connector",
    "@reown/appkit",
    "@reown/appkit-adapter-wagmi",
    "thirdweb",
    "@getpara/react-sdk",
    "connectkit",
    "wagmi",
    "viem",
    // Solana
    "@dynamic-labs/solana",
    "@reown/appkit-adapter-solana",
    "@solana/web3.js",
    "@solana/wallet-adapter-react",
    "@solana/wallet-adapter-react-ui",
    "@solana/wallet-adapter-wallets",
  ];

  walletDeps.forEach((dep) => {
    delete pkg.dependencies[dep];
  });

  // Add chain-specific base dependencies
  if (chain === "evm") {
    pkg.dependencies["wagmi"] = "^2.19.5";
    pkg.dependencies["viem"] = "^2.44.4";
  } else if (chain === "solana") {
    pkg.dependencies["@solana/web3.js"] = "^1.98.0";
    pkg.dependencies["@solana/wallet-adapter-react"] = "^0.15.35";
    pkg.dependencies["@solana/wallet-adapter-react-ui"] = "^0.9.35";
    pkg.dependencies["@solana/wallet-adapter-wallets"] = "^0.19.32";
  }

  // Add wallet-specific dependencies
  if (chain === "evm") {
    switch (wallet) {
      case "rainbowkit":
        pkg.dependencies["@rainbow-me/rainbowkit"] = "^2.2.10";
        break;
      case "connectkit":
        pkg.dependencies["connectkit"] = "^1.8.2";
        break;
      case "privy":
        pkg.dependencies["@privy-io/react-auth"] = "^2.4.1";
        pkg.dependencies["@privy-io/wagmi"] = "^1.0.2";
        break;
      case "dynamic":
        pkg.dependencies["@dynamic-labs/ethereum"] = "^4.0.0";
        pkg.dependencies["@dynamic-labs/sdk-react-core"] = "^4.0.0";
        pkg.dependencies["@dynamic-labs/wagmi-connector"] = "^4.0.0";
        break;
      case "reown":
        pkg.dependencies["@reown/appkit"] = "^1.6.1";
        pkg.dependencies["@reown/appkit-adapter-wagmi"] = "^1.6.1";
        break;
      case "thirdweb":
        pkg.dependencies["thirdweb"] = "^5.80.0";
        break;
      case "getpara":
        pkg.dependencies["@getpara/react-sdk"] = "^2.0.0";
        break;
    }
  } else if (chain === "solana") {
    switch (wallet) {
      case "wallet-adapter":
        // Standard Solana Wallet Adapter - no additional dependencies needed
        // Base Solana dependencies are already added above
        break;
      case "privy":
        pkg.dependencies["@privy-io/react-auth"] = "^2.4.1";
        break;
      case "dynamic":
        pkg.dependencies["@dynamic-labs/solana"] = "^4.0.0";
        pkg.dependencies["@dynamic-labs/sdk-react-core"] = "^4.0.0";
        break;
      case "reown":
        pkg.dependencies["@reown/appkit"] = "^1.6.1";
        pkg.dependencies["@reown/appkit-adapter-solana"] = "^1.6.1";
        break;
      case "thirdweb":
        pkg.dependencies["thirdweb"] = "^5.80.0";
        break;
    }
  }

  // Sort dependencies
  pkg.dependencies = Object.fromEntries(
    Object.entries(pkg.dependencies).sort(([a], [b]) => a.localeCompare(b))
  );

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

function updateEnvExample(
  projectPath: string,
  chain: Chain,
  wallet: WalletProvider
) {
  const envPath = join(projectPath, ".env.example");
  let envContent = "";

  const chainComment =
    chain === "evm" ? "# Contract configuration" : "# Program configuration";
  const addressVar =
    chain === "evm"
      ? "NEXT_PUBLIC_CONTRACT_ADDRESS="
      : "NEXT_PUBLIC_PROGRAM_ID=";

  switch (wallet) {
    case "rainbowkit":
    case "connectkit":
      envContent = `# WalletConnect Project ID
# 1. Go to https://cloud.walletconnect.com
# 2. Sign up or log in
# 3. Create a new project
# 4. Copy the Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

${chainComment}
# Your deployed smart contract address
${addressVar}
`;
      break;
    case "wallet-adapter":
      envContent = `# Solana Configuration
# No API key required for standard wallet adapter

${chainComment}
# Your deployed program address
${addressVar}
`;
      break;
    case "privy":
      envContent = `# Privy App ID
# 1. Go to https://dashboard.privy.io
# 2. Sign up or log in
# 3. Create a new app
# 4. Copy the App ID from Settings
NEXT_PUBLIC_PRIVY_APP_ID=

${chainComment}
# Your deployed ${chain === "evm" ? "smart contract" : "program"} address
${addressVar}
`;
      break;
    case "dynamic":
      envContent = `# Dynamic Environment ID
# 1. Go to https://app.dynamic.xyz
# 2. Sign up or log in
# 3. Create a new project
# 4. Go to Developer > SDK & API Keys
# 5. Copy the Environment ID
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=

${chainComment}
# Your deployed ${chain === "evm" ? "smart contract" : "program"} address
${addressVar}
`;
      break;
    case "reown":
      envContent = `# Reown (WalletConnect) Project ID
# 1. Go to https://cloud.reown.com
# 2. Sign up or log in
# 3. Create a new project
# 4. Copy the Project ID
NEXT_PUBLIC_REOWN_PROJECT_ID=

${chainComment}
# Your deployed ${chain === "evm" ? "smart contract" : "program"} address
${addressVar}
`;
      break;
    case "thirdweb":
      envContent = `# Thirdweb Client ID
# 1. Go to https://thirdweb.com/dashboard
# 2. Sign up or log in
# 3. Go to Settings > API Keys
# 4. Create a new API key
# 5. Copy the Client ID
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=

${chainComment}
# Your deployed ${chain === "evm" ? "smart contract" : "program"} address
${addressVar}
`;
      break;
    case "getpara":
      envContent = `# GetPara (Capsule) API Key
# 1. Go to https://developer.getpara.com
# 2. Sign up or log in
# 3. Create a new project
# 4. Copy the API Key
NEXT_PUBLIC_PARA_API_KEY=

${chainComment}
# Your deployed smart contract address
${addressVar}
`;
      break;
  }

  writeFileSync(envPath, envContent);
}

async function main() {
  console.clear();
  console.log();
  p.intro(pc.bold(pc.cyan("create-nextjs-dapp")));

  const cliOptions = parseArgs();

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

  const s = p.spinner();
  s.start(pc.cyan("◌") + " Creating your dApp...");

  // Copy base template
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
    if (cliOptions.git) {
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
    if (cliOptions.install) {
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
  if (!cliOptions.install) {
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

  p.outro(
    pc.bold(pc.green("✨ Happy building!")) +
      pc.dim(" — Star us on GitHub: github.com/0xmihirsahu/create-nextjs-dapp")
  );

  // Show update notification if available (after all output)
  notifier.notify({
    isGlobal: true,
    message: `Update available: ${pc.dim("{currentVersion}")} → ${pc.green("{latestVersion}")}\nRun ${pc.cyan("npm i -g create-nextjs-dapp")} to update`,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
