#!/usr/bin/env node

import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type Chain = "evm" | "solana";
type WalletProvider =
  | "rainbowkit"
  | "privy"
  | "dynamic"
  | "reown"
  | "thirdweb"
  | "getpara";

interface CLIOptions {
  projectName?: string;
  chain?: Chain;
  wallet?: WalletProvider;
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

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--wallet" || arg === "-w") {
      const value = args[++i]?.toLowerCase() as WalletProvider;
      if (value && Object.keys(WALLET_PROVIDERS).includes(value)) {
        options.wallet = value;
      }
    } else if (arg.startsWith("--wallet=")) {
      const value = arg.split("=")[1]?.toLowerCase() as WalletProvider;
      if (value && Object.keys(WALLET_PROVIDERS).includes(value)) {
        options.wallet = value;
      }
    } else if (arg === "--chain" || arg === "-c") {
      const value = args[++i]?.toLowerCase() as Chain;
      if (value && Object.keys(CHAINS).includes(value)) {
        options.chain = value;
      }
    } else if (arg.startsWith("--chain=")) {
      const value = arg.split("=")[1]?.toLowerCase() as Chain;
      if (value && Object.keys(CHAINS).includes(value)) {
        options.chain = value;
      }
    } else if (!arg.startsWith("-") && !options.projectName) {
      options.projectName = arg;
    }
  }

  return options;
}

function copyDir(src: string, dest: string, excludes: string[] = []) {
  mkdirSync(dest, { recursive: true });

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (excludes.includes(entry.name)) continue;

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, excludes);
    } else {
      cpSync(srcPath, destPath);
    }
  }
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

  // Project name
  let projectName = cliOptions.projectName;
  if (!projectName) {
    const result = await p.text({
      message: "What is your project named?",
      placeholder: "my-dapp",
      defaultValue: "my-dapp",
      validate: (value) => {
        if (!value) return "Project name is required";
        if (!/^[a-z0-9-]+$/.test(value)) {
          return "Project name can only contain lowercase letters, numbers, and hyphens";
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

  // Chain selection
  let chain = cliOptions.chain;
  if (!chain) {
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

  // Get available providers for selected chain
  const availableProviders = getProvidersForChain(chain);

  // Wallet provider
  let wallet = cliOptions.wallet;

  // Validate wallet is compatible with chain
  if (wallet && !availableProviders.includes(wallet)) {
    p.log.warn(
      `${WALLET_PROVIDERS[wallet].name} doesn't support ${CHAINS[chain].name}. Please choose another provider.`
    );
    wallet = undefined;
  }

  if (!wallet) {
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

  const projectPath = resolve(process.cwd(), projectName);

  // Check if directory exists
  if (existsSync(projectPath)) {
    p.log.error(`Directory ${pc.red(projectName)} already exists`);
    process.exit(1);
  }

  const s = p.spinner();
  s.start(pc.cyan("◌") + " Creating your dApp...");

  // Copy base template
  const templatesDir = join(__dirname, "..", "templates");
  const baseTemplate = join(templatesDir, "base");
  const chainTemplate = join(templatesDir, chain);
  const walletTemplate = join(templatesDir, chain, wallet);

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

  // Configuration summary
  console.log();
  console.log(pc.dim("  ────────────────────────────────────────"));
  console.log();
  console.log(`  ${pc.bold("Chain:")}    ${pc.cyan(CHAINS[chain].name)}`);
  console.log(`  ${pc.bold("Wallet:")}   ${pc.cyan(WALLET_PROVIDERS[wallet].name)}`);
  console.log(`  ${pc.bold("Path:")}     ${pc.dim(projectPath)}`);
  console.log();
  console.log(pc.dim("  ────────────────────────────────────────"));

  // Next steps with styled box
  const nextSteps = [
    `${pc.cyan("cd")} ${projectName}`,
    `${pc.cyan("npm")} install`,
    `${pc.cyan("npm")} run dev`,
  ];

  console.log();
  console.log(`  ${pc.bold(pc.white("Next steps:"))}`);
  console.log();
  nextSteps.forEach((step, i) => {
    console.log(`  ${pc.dim(`${i + 1}.`)} ${step}`);
  });
  console.log();

  p.outro(
    pc.bold(pc.green("✨ Happy building!")) +
      pc.dim(" — Star us on GitHub: github.com/0xmihirsahu/web3-ui-starter-pack")
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
